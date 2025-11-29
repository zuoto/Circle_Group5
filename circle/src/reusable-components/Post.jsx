import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Comment from "./Comment.jsx";
import CommentButton from "./CommentButton.jsx";
import ImInButton from "./ImInButton.jsx";
import AttendeesTooltip from "../components/AttendeesTooltip.jsx";
import { formatMeetupTime, formatTimeAgo } from "../utils/timeHelper.js";
import profilepic from "../../public/avatars/default.png";

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

  // Check if current user is already in participants
  const isUserJoined = participants.some((p) => p.id === currentUser?.id);

  const handleParticipantToggle = (joined) => {
    if (joined) {
      //add current user to participants
      setParticipants([...participants, currentUser]);
    } else {
      // remove current user from participants
      setParticipants(participants.filter((p) => p.id !== currentUser.id));
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments([...comments, newComment]);
    setCommentText(""); // Clear input after adding comment
  };

  useEffect(() => {
    const fetchComments = async () => {
      const Parse = window.Parse;
      const CommentClass = Parse.Object.extend("Comments");
      const query = new Parse.Query(CommentClass);
      const postObj = new (Parse.Object.extend("Post"))();
      postObj.id = post.id;

      query.equalTo("comment_post", postObj);
      query.include("comment_author");
      query.include("comment_author.profile_picture");
      query.ascending("createdAt");

      const fetchedComments = await query.find();
      setComments(fetchedComments);
    };

    fetchComments();
  }, [post.id]);

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
        <img
          src={author.profile_picture ? author.profile_picture : profilepic}
          alt="User Avatar"
          className="avatar"
        />
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
