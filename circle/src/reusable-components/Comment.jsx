export default function Comment() {
  return (
    <div className="comment">
      <div className="comment-user-info">
        <img
          src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
          alt="User Avatar"
          className="comment-avatar"
        />
        <div className="name-and-timestamp-wrapper">
          <div className="comment-name">John Doe</div>
          <div className="comment-timestamp">2 hours ago</div>
        </div>
      </div>
      <div className="comment-content">
        <div className="long-text">
          Sure thing! I would love to hang out this week. I was thinking of
          going to the cinema to see Dune!
        </div>
      </div>
    </div>
  );
}
