import React, { useState } from "react";

export default function CreateEvent({ onSave, onClose, defaultHostId }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(""); // datetime-local
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState(""); // comma separated
  const [details, setDetails] = useState(""); // one per line
  const [cover, setCover] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date || !location) return; // minimal required

    const newEvent = {
      id: `e${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      details: details
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      date: new Date(date).toISOString(),
      location: location.trim(),
      hostId: defaultHostId,
      attendees: [],
      tags: tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      cover: cover.trim() || undefined,
    };

    onSave(newEvent);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-body" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
          Create event
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "grid", gap: 10, marginTop: 12 }}
        >
          <label className="long-text">
            Title
            <input
              className="comment-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="long-text">
            Date & time
            <input
              className="comment-input"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>

          <label className="long-text">
            Location
            <input
              className="comment-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </label>

          <label className="long-text">
            Description
            <textarea
              className="comment-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label className="long-text">
            Details (one per line)
            <textarea
              className="comment-input"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </label>

          <label className="long-text">
            Tags (comma-separated)
            <input
              className="comment-input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="music, party"
            />
          </label>

          <label className="long-text">
            Cover image URL (optional)
            <input
              className="comment-input"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="/events/boardgames.jpeg"
            />
          </label>

          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 4,
            }}
          >
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
