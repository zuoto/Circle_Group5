function AttendeesTooltip({ participants, show }) {
  if (!show || participants.length === 0) {
    return null;
  }

  return (
    <div className="attendees">
      <div className="attendees-header">
        {participants.length} {participants.length === 1 ? "person" : "people"}{" "}
        in:
      </div>
      {participants.map((participant) => (
        <div key={participant.id} className="tooltip-attendee">
          {participant.get("user_firstname")} {participant.get("user_surname")}
        </div>
      ))}
    </div>
  );
}

export default AttendeesTooltip;
