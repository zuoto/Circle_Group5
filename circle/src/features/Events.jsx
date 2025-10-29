import React, { useState, useMemo, useEffect } from "react";
import { mockEvents } from "../mock-data/mock-data-events/MockEvents.jsx";
import { users } from "../mock-data/mock-data-user/MockDataUsers.jsx";
import EventTile from "../reusable-components/EventTile.jsx";
import EventCard from "../reusable-components/EventCard.jsx";
import CreateEvent from "../reusable-components/CreateEvent.jsx";


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
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
  const open = Boolean(selected) || showCreate;
  document.body.classList.toggle("modal-open", open);
  return () => document.body.classList.remove("modal-open");
  }, [selected, showCreate]);

  const handleCreate = (evt) => {
  setEvents(prev => [withPeople(evt), ...prev]);
  setShowCreate(false);
  setSelected(withPeople(evt));
};

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

      {/* Header */}
      <div className="feature-names" style={{ marginBottom: 8 }}>
        <h2 style={{ margin: 0, textAlign: "center" }}>Events</h2>
      </div>

      {/* Search bar + Create button row */}
      <div
        className="main-content"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <input
          className="comment-input"
          placeholder="Search events by title, tags or location…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flexGrow: 1 }}
        />
        <button
          className="create-button"
          onClick={() => setShowCreate(true)}
        >
          + Create
        </button>
      </div>

      {/* Event tiles */}
      <div className="main-content">
        {filtered.map((e) => (
          <div key={e.id} className="post-card">
            <EventTile event={e} onOpen={setSelected} />
          </div>
        ))}
        {!filtered.length && (
          <p className="long-text">No events match your search.</p>
        )}
      </div>

      {/* Event details modal */}
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
            <button
              className="secondary-button"
              onClick={() => setSelected(null)}
              style={{ marginTop: 8 }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create Event modal */}
      {showCreate && (
        <CreateEvent
          defaultHostId={currentUserId}
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div> 
  ); 
} 