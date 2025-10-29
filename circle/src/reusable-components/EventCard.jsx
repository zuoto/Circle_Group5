import React from "react";
import { users } from "../mock-data/mock-data-user/MockDataUsers.jsx";
import ImInButton from "./ImInButton.jsx"; 

const formatMeetupTime = (dateString) => {
  const date = new Date(dateString);
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const day = date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${time} on ${day}`;
};

export default function EventCard({ event, currentUserId, onToggleAttend }) {
  const host = users.find((u) => u.id === event.hostId);
  const isAttending = event.attendees.includes(currentUserId);

  return (
    <div className="post">
      {event.cover && (
        <img src={event.cover} alt={event.title} className="event-cover" />
      )}

      <div className="user-info event-header">
        <img
          src={host?.avatar || "/avatar/default.jpg"}
          alt={host?.name || "Host"}
          className="avatar"
        />
        <div className="name-and-timestamp-wrapper">
          <div className="name">{event.title}</div>
          <div className="timestamp">
            Hosted by <strong>{host?.name || "Unknown"}</strong> ·{" "}
            {formatMeetupTime(event.date)}
          </div>
          <div className="timestamp">📍 {event.location}</div>
        </div>
      </div>

      <p className="long-text">{event.description}</p>

      {event.details && (
        <ul className="long-text">
          {event.details.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}

      <ImInButton
        isAttending={isAttending}
        onClick={onToggleAttend}
      />

      <div className="event-footer">
        {event.attendees.length} going
      </div>
    </div>
  );
}
