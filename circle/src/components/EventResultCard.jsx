import { useNavigate } from "react-router-dom";

function EventResultCard({ event }) {
  const navigate = useNavigate();
  const currentUser = window.Parse.User.current();

  const host = event.get("event_host");
  const eventDate = event.get("event_date");
  const parentGroup = event.get("parent_group");
  const eventName = event.get("event_name");
  const eventInfo = event.get("event_info");

  const formatDate = (date) => {
    if (!date) return "Date TBA";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="group-card clickable"
      onClick={() => navigate(`/events/${event.id}`)}
    >
      <div className="group-card-content">
        <div className="event-time-badge">{formatDate(eventDate)}</div>
        <h3 className="event-title">{eventName}</h3>
        {eventInfo && (
          <p className="event-description">
            {eventInfo.substring(0, 100)}
            {eventInfo.length > 100 && "..."}
          </p>
        )}
        <div className="card-footer-row">
          <span>
            by {host?.get("user_firstname")} {host?.get("user_surname")}
          </span>
          {parentGroup && (
            <span className="event-group-badge">
              {parentGroup.get("group_name")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventResultCard;
