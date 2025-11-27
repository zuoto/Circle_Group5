import { useState } from "react";

export default function EventCommentButton({
  eventId,
  commentText,
  onCommentAdded,
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (isLoading || !commentText.trim()) return;

    setIsLoading(true);
    try {
      const Parse = window.Parse;
      const EventClass = Parse.Object.extend("Event");
      const EventCommentClass = Parse.Object.extend("EventComments");

      const eventQuery = new Parse.Query(EventClass);
      const eventObj = await eventQuery.get(eventId);

      const currentUser = Parse.User.current();

      const comment = new EventCommentClass();
      comment.set("comment_author", currentUser);
      comment.set("text", commentText);
      comment.set("parent_event", eventObj);

      const saved = await comment.save();

      if (onCommentAdded) {
        onCommentAdded(saved);
      }
    } catch (error) {
      console.error("Error adding event comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      className="secondary-button"
      onClick={handleClick}
      disabled={isLoading || !commentText.trim()}
    >
      {isLoading ? "..." : "Comment"}
    </button>
  );
}
