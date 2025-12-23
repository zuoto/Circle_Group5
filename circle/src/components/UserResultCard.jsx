import { useNavigate } from "react-router-dom";
import defaultPic from "/avatars/default.png";
import React, { useState } from "react";
import { sendFriendRequest } from "../services/FriendRequestService.js";
import Parse from "../utils/parseClient.js";

function UserResultCard({ user }) {
  const navigate = useNavigate();
  const [requestStatus, setRequestStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentUser = Parse.User.current();
  const isSelf = currentUser && currentUser.id === user.id;

  const { id, user_firstname, user_surname, username, profile_picture } = user;

  const profileUrl = user.profile_picture || defaultPic;

  const onAddFriendClick = async (e) => {
    e.stopPropagation();
    setLoading(true);

    try {
      await sendFriendRequest(user.id);
      setRequestStatus(true); // success = hange status to sent
    } catch (error) {
      console.error("Failed to send request:", error);
      alert(
        `Failed to send request. Check console for details. ${error.message}`
      );
      setRequestStatus(false); // failure = keep button clickable
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="user-result-card clickable"
      onClick={() => navigate(`/profile/${id}`)}
    >
      <div className="user-card-header">
        <img src={profileUrl} alt={user_firstname} className="avatar-search" />

        <div className="user-card-content">
          <h3>
            {user_firstname}
            {user_surname}
          </h3>
          <p>@{username}</p>
        </div>
      </div>

      {!isSelf && (
        <button
          className={requestStatus ? "secondary-button" : "primary-button"}
          onClick={onAddFriendClick}
          disabled={requestStatus || loading}
          style={{ marginTop: "10px" }}
        >
          {loading
            ? "Sending..."
            : requestStatus
            ? "Request Sent"
            : "Add Friend"}
        </button>
      )}
    </div>
  );
}

export default UserResultCard;
