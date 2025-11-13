// Profile.jsx

import React, { useState, useEffect } from "react";
import "../index.css";
import Card from "../components/ProfileCard.jsx";
import GroupCard from "../components/GroupCard.jsx";
import { Link } from "react-router-dom";
import { users } from "../mock-data/mock-data-user/MockDataUsers";
import Avatar from "../components/Avatar";
import Parse from "parse";

const CURRENT_USER_ID = "GUnnayD58J";

function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileData = async () => {
    try {
      // 1. Define the UserC class and the specific ID to fetch
      const UserC = Parse.Object.extend("UserC");
      const query = new Parse.Query(UserC);

      // 2. Fetch the main user object
      const parseUser = await query.get(CURRENT_USER_ID);

      // --- 3. Fetch Relations (Friends and Groups) ---
      // Relations require separate queries, we cannot get them with one call.

      // 3a. Fetch Friends (user_friends relation)
      /*const friendsRelation = parseUser.relation('user_friends');
      const friendsQuery = friendsRelation.query();
      const friendsResults = await friendsQuery.find();

      // 3b. Fetch Joined Groups (groups_joined relation)
      const groupsJoinedRelation = parseUser.relation('groups_joined');
      const groupsQuery = groupsJoinedRelation.query();
      // To get the memberCount (or other data) for groups, we may need a more advanced query
      const groupsResults = await groupsQuery.find();*/

      // 4. Structure the data for the React component
      const structuredUser = {
        id: parseUser.id,
        // Map Parse column names to component prop names (name, surname, bio)
        name: parseUser.get("user_name"),
        surname: parseUser.get("user_lastname"),
        bio: parseUser.get("bio"),

        // Handle File type for profile picture
        picture: parseUser.get("profile_pic")
          ? parseUser.get("profile_pic").url()
          : null,

        // Mock data for friends and groups since relations are commented out
        friends: [],
        groups: [],

        /* // Map the relation results
        friends: friendsResults.map(friend => ({
          id: friend.id,
          name: friend.get('user_name'),
          avatar: friend.get('profile_pic') ? friend.get('profile_pic').url() : null,
        })),

        groups: groupsResults.map(group => ({
          id: group.id,
          name: group.get('group_name'),
          // Note: memberCount would typically be retrieved by querying the Relation count
          memberCount: group.get('memberCount') || 0, 
        })),*/
      };

      setUser(structuredUser);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user profile data:", error);
      // You can set an error state here to show a message to the user
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
