import { useState } from "react";

export default function ImInButton({
  postId,
  initialJoined = false,
  currentUserId,
  onToggle,
  onMouseEnter,
  onMouseLeave,
}) {
  const [joined, setJoined] = useState(initialJoined);
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (isLoading) return;

    if (isLoading) return;

    try {
      const Parse = window.Parse;
      const PostClass = Parse.Object.extend("Post");
      const query = new Parse.Query(PostClass);
      const post = await query.get(postId);

      const currentUser = Parse.User.current();
      const participants = post.get("participants") || [];

      if (joined) {
        const updatedParticipants = participants.filter(
          (p) => p.id !== currentUser.id
        );
        post.set("participants", updatedParticipants);
      } else {
        post.addUnique("participants", currentUser);
      }

      await post.save();

      setJoined(!joined);
      if (onToggle) onToggle(!joined);
    } catch (error) {
      console.error("Error updating participants:", error);
      alert("Failed to update. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={joined ? "primary-button-joined" : "primary-button"}
      onClick={handleClick}
      aria-pressed={joined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={isLoading}
    >
      {isLoading ? "..." : joined ? "You're in!" : "I'm in!"}
    </button>
  );
}
