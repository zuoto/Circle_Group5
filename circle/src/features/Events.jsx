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
  const [selected, setSelected] = useState(null);

  // Load existing events from backend
  useEffect(() => {
    async function load() {
      const rows = await getEvents();

      const mapped = rows.map((e) => ({
        id: e.objectId,
        title: e.event_name,
        description: e.event_info,
        date: e.event_date ? new Date(e.event_date.iso) : null,
        location: "",
        hostId: "u2",
        attendees: [],
        tags: [],
      }));

      setEvents(mapped);
      setSelected(mapped[0] || null);
    }

    load();
  }, []);

  if (events.length === 0) return <p>No events yet</p>;

  return (
    <div className="events-layout">
      <div className="events-list">
        {events.map((ev) => (
          <EventTile key={ev.id} event={ev} onOpen={() => setSelected(ev)} />
        ))}
      </div>

      <div className="events-detail">
        <EventCard event={selected} currentUserId="u1" />
      </div>
    </div>
  );
}
