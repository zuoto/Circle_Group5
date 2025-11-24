import { useNavigate } from "react-router-dom";
import profilepic from "/avatars/default.png";

function UserResultCard({ user }) {
  const navigate = useNavigate();
  const profilePicture = user.get("profile_picture") || profilepic;

  return (
    <div
      className="group-card clickable"
      onClick={() => navigate(`/profile/${user.id}`)}
    >
      <div
        className="group-card-cover-photo"
        style={{ backgroundImage: `url(${profilePicture})` }}
      />
      <div className="group-card-content">
        <h3>
          {user.get("user_firstname")} {user.get("user_surname")}
        </h3>
        <p>@{user.get("username")}</p>
      </div>
    </div>
  );
}

export default UserResultCard;
