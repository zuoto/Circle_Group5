import React from "react";
import Card from "./ProfileCard";
import ProfileGroupLink from "./ProfileGroupLink";
import FriendRequest from "./FriendRequest";

export default function ProfileSideBar({
  user,
  pendingRequests = [],
  loadRequests,
}) {
  if (!user) return null;

  return (
    <div className="profile-sidebar-column">
      {pendingRequests.length > 0 && (
        <Card
          title={`Pending Requests (${pendingRequests.length})`}
          isRequests={true}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {pendingRequests.map((req) => (
              <FriendRequest
                key={req.id}
                friendRequest={req}
                onUpdate={() => loadRequests(user.id)}
              />
            ))}
          </div>
        </Card>
      )}
      <Card title="Bio">
        <p className="long-text">{user.bio}</p>
      </Card>
      <Card title={`Friends (${user.friends.length})`}>
        <div className="card-content-list"></div>
      </Card>
      <Card title={`My Groups (${user.groups.length})`}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {user.groups.map((group) => (
            <ProfileGroupLink key={group.id} group={group} />
          ))}
        </div>
      </Card>
    </div>
  );
}
