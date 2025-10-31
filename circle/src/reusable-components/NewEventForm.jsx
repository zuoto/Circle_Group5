import { useState } from "react";

export default function NewEventForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const [date, setDate]   = useState("");   // yyyy-mm-dd
  const [time, setTime]   = useState("");   // hh:mm
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!title || !date || !time) return; 
    onSubmit({
      title,
      date: new Date(`${date}T${time}`),
      location,
      description,
      attendees: [],
      tags: [],
    });
  };

  return (
    <div className="new-post-form">
      <h2>Create New Event</h2>

      <input
        className="post-textarea" style={{ minHeight: 0 }}
        placeholder="Event title"
        value={title} onChange={(e) => setTitle(e.target.value)}
      />

      <div style={{ display: "flex", gap: "1rem" }}>
        <input className="post-textarea" style={{ minHeight: 0 }} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="post-textarea" style={{ minHeight: 0 }} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>

      <input
        className="post-textarea" style={{ minHeight: 0 }}
        placeholder="Location"
        value={location} onChange={(e) => setLocation(e.target.value)}
      />

      <textarea
        className="post-textarea"
        placeholder="What’s happening?"
        value={description} onChange={(e) => setDescription(e.target.value)}
      />

      <div className="form-actions">
        <button className="secondary-button" onClick={onCancel}>Cancel</button>
        <button className="primary-button" onClick={handleSubmit}>Create event</button>
      </div>
    </div>
  );
}
