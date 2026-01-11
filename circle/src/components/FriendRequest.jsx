import React from "react";
import { Link } from "react-router-dom";
import { handleFriendRequest } from "../services/FriendRequestService";

function FriendRequest({ friendRequest, onUpdate }) {
  if (!friendRequest) {
    return null;
  }

  const requester = friendRequest.requester;

  if (!requester || !requester.id) return null;

  const requesterName = requester.name || requester.username || "Unknown User";

  const handleAction = async (action) => {
    try {
      await handleFriendRequest(friendRequest.id, action);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error(`Failed to ${action} request:`, error);
    }
  };

  return (
    <div className="sidebar-box meetup-box" style={{ padding: "15px" }}>
      <strong style={{ margin: "5px 0", display: "block" }}>
        New Friend Request!
      </strong>
      <span style={{ fontSize: "0.9em" }}>
        From:
        <Link
          to={`/profile/${requester.id}`}
          style={{ color: "white", fontWeight: "bold", marginLeft: "5px" }}
        >
          {requesterName}
        </Link>
      </span>

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button
          className="primary-button joined-button-small"
          onClick={() => handleAction("accept")}
          style={{ backgroundColor: "#569c74", color: "white", flex: 1 }}
        >
          Accept
        </button>
        <button
          className="secondary-button joined-button-small"
          onClick={() => handleAction("reject")}
          style={{ flex: 1 }}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default FriendRequest;
