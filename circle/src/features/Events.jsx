import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../reusable-components/EventCard";
import NewPostButton from "../reusable-components/NewPostButton.jsx";
import Modal from "../reusable-components/Modal.jsx";
import NewEventForm from "../reusable-components/NewEventForm.jsx";
import "../index.css";
import { mapParseEvent } from "../utils/eventHelpers.js";

const Parse = window.Parse;

export default function Events() {
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);        // 👈 list of groups for the form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const currentUser = Parse.User.current();
  const currentUserId = currentUser ? currentUser.id : null;

  // Load events from backend
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

  // Load groups for the "choose group" dropdown
  useEffect(() => {
    async function loadGroups() {
      try {
        const GroupClass = Parse.Object.extend("Group");
        const query = new Parse.Query(GroupClass);
        query.ascending("group_name");

        const rows = await query.find();
        const mappedGroups = rows.map((g) => ({
          id: g.id,
          name: g.get("group_name") || "Unnamed group",
        }));

        setGroups(mappedGroups);
      } catch (err) {
        console.error("Error loading groups for event form:", err);
        setGroups([]);
      }
    }

    loadGroups();
  }, []);

  // Toggle attendance using Relation<_User> event_attendees
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

      // Update local state
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

  // Create new event
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

      // cover file (browser File → Parse.File)
      if (formData.coverFile) {
        const parseFile = new Parse.File(
          formData.coverFile.name,
          formData.coverFile
        );
        await parseFile.save();
        event.set("event_cover", parseFile);
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
          groups={groups}                    // pass groups into the form
          onSubmit={handleCreateEvent}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
