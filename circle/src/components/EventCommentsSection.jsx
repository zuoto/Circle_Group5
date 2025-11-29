// src/components/EventCommentsSection.jsx
import { useEffect, useState } from "react";
import Comment from "../reusable-components/Comment.jsx";
import EventCommentButton from "../reusable-components/EventCommentButton.jsx";

const Parse = window.Parse;

export default function EventCommentsSection({ eventId }) {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");

  useEffect(() => {
    if (!eventId) return;

    async function loadComments() {
      setLoadingComments(true);
      try {
        const EventCommentClass = Parse.Object.extend("EventComments");
        const query = new Parse.Query(EventCommentClass);

        const eventPtr = new Parse.Object("Event");
        eventPtr.id = eventId;

        query.equalTo("parent_event", eventPtr);
        query.include("comment_author");
        query.ascending("createdAt");

        const rows = await query.find();
        setComments(rows);
      } catch (err) {
        console.error("Error loading event comments:", err);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    }

    loadComments();
  }, [eventId]);

  const handleCommentAdded = (savedComment) => {
    setComments((prev) => [...prev, savedComment]);
    setNewCommentText("");
  };

  return (
    <div className="comment-section">
      <h3>Comments</h3>

      {loadingComments && <p>Loading comments...</p>}

      {!loadingComments && comments.length === 0 && (
        <p>No comments yet. Be the first.</p>
      )}

      {!loadingComments &&
        comments.map((c) => <Comment key={c.id} comment={c} />)}

      <div className="comment-form" style={{ marginTop: "16px" }}>
        <textarea
          className="post-textarea"
          style={{ minHeight: "80px" }}
          placeholder="Write a comment..."
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "8px",
          }}
        >
          <EventCommentButton
            eventId={eventId}
            commentText={newCommentText}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      </div>
    </div>
  );
}
