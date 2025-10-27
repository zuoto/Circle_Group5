const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
};

export default function Comment({comment}) {
  return (
    <div className="comment">
      <div className="comment-user-info">
        <img
          src={comment.author?.avatar}
          alt="User Avatar"
          className="comment-avatar"
        />
        <div className="name-and-timestamp-wrapper">
          <div className="comment-name">{comment.author?.name} {comment.author?.surname}</div>
          <div className="comment-timestamp">{formatTimeAgo(comment.createdAt)}</div>
        </div>
      </div>
      <div className="comment-content">
        <div className="long-text">
          {comment.content}
        </div>
      </div>
    </div>
  );
}
