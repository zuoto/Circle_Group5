import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../reusable-components/EventCard";
import NewPostButton from "../reusable-components/NewPostButton.jsx";
import Modal from "../reusable-components/Modal.jsx";
import NewEventForm from "../reusable-components/NewEventForm.jsx";
import "../index.css";
import profilepic from "../../public/avatars/default.png";

const Parse = window.Parse;

// Map Parse Event → UI object
function mapParseEvent(e) {
  const date = e.get("event_date");
  const iso = date ? date.toISOString() : null;

  const host = e.get("event_host");
  const group = e.get("parent_group");
  const coverFile = e.get("event_cover");

  let hostAvatar = profilepic;
  if (host) {
    const pic = host.get("profile_picture");
    if (pic) {
      // handle both "stored as URL string" and "stored as Parse.File"
      if (typeof pic === "string") {
        hostAvatar = pic;
      } else if (typeof pic.url === "function") {
        hostAvatar = pic.url();
      }
    }
  }

  return {
    id: e.id,
    title: e.get("event_name"),
    description: e.get("event_info"),
    date: iso,
    location: e.get("event_location_text") || "",

    hostId: host ? host.id : null,
    hostName: host ? host.get("user_firstname") || "Unknown" : "Unknown",
    hostAvatar, 
    
    groupId: group ? group.id : null,
    groupName: group ? group.get("group_name") : null,

    cover: coverFile ? coverFile.url() : null,

    attendees: [],
    tags: [],
  };
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);         // 👈 NEW
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const currentUser = Parse.User.current();
  const currentUserId = currentUser ? currentUser.id : null;

  // Load events
  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setError(null);

      try {
        const EventClass = Parse.Object.extend("Event");
        const query = new Parse.Query(EventClass);

        query.include("event_host");
        query.include("parent_group");
        query.ascending("event_date");

        const rows = await query.find();
        const mapped = rows.map(mapParseEvent);
        setEvents(mapped);
      } catch (err) {
        console.error("Error loading events:", err);
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  // load groups for the select box in NewEventForm
  useEffect(() => {
    async function loadGroups() {
      try {
        const GroupClass = Parse.Object.extend("Group");
        const query = new Parse.Query(GroupClass);
        query.ascending("group_name");

        const rows = await query.find();
        const mapped = rows.map((g) => ({
          id: g.id,
          name: g.get("group_name"),
        }));
        setGroups(mapped);
      } catch (err) {
        console.error("Error loading groups:", err);
        setGroups([]);
      }
    }

    loadGroups();
  }, []);


  /* Toggle attendance using Relation<_User> event_attendees */
  const handleToggleAttend = async (eventId) => {
    if (!currentUserId) {
      alert("You need to be logged in to join an event.");
      return;
    }

    try {
      const existing = events.find((ev) => ev.id === eventId);
      const alreadyAttending = existing
        ? (existing.attendees || []).includes(currentUserId)
        : false;

      // Fetch event from Parse
      const EventClass = Parse.Object.extend("Event");
      const query = new Parse.Query(EventClass);
      const eventObj = await query.get(eventId);

      const relation = eventObj.relation("event_attendees");
      const user = Parse.User.current();

      if (alreadyAttending) {
        relation.remove(user);
      } else {
        relation.add(user);
      }

      await eventObj.save();

      // Update local state so UI reflects this
      setEvents((prev) =>
        prev.map((ev) => {
          if (ev.id !== eventId) return ev;

          const current = ev.attendees || [];
          let newAttendees;

          if (alreadyAttending) {
            newAttendees = current.filter((id) => id !== currentUserId);
          } else {
            newAttendees = current.includes(currentUserId)
              ? current
              : [...current, currentUserId];
          }

          return {
            ...ev,
            attendees: newAttendees,
          };
        })
      );
    } catch (err) {
      console.error("Error updating attendance:", err);
      alert("Failed to update attendance. Please try again.");
    }
  };

  /* Create new event */
  const handleCreateEvent = async (formData) => {
  try {
    const EventClass = Parse.Object.extend("Event");
    const event = new EventClass();

    event.set("event_name", formData.title);
    event.set("event_info", formData.description);
    event.set("event_date", formData.date);
    event.set("event_location_text", formData.location);

    const host = Parse.User.current();
    if (host) {
      event.set("event_host", host);
    }

    // optional: connect to group if your form sends groupId
    if (formData.groupId) {
      const GroupClass = Parse.Object.extend("Group");
      const groupPtr = new GroupClass();
      groupPtr.id = formData.groupId;
      event.set("parent_group", groupPtr);
    }

    // ✅ Properly handle image file from NewEventForm
    if (formData.coverFile) {
      // formData.coverFile is a browser File
      const parseFile = new Parse.File(
        formData.coverFile.name,
        formData.coverFile
      );

      // Save the file first (Parse will upload it)
      await parseFile.save();

      // Attach it to the event
      event.set("event_cover", parseFile);
    }

    const saved = await event.save();

    // Add to local state so it shows up immediately
    setEvents((prev) => [...prev, mapParseEvent(saved)]);
    setIsModalOpen(false);
  } catch (err) {
    console.error("Error creating event:", err);
    alert("Failed to create event.");
  }
};


  return (
    <div className="page-wrapper">
      <div className="feature-header">
        <div className="feature-names">Events</div>
        <NewPostButton
          onClick={() => setIsModalOpen(true)}
          hoverText="create event"
        />
      </div>

      <div className="main-content">
        {loading && <p>Loading events...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && events.length === 0 && (
          <p>No events yet.</p>
        )}

        {!loading &&
          !error &&
          events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              currentUserId={currentUserId}
              onToggleAttend={() => handleToggleAttend(ev.id)}
              onClick={() => navigate(`/events/${ev.id}`)}
              onHostClick={() => {
                if (ev.hostId) {
                  navigate(`/users/${ev.hostId}`);  
                }
              }}
            />
          ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NewEventForm
          groups={groups} 
          onSubmit={handleCreateEvent}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
