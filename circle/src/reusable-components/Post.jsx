import { useState } from "react";
import Comment from "./Comment.jsx";
import CommentButton from "./CommentButton.jsx";
import ImInButton from "./ImInButton.jsx";

// Helper time formatting functions (keep these outside)
const formatMeetupTime = (dateString) => {
  const date = new Date(dateString);
  const time = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  const day = date.toLocaleDateString('en-US', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric' 
  });
  return `${time} on ${day}`;
};

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

function Post({ post }) {
  const [joined, setJoined] = useState(false); 

  return (
    <div>
      <div className="post">
    
        <div className="post-meeting-time">
          {formatMeetupTime(post.meetup.date)}
        </div>

        <div className="user-info">
          <img
            src={post.author?.avatar}
            alt="User Avatar"
            className="avatar"
          />
          <div className="name-and-timestamp-wrapper">
            <div className="name">
              {post.author?.name} {post.author?.surname}
            </div>
            <div className="timestamp">
              {formatTimeAgo(post.createdAt)}
            </div>
          </div>
        </div>

        <div className="content">
          <div className="long-text">
            {post.content}
          </div>
        </div>

        <div className="comment-row">
          <input
            className="comment-input"
            placeholder="Write a comment..."
          />
          <div className="actions">
            <CommentButton />
            <ImInButton
              joined={joined}
              onToggle={(newVal) => setJoined(newVal)}
            />
          </div>
        </div>

        <div className="comment-section">
          {post.comments?.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Post;