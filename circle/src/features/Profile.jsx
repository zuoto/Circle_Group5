// Profile.jsx

import React, { useState, useEffect } from "react";
import "../index.css";
import { users } from "../mock-data/mock-data-user/MockDataUsers.jsx";
import Avatar from "../components/Avatar.jsx";
import Card from "../components/ProfileCard.jsx";
import GroupCard from "../components/GroupCard.jsx";
import { Link } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);

  //mock data for profile including bio, friends, groups
  const mockProfileData = {
    bio: "Ava | Student at ITU | Copenhagen | D&D, arts & crafts",
    friends: users.filter((u) => u.id !== "u5").slice(0, 4),
    groups: [
      { id: "1", name: "The Fellowship of the Chaotic Dice", memberCount: 12 },
      { id: "2", name: "DIY Group", memberCount: 9 },
    ],
  };

  function loadUser() {
    //loops through the set of avatars, sets user and connects them to the profile data
    const found = users.find((u) => u.id === "u5");
    setUser({ ...found, ...mockProfileData });
  }

  useEffect(() => {
    loadUser();
  }, []);

  if (!user) {
    return <div className="page-wrapper">Loading Profile...</div>;
  }

  return (
    //reuses page-wrapper
    <div className="page-wrapper">
      <div className="feature-names">Profile</div>
      <div className="profile-content-layout">
        <div className="profile-main-column">
          <Card>
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <Avatar
                src={user.avatar}
                alt={`${user.name} avatar`}
                size="large"
              />
            </div>

            {/* name style reuses .name */}
            <div
              className="name"
              style={{
                fontSize: "2em",
                textAlign: "center",
                marginBottom: "15px",
              }}
            >
              {user.name} {user.surname}
            </div>

            <div style={{ textAlign: "center" }}>
              {/* Edit Profile button reusues style for .secondary-button */}
              <button className="secondary-button">Edit Profile</button>
            </div>
          </Card>
        </div>

        <div className="profile-sidebar-column">
          <Card title="Bio">
            <p className="long-text">{user.bio}</p>
          </Card>
          {/* friends list card */}
          <Card title={`Friends (${user.friends.length})`}>
            <div className="card-content-list">
              {user.friends.map((friend) => (
                <div key={friend.id} className="friend-item">
                  <Avatar src={friend.avatar} alt={friend.name} size="small" />
                  <div className="name">{friend.name}</div>
                </div>
              ))}
            </div>
          </Card>
          {/* groups card */}
          <Card title={`My Groups (${user.groups.length})`}>
            {/* reuses group card component*/}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {user.groups.map((group) => (
                <Link
                  key={group.id}
                  to={`/features/groups/${group.id}`}
                  className="group-card-link-compact"
                >
                  <div className="group-card-compact">
                    <h3 style={{ margin: 0 }}>{group.name}</h3>
                    <div className="member-count-box">
                      <span className="member-count-number">{group.memberCount}</span>
                      <span className="member-count-text">members</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile;
