import React, { useState, useMemo, useEffect } from "react";
import { mockEvents } from "../mock-data/mock-data-events/MockEvents.jsx";
import EventTile from "../reusable-components/EventTile.jsx";
import EventCard from "../reusable-components/EventCard.jsx";
import NewPostButton from "../reusable-components/NewPostButton.jsx";
import NewEventForm from "../reusable-components/NewEventForm.jsx";
import "../index.css";


const withDefaults = (e) => ({ ...e, attendees: e.attendees || [], tags: e.tags || [] });

export default function Events() {
  const currentUserId = "u1";
  const [events, setEvents] = useState(mockEvents.map(withDefaults));
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { 
        setSelected(null);
        setShowComposer(false);
      }
      };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleCreate = (newEvent) => {
  const id = "e" + (events.length + 1); 
    setEvents([{ id, hostId: currentUserId, cover: null, ...newEvent }, ...events]);
    setShowComposer(false);
  };

  const toggleAttend = (eventId) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? {
              ...e,
              attendees: e.attendees.includes(currentUserId)
                ? e.attendees.filter((uid) => uid !== currentUserId)
                : [...e.attendees, currentUserId],
            }
          : e
      )
    );
  };
  const visibleEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      (e.location || "").toLowerCase().includes(q) ||
      (e.description || "").toLowerCase().includes(q)
    );
  }, [events, query]);

  return (
    <main className="page-wrapper">
      <div className="feature-header" style={{ justifyContent: "space-between", width: "60vw" }}>
      {/* Header */}
      <div className="feature-names">Events</div>
        <NewPostButton onClick={() => setShowComposer(true)} />
      </div>

      <div style={{ margin: "1rem auto", width: "60vw" }}>
        <input
          type="text"
          placeholder="Search events..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <section className="main-content" style={{ width: "60vw" }}>
        {events.map((ev) => (
          <EventTile key={ev.id} event={ev} onOpen={setSelected} />
        ))}
        </section>
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div
            className="modal-body"
            onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close">×</button>
            <EventCard
              event={selected}
              currentUserId={currentUserId}
              onToggleAttend={() => toggleAttend(selected.id)}
            />
            </div>
        </div>
      )}
      {showComposer && (
        <div className="modal-backdrop" onClick={() => setShowComposer(false)}>
          <div className="modal-body" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowComposer(false)} aria-label="Close">×</button>
            <NewEventForm onSubmit={handleCreate} onCancel={() => setShowComposer(false)} />
          </div>
        </div>
      )}
    </main>
  );
}