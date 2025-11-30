import { formatTimeAgo } from "../utils/timeHelper.js";

export default function Comment({ comment }) {
  const commentAuthor = comment.get
    ? comment.get("comment_author")
    : comment.comment_author;

  const firstName = commentAuthor?.get
    ? commentAuthor.get("user_firstname")
    : commentAuthor?.user_firstname;

  const surname = commentAuthor?.get
    ? commentAuthor.get("user_surname")
    : commentAuthor?.user_surname;

  const profilePictureFile = commentAuthor?.get
    ? commentAuthor.get("profile_picture")
    : commentAuthor?.profile_picture;

  const getProfilePictureUrl = (profilePictureFile) => {
    if (!profilePictureFile) return "/avatars/default.png";
    if (typeof profilePictureFile === "string") return profilePictureFile;
    if (typeof profilePictureFile.url === "function")
      return profilePictureFile.url();
    if (profilePictureFile._url) return profilePictureFile._url;
    return "/avatars/default.png";
  };

  const avatar = getProfilePictureUrl(profilePictureFile);

  const text = comment.get ? comment.get("text") : comment.text;

  const createdAt = comment.get ? comment.get("createdAt") : comment.createdAt;

  return (
    <div className="comment">
      <div className="comment-user-info">
        <img src={avatar} alt="User Avatar" className="comment-avatar" />
        <div className="name-and-timestamp-wrapper">
          <div className="comment-name">
            {firstName} {surname}
          </div>
          <div className="comment-timestamp">{formatTimeAgo(createdAt)}</div>
        </div>
      </div>
      <div className="comment-content">
        <div className="long-text">{text}</div>
      </div>
    </div>
  );
}
