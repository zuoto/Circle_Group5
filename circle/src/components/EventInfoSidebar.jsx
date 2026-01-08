import { Link } from "react-router-dom";

export default function EventInfoSidebar({ event, isOwner, onDelete }) {
  if (!event) return null;

  const attendees = event.attendees || [];

  return (
    <>
      <h3 className="sidebar-header">Event details</h3>
      <div className="sidebar-box">
        <p>
          <strong>Hosted by:</strong> {event.hostName}
        </p>

        {event.date && (
          <p>
            <strong>When:</strong>{" "}
            {new Date(event.date).toLocaleString("en-GB", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}

        {event.location && (
          <p>
            <strong>Where:</strong> {event.location}</p>
        )}

        {event.groupName && (
          <p>
            <strong>Group:</strong>{" "}
            <Link to={`/groups/${event.groupId}`}>{event.groupName}</Link>
          </p>
        )}

        <hr className="sidebar-divider" />

        <p>
          <strong>Attendees:</strong> {attendees.length}
        </p>

        {attendees.length > 0 && (
          <ul className="sidebar-attendees">
            {attendees.slice(0, 5).map((a) => (
              <li key={a.id} className="sidebar-attendee-row">
                <img
                  src={a.avatar}
                  alt={a.name}
                  className="avatar-small"
                />
                <span>{a.name}</span>
              </li>
            ))}
            {attendees.length > 5 && (
              <li>and {attendees.length - 5} more…</li>
            )}
          </ul>
        )}

        {isOwner && (
          <>
            <hr className="sidebar-divider" />
            <button className="danger-button" onClick={onDelete}>
              Delete event
            </button>
          </>
        )}
      </div>
    </>
  );
}
