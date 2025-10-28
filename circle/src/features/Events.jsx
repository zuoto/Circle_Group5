import React, { useState, useMemo } from "react";
import { mockEvents } from "../mock-data/mock-data-events/MockEvents.jsx";
import { users } from "../mock-data/mock-data-user/MockDataUsers.jsx";
import EventCard from "../reusable-components/EventCard.jsx";


const withPeople = (event) => ({
  ...event,
  host: users.find((u) => u.id === event.hostId),
  attendeeObjects: event.attendees
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean),
});

export default function Events() {

  const currentUserId = "u1";

  // Prepare enriched events (attach host/attendee objects once)
  const [events, setEvents] = useState(mockEvents.map(withPeople));
  console.log("Events mounted. mockEvents:", mockEvents);
  console.log("Events state:", events);
  // Simple search across text fields + tags + location
  const [query, setQuery] = useState("");
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

  // Toggle "I'm in" — mirrors Post/ImInButton behavior
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
        // Re-attach host/attendee objects so the footer stays correct
        .map(withPeople)
    );
  };

  return (
    <div className="page-wrapper">
      {/* Matches Feed’s section header */}
      <div className="feature-names">Events</div>


      {/* Same content wrapper as Feed */}
      <div className="main-content">
        {filtered.map((e) => (
          <EventCard
            key={e.id}
            event={e}
            isAttending={e.attendees.includes(currentUserId)}
            onToggleAttend={() => toggleAttend(e.id)}
          />
        ))}

        {/* Empty state */}
        {!filtered.length && <p className="long-text">No events match your search.</p>}
      </div>
    </div>
  );
}

