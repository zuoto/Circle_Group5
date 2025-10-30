import React from "react";
import { users } from "../mock-data/mock-data-user/MockDataUsers.jsx";
import ImInButton from "./ImInButton.jsx";

const formatMeetupTime = (dateString) => {
  const date = new Date(dateString);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const day = date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${time} on ${day}`;
};

export default function EventCard({ event, currentUserId, onToggleAttend }) {
  if (!event) return null;
  const host = users.find((u) => u.id === event.hostId);
  const attendees = Array.isArray(event.attendees) ? event.attendees : [];
  const details = Array.isArray(event.details) ? event.details : [];
  const isAttending = currentUserId ? attendees.includes(currentUserId) : false;

  return (
    <div className="post">
      {event.cover ? (
        <img
          src={event.cover}
          alt={event.title || "Event"}
          className="event-cover"
        />
      ) : null}

      <div className="user-info event-header">
        <img
          src={host?.avatar || "/avatar/default.jpg"}
          alt={host?.name || "Host"}
          className="avatar"
        />
        <div>
          <div className="event-title">{event.title || "Untitled event"}</div>
          <div className="event-meta">
            Hosted by <strong>{host?.name || "Unknown"}</strong> ·{" "}
            {formatMeetupTime(event.date)}
          </div>
          {event.location && (
            <div className="event-location">📍 {event.location}</div>
          )}
        </div>
      </div>

      <p className="event-desccription">{event.description}</p>

      {details.length > 0 && (
        <ul className="event.details">
          {details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}

      <div className="event-footer">
        <ImInButton isAttending={isAttending} onClick={onToggleAttend} />
        <div>{attendees.length} going</div>
      </div>
    </div>
  );
}
