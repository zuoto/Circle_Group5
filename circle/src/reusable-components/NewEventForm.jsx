import { useState } from "react";
import "../index.css";

export default function NewEventForm({
  groups = [],      // 👈 default so it never explodes
  onSubmit,
  onCancel,
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");   // yyyy-mm-dd
  const [time, setTime] = useState("");   // hh:mm
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = () => {
    if (!title || !date || !time) return;

    onSubmit({
      title,
      date: new Date(`${date}T${time}`),
      location,
      description,
      groupId,
      coverFile: imageFile,   // may be null, that’s fine
      attendees: [],
      tags: [],
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  return (
    <div className="new-post-form">
      <h2>Create New Event</h2>

      <input
        className="post-textarea"
        style={{ minHeight: 0 }}
        placeholder="Event title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div style={{ display: "flex", gap: "1rem" }}>
        <input
          className="post-textarea"
          style={{ minHeight: 0 }}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          className="post-textarea"
          style={{ minHeight: 0 }}
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      {/* Choose group (optional) */}
      <select
        className="post-textarea"
        style={{ minHeight: 0 }}
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
      >
        <option value="">No group</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>

      {/* Photo upload (optional) */}
      <input
        id="event-image"
        type="file"
        accept="image/*"
        className="hidden-file-input"
        onChange={handleFileChange}
      />
      <label htmlFor="event-image" className="styled-file-label">
        {imageFile ? `Photo: ${imageFile.name}` : "Add event photo (optional)"}
      </label>

      <input
        className="post-textarea"
        style={{ minHeight: 0 }}
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <textarea
        className="post-textarea"
        placeholder="What’s happening?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="form-actions">
        <button className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary-button" onClick={handleSubmit}>
          Create event
        </button>
      </div>
    </div>
  );
}
