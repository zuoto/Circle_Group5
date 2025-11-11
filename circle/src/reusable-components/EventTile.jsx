import React from "react";
import { users } from "../mock-data/mock-data-user/MockDataUsers.jsx";

const formatMeetupTime = (dateString) => {
  const d = new Date(dateString);
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const day = d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${time} on ${day}`;
};

export default function EventTile({ event, onOpen }) {
  const host = users.find((u) => u.id === event.hostId);
  const attendees = Array.isArray(event.attendees) ? event.attendees : [];
  const tags = Array.isArray(event.tags) ? event.tags.slice(0, 3) : [];

  return (
    <button
      type="button"
      className="event-tile group-card"
      onClick={() => onOpen(event)}
      aria-label={`Open event ${event.title}`}
    >
      <div className="event-time">{formatMeetupTime(event.date)}</div>

      <div className="event-header">
        <img
          src={host?.avatar || "/avatar/default.jpg"}
          alt={host?.name || "Host"}
          className="event-avatar"
        />
        <div>
          <div className="event-title">{event.title}</div>
          <div className="event-location">📍 {event.location}</div>
        </div>
      </div>

      {event.description && (
        <p className="event-description">
          {event.description.length > 110
            ? event.description.slice(0, 107) + "…"
            : event.description}
        </p>
      )}

      <div className="event-footer">
        <span>{attendees.length} going</span>
        {tags.map((t) => (
          <span key={t} className="event-tag">
            {t}
          </span>
        ))}
        <span className="view-details">View details →</span>
      </div>
    </button>
  );
}
