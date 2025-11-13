// Profile.jsx

import React, { useState, useEffect } from "react";
import "../index.css";
import Card from "../components/ProfileCard.jsx";
import GroupCard from "../components/GroupCard.jsx";
import { Link } from "react-router-dom";
import { users } from "../mock-data/mock-data-user/MockDataUsers";
import Avatar from "../components/Avatar";

const CURRENT_USER_ID = "GUnnayD58J";

function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileData = async () => {
    try {
      // Use mock data instead of Parse to avoid initialization errors
      // In a real app, replace this with Parse queries
      const mockUser = {
        id: CURRENT_USER_ID,
        name: "John",
        surname: "Doe",
        bio: "Welcome to my profile! I enjoy connecting with like-minded individuals.",
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
        friends: [
          {
            id: "f1",
            name: "Alice",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
          },
          {
            id: "f2",
            name: "Bob",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
          },
        ],
        groups: [
          {
            id: "g1",
            name: "Tech Enthusiasts",
            memberCount: 245,
          },
          {
            id: "g2",
            name: "Local Events",
            memberCount: 89,
          },
        ],
      };

      setUser(mockUser);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user profile data:", error);
      setUser(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have a valid ID
    fetchProfileData();
  }, []);

  if (isLoading) {
    return <div className="page-wrapper">Loading Profile...</div>;
  }

  if (!user) {
    return <div className="page-wrapper">Error loading profile.</div>;
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
                src={user.picture}
                alt={`${user.name} picture`}
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
                      <span className="member-count-number">
                        {group.memberCount}
                      </span>
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
