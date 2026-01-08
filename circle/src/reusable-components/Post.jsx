import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Comment from "./Comment.jsx";
import CommentButton from "./CommentButton.jsx";
import ImInButton from "./ImInButton.jsx";
import AttendeesTooltip from "../components/AttendeesTooltip.jsx";
import { formatMeetupTime, formatTimeAgo } from "../utils/timeHelper.js";

function Post({ post, isGroupPost }) {
  if (!post) {
    return null;
  }

  const { groupName, groupId } = post;

  const [showAttendees, setShowAttendees] = useState(false);
  const [participants, setParticipants] = useState(post.participants || []);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);

  const author = post.author || {};
  const Parse = window.Parse;
  const currentUser = Parse.User.current();

  const isUserJoined = participants.some((p) => p.id === currentUser?.id);

  const handleParticipantToggle = (joined) => {
    if (joined) {
      setParticipants([...participants, currentUser]);
    } else {
      setParticipants(participants.filter((p) => p.id !== currentUser.id));
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment]);
    setCommentText("");
  };

  useEffect(() => {
    // stop component from fetching data if cloud code already did it
    if (post.comments && post.comments.length > 0) {
      return;
    }

    const fetchComments = async () => {
      const Parse = window.Parse;
      const CommentClass = Parse.Object.extend("Comments");
      const query = new Parse.Query(CommentClass);
      const postObj = new (Parse.Object.extend("Post"))();
      postObj.id = post.id;

      query.equalTo("comment_post", postObj);
      query.include("comment_author");
      query.ascending("createdAt");

      const fetchedComments = await query.find();
      setComments(fetchedComments);
    };

    fetchComments();
  }, [post.id, post.comments]);

  const authorProfilePic = author.profile_picture || "/avatars/default.png";

  return (
    <div className="post">
      {groupName && (
        <div className="group-badge-wrapper">
          <span className="group-badge">
            Posted in:
            <Link to={`/groups/${groupId}`}>{groupName}</Link>
          </span>
        </div>
      )}

      {!(isGroupPost && post.meetup) && (
        <div className="post-meeting-time">
          {formatMeetupTime(post.hangoutTime)}
        </div>
      )}

      <div className="user-info">
        <img src={authorProfilePic} alt="User Avatar" className="avatar" />
        <div className="name-and-timestamp-wrapper">
          <div className="name">
            {author.user_firstname} {author.user_surname}
          </div>
          <div className="timestamp">{formatTimeAgo(post.createdAt)}</div>
        </div>
      </div>

      <div className="content">
        <div className="long-text">{post.content}</div>
      </div>

      <div className="comment-row">
        <input
          className="comment-input"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <div className="actions">
          <CommentButton
            postId={post.id}
            commentText={commentText}
            onCommentAdded={handleCommentAdded}
          />
          <div className="wrapper-relative">
            {!groupId && !isGroupPost && (
              <ImInButton
                postId={post.id}
                initialJoined={isUserJoined}
                currentUserId={currentUser.id}
                onToggle={handleParticipantToggle}
                onMouseEnter={() => setShowAttendees(true)}
                onMouseLeave={() => setShowAttendees(false)}
              />
            )}
            <AttendeesTooltip
              participants={participants}
              show={showAttendees}
            />
          </div>
        </div>
      </div>

      <div className="comment-section">
        {comments?.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}

export default Post;
