// UserResultCard.jsx (MODIFIED)

import { useNavigate } from "react-router-dom";
import profilepic from "/avatars/default.png";
import React, { useState } from "react";
import { sendFriendRequest } from "../services/FriendRequestService";

function UserResultCard({ user }) {
  const navigate = useNavigate();
  const [requestStatus, setRequestStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  // MODIFIED: Check if the user object has a .get() method. If so, use it; otherwise, use direct property access.
  const profilePicture = user.get
    ? user.get("profile_picture") || profilepic
    : user.profile_picture || profilepic;

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
      className="user-result-card clickable" // <- Step 1 applied here
      onClick={() => navigate(`/profile/${user.id}`)}
    >
      <div className="user-card-header">
        {/* New structure for avatar and text */}
        <img
          src={profilePicture}
          alt={user.get ? user.get("user_firstname") : user.user_firstname}
          className="avatar-search" // <- New class applied here
        />

        <div className="user-card-content">
          <h3>
            {/* MODIFIED: Check for .get() before accessing properties */}
            {user.get ? user.get("user_firstname") : user.user_firstname}{" "}
            {user.get ? user.get("user_surname") : user.user_surname}
          </h3>
          {/* MODIFIED: Check for .get() before accessing properties */}
          <p>@{user.get ? user.get("username") : user.username}</p>
        </div>
      </div>

      {/* Button is outside the header, looks better */}
      <button
        className={requestStatus ? "secondary-button" : "primary-button"}
        onClick={onAddFriendClick}
        disabled={requestStatus || loading}
        style={{ marginTop: "10px" }}
      >
        {loading ? "Sending..." : requestStatus ? "Request Sent" : "Add Friend"}
      </button>
    </div>
  );
}

export default UserResultCard;
