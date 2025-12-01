import React from "react";
import { Link } from "react-router-dom";

export default function EventHeaderSection({ event }) {
  return (
    <>
      {event.cover && (
        <div
          className="group-detail-cover-photo"
          style={{ backgroundImage: `url(${event.cover})` }}
        />
      )}

      <div className="group-header">
        <div className="user-info event-header">
          <Link
            to={event.hostId ? `/users/${event.hostId}` : "#"}
            onClick={(e) => {
              if (!event.hostId) e.preventDefault();
            }}
            className="user-link"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <img
              src={event.hostAvatar}
              alt={event.hostName}
              className="avatar"
            />
          </Link>
          <div>
            <h2 className="event-detail-title">{event.title}</h2>
            {event.groupName && event.groupId && (
              <div className="event-meta">
                In group{" "}
                <Link to={`/groups/${event.groupId}`}>
                  <strong>{event.groupName}</strong>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
