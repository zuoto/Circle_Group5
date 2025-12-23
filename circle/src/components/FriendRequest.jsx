import React from "react";
import { Link } from "react-router-dom";
import { handleFriendRequest } from "../services/FriendRequestService";

function FriendRequest({ friendRequest, onUpdate }) {
  if (!friendRequest) {
    return null;
  }

  const requester = friendRequest.get("requester");

  if (!requester || !requester.id) {
    console.warn(
      "Friend Request found, but requester data is missing (likely ACL issue)."
    );
    return null;
  }

  const firstName = requester.get("user_firstname") || "Unknown";
  const surname = requester.get("user_surname") || "User";

  const requesterName = `${firstName} ${surname}`;
  const requesterId = requester.id;

  const handleAction = async (action) => {
    try {
      await handleFriendRequest(friendRequest.id, action);
      onUpdate();
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
    }
  };

  return (
    <div className="sidebar-box meetup-box" style={{ padding: "15px" }}>
      <strong style={{ margin: "5px 0" }}>New Friend Request!</strong>
      <span>
        From:
        <Link
          to={`/profile/${requesterId}`}
          style={{ color: "white", fontWeight: "bold", marginLeft: "5px" }}
        >
          {requesterName}
        </Link>
      </span>

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button
          className="primary-button joined-button-small"
          onClick={() => handleAction("accept")}
          style={{ backgroundColor: "#569c74", color: "white" }}
        >
          Accept
        </button>
        <button
          className="secondary-button joined-button-small"
          onClick={() => handleAction("reject")}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default FriendRequest;
