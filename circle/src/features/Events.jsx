import React, { useState, useMemo, useEffect } from "react";
import { mockEvents } from "../mock-data/mock-data-events/MockEvents.jsx";
import { users } from "../mock-data/mock-data-user/MockDataUsers.jsx";
import EventTile from "../reusable-components/EventTile.jsx";
import EventCard from "../reusable-components/EventCard.jsx";

const withPeople = (event) => ({
  ...event,
  host: users.find((u) => u.id === event.hostId),
  attendeeObjects: event.attendees.map((id) => users.find((u) => u.id === id)).filter(Boolean),
});

export default function Events() {
  const currentUserId = "u1";
  const [events, setEvents] = useState(mockEvents.map(withPeople));
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [events, query]);

  const toggleAttend = (id) => {
    setEvents((prev) =>
      prev
        .map((e) => {
          if (e.id !== id) return e;
          const isIn = e.attendees.includes(currentUserId);
          return {
            ...e,
            attendees: isIn
              ? e.attendees.filter((uid) => uid !== currentUserId)
              : [...e.attendees, currentUserId],
          };
        })
        .map(withPeople)
    );
    // keep modal open and synced if open
    setSelected((curr) => (curr && curr.id === id ? withPeople(
      {
        ...events.find(e => e.id === id),
        attendees: (events.find(e => e.id === id).attendees.includes(currentUserId)
          ? events.find(e => e.id === id).attendees.filter(uid => uid !== currentUserId)
          : [...events.find(e => e.id === id).attendees, currentUserId]
        )
      }
    ) : curr));
  };

  return (
    <div className="page-wrapper">
      <div className="feature-names">Events</div>

      {/* simple search bar (optional) */}
      <div className="main-content" style={{ marginBottom: 12 }}>
        <input
          className="comment-input"
          placeholder="Search events by title, tags or location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <div className="main-content">
        {filtered.map((e) => (
          <div key={e.id} className="post-card">
            <EventTile event={e} onOpen={setSelected} />
          </div>
        ))}
        {!filtered.length && <p className="long-text">No events match your search.</p>}
      </div>

      {/* Modal with EventCard (detail) */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div
            className="modal-body"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <EventCard
              event={selected}
              currentUserId={currentUserId}
              onToggleAttend={() => toggleAttend(selected.id)}
            />
            <button className="secondary-button" onClick={() => setSelected(null)} style={{ marginTop: 8 }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
