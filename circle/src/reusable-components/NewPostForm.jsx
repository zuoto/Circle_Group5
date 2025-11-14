import React from "react";
import createPost from "../services/feed/createPost.js";

export default function NewPostForm({ onSubmit, onCancel }) {
  const [postContent, setPostContent] = React.useState("");
  const [hangoutTime, setHangoutTime] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleSubmit = async () => {
    if (!postContent.trim()) {
      setError("Post content cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createPost(postContent, hangoutTime);
      setPostContent("");
      setHangoutTime("");
      onSubmit();
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-post-form">
      <h2>Create New Post</h2>

      {error && <p className="error-message">{error}</p>}

      <textarea
        className="post-textarea"
        placeholder="When do you have time to meet your friends?"
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        disabled={loading}
      />

      <input
        type="datetime-local"
        className="post-timestamp"
        value={hangoutTime}
        onChange={(e) => setHangoutTime(e.target.value)}
        disabled={loading}
      />

      <div className="form-actions">
        <button
          className="secondary-button"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          className="primary-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
