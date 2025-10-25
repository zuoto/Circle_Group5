import Comment from "./Comment.jsx";
import CommentButton from "./CommentButton.jsx";
import ImInButton from "./ImInButton.jsx";

const [joined, setJoined] = useState(false);

function Post() {
  return (
    <div className="post">
      <div className="post-meeting-time">12pm - 4pm on 14.09.2025</div>
      <div className="user-info">
        <img
          src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
          alt="User Avatar"
          className="avatar"
        />
        <div className="name-and-timestamp-wrapper">
          <div className="name">John Doe</div>
          <div className="timestamp">2 hours ago</div>
        </div>
      </div>
      <div className="content">
        <div className="long-text">
          Heyo! Anybody wants to hang out? I don't have anything planned this
          week and I have some time off from work.{" "}
        </div>
      </div>
      <div className="comment-row">
        <input
          className="comment-input"
          placeholder="Write a comment..."
        ></input>
        <div className="actions">
          <CommentButton />
          <ImInButton
            joined={joined}
            onToggle={(newVal) => setJoined(newVal)}
          />
        </div>
      </div>
      <div className="comment-section">
        <Comment />
        <Comment />
      </div>
    </div>
  );
}
export default Post;
