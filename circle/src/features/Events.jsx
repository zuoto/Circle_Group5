import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../reusable-components/EventCard";
import NewPostButton from "../reusable-components/NewPostButton.jsx";
import Modal from "../reusable-components/Modal.jsx";
import NewEventForm from "../reusable-components/NewEventForm.jsx";
import "../index.css";

const Parse = window.Parse;

/* Map Parse Event → UI object */
function mapParseEvent(e) {
  const date = e.get("event_date");
  const iso = date ? date.toISOString() : null;

  const host = e.get("event_host");
  const group = e.get("parent_group");
  const coverFile = e.get("event_cover");

  return {
    id: e.id,
    title: e.get("event_name"),
    description: e.get("event_info"),
    date: iso,
    location: e.get("event_location") || "",

    hostId: host ? host.id : null,
    hostName: host ? host.get("user_firstname") || "Unknown" : "Unknown",
    hostAvatar: host
      ? host.get("avatar_url") || "/avatar/default.jpg"
      : "/avatar/default.jpg",

    groupId: group ? group.id : null,
    groupName: group ? group.get("group_name") : null,

    cover: coverFile ? coverFile.url() : null,

    // purely frontend: we track attendees as an array of userIds for this session
    attendees: [],
    tags: [],
  };
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const currentUser = Parse.User.current();
  const currentUserId = currentUser ? currentUser.id : null;

  /* Load events from backend */
  useEffect(() => {
    async function load() {
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

    load();
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
      event.set("event_location", formData.location);

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

      // optional: cover file if your form sends coverFile (Parse.File or File)
      if (formData.coverFile instanceof Parse.File) {
        event.set("event_cover", formData.coverFile);
      }

      const saved = await event.save();

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
            />
          ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NewEventForm
          onSubmit={handleCreateEvent}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
