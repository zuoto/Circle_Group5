import React, { useEffect, useState } from "react";
import EventCard from "../reusable-components/EventCard";
import NewPostButton from "../reusable-components/NewPostButton.jsx";
import Modal from "../reusable-components/Modal.jsx";
import NewEventForm from "../reusable-components/NewEventForm.jsx";
import "../index.css";

const Parse = window.Parse;

// Helper: Convert Parse Event → UI event
function mapParseEvent(e) {
  const date = e.get("event_date");
  const iso = date ? date.toISOString() : null;

  const host = e.get("event_host");
  const group = e.get("parent_group");

  return {
    id: e.id,
    title: e.get("event_name"),
    description: e.get("event_info"),
    date: iso,
    location: "", // location skipped for now (schema uses GeoPoint)
    hostId: host ? host.id : null,
    groupId: group ? group.id : null,
    groupName: group ? group.get("group_name") : null,
    attendees: [],
    tags: [],
  };
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load existing events from backend
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
        setEvents(rows.map(mapParseEvent));
      } catch (err) {
        console.error("Error loading events:", err);
        setError("Failed to load events.");
      } finally {
        setLoading(false); 
      }
    }

    load();
  }, []);

  // Create new event → save to backend
  const handleCreateEvent = async (formData) => {
    try {
      const EventClass = Parse.Object.extend("Event");
      const event = new EventClass();

      // Required fields
      event.set("event_name", formData.title);
      event.set("event_info", formData.description);
      event.set("event_date", formData.date); // this is already a JS Date object from your form

      // Host = the logged-in user
      const host = Parse.User.current();
      if (host) {
        event.set("event_host", host);
      }

      // Skip group selection until UI has group picker
      // Skip location until UI supports converting text → GeoPoint

      const saved = await event.save();

      // Add it to the UI immediately
      setEvents((prev) => [...prev, mapParseEvent(saved)]);

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Same header as Groups */}
      <div className="feature-header">
        <div className="feature-names">Events</div>
        <NewPostButton
          onClick={() => setIsModalOpen(true)}
          hoverText="create event"
        />
      </div>

      {/* List of events */}
      <div className="main-content">
        {events.length === 0 ? (
          <p>No events yet</p>
        ) : (
          events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              currentUserId="u1"
              // join functionality can be wired later
            />
          ))
        )}
      </div>

      {/* Modal with NewEventForm */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NewEventForm
          onSubmit={handleCreateEvent}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
