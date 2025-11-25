// src/reusable-components/EventCard.jsx
import React from "react";
import EventAttendButton from "./EventAttendButton.jsx";
import "../index.css";

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

export default function EventCard({
  event,
  currentUserId,
  onToggleAttend,
  onClick,
}) {
  if (!event) return null;

  const attendees = Array.isArray(event.attendees) ? event.attendees : [];
  const details = Array.isArray(event.details) ? event.details : [];
  const isAttending = currentUserId
    ? attendees.includes(currentUserId)
    : false;

  return (
    <div className="post event-card" onClick={onClick}>
      {event.cover ? (
        <img
          src={event.cover}
          alt={event.title || "Event"}
          className="event-cover"
        />
      ) : null}

      <div className="user-info event-header">
        <img
          src={event.hostAvatar}
          alt={event.hostName}
          className="avatar"
        />
        <div>
          <div className="event-title">
            {event.title || "Untitled event"}
          </div>
          <div className="event-meta">
            Hosted by <strong>{event.hostName}</strong>{" "}
            {event.date && <>· {formatMeetupTime(event.date)}</>}
          </div>
          {event.location && (
            <div className="event-location">📍 {event.location}</div>
          )}
          {event.groupName && (
            <div className="event-group">
              In group: {event.groupName}
            </div>
          )}
        </div>
      </div>

      <p className="event-description">{event.description}</p>

      {details.length > 0 && (
        <ul className="event-details">
          {details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}

      <div
        className="event-footer"
        onClick={(e) => e.stopPropagation()} // don't trigger card click
      >
        <EventAttendButton
          isAttending={isAttending}
          onClick={onToggleAttend}
        />
        <div>{attendees.length} going</div>
      </div>
    </div>
  );
}
