import { useNavigate } from "react-router-dom";
import profilepic from "/avatars/default.png";
import React, { useState } from "react";
import { sendFriendRequest } from "../services/FriendRequestService";

function UserResultCard({ user }) {
  const navigate = useNavigate();
  const [requestStatus, setRequestStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  const profilePicture = user.get("profile_picture") || profilepic;

  const onAddFriendClick = async (e) => {
    e.stopPropagation();
    setLoading(true);

    try {
      await sendFriendRequest(user.id);
      setRequestStatus(true); // Success: Change status to sent
    } catch (error) {
      console.error("Failed to send request:", error);
      alert(
        `Failed to send request. Check console for details. ${error.message}`
      );
      setRequestStatus(false); // Failure: Keep button clickable
    } finally {
      setLoading(false);
    }
  };

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

        <button
          // Use the loading state for immediate user feedback
          className={requestStatus ? "secondary-button" : "primary-button"}
          onClick={onAddFriendClick}
          disabled={requestStatus || loading} // Disable if sent OR loading
          style={{ marginTop: "10px" }}
        >
          {loading
            ? "Sending..."
            : requestStatus
            ? "Request Sent"
            : "Add Friend"}
        </button>
      </div>
    </div>
  );
}

export default UserResultCard;
