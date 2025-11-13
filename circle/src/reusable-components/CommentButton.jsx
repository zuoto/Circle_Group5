import { useState } from "react";

export default function CommentButton({ postId, commentText, onCommentAdded }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    if (isLoading || !commentText.trim()) return;

    setIsLoading(true);
    try {
      const Parse = window.Parse;
      const PostClass = Parse.Object.extend("Post");
      const CommentClass = Parse.Object.extend("Comments");

      const postQuery = new Parse.Query(PostClass);
      const post = await postQuery.get(postId);

      const currentUser = Parse.User.current();

      const comment = new CommentClass();
      comment.set("comment_author", currentUser);
      comment.set("text", commentText);
      comment.set("comment_post", post);

      await comment.save();

      if (onCommentAdded) {
        onCommentAdded(comment);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
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
