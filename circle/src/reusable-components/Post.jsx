import { useState } from "react";
import Comment from "./Comment.jsx";
import CommentButton from "./CommentButton.jsx";
import ImInButton from "./ImInButton.jsx";
import { users } from "../mock-data/mock-data-user/MockDataUsers.jsx";

// Helper time formatting functions
const formatMeetupTime = (dateString) => {
  const date = new Date(dateString);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const day = date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

function Post({ post, isGroupPost }) {
  const [joined, setJoined] = useState(false); 
  const author = users.find(u => u.id === post.authorId);
  const [showAttendees, setShowAttendees] = useState(false);
  const attendees =
    post.imIns?.map((id) => users.find((u) => u.id === id)).filter(Boolean) ||
    [];
  return (
    <>
      <div className="post">
        {!(isGroupPost && post.meetup) && (
          <div className="post-meeting-time">
          {formatMeetupTime(post.meetup.date)}
        </div>
        )}

        <div className="user-info">
          <img src={author?.avatar} alt="User Avatar" className="avatar" />
          <div className="name-and-timestamp-wrapper">
            <div className="name">
              {author?.name} {author?.surname}
            </div>
            <div className="timestamp">{formatTimeAgo(post.createdAt)}</div>
          </div>
        </div>

        <div className="content">
          <div className="long-text">{post.content}</div>
        </div>

        <div className="comment-row">
          <input className="comment-input" placeholder="Write a comment..." />
          <div className="actions">
            <CommentButton />
            <div className="wrapper-relative">
              {!isGroupPost && (
              <ImInButton
                joined={joined}
                onToggle={(newVal) => setJoined(newVal)}
                onMouseEnter={() => setShowAttendees(true)}
                onMouseLeave={() => setShowAttendees(false)}
              />          
            )}
            </div>
    
            {showAttendees && attendees.length > 0 && (
              <div className="attendees">
                <div className="attendees-header">
                  {attendees.length}{" "}
                  {attendees.length === 1 ? "person" : "people"} in:
                </div>
                {attendees.map((attendee) => (
                  <div key={attendee.id} className="tooltip-attendee">
                    {attendee.name} {attendee.surname}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="comment-section">
          {post.comments?.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Post;
