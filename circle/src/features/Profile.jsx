// Profile.jsx

import React, { useState, useEffect } from "react";
import "../index.css";
import Card from "../components/ProfileCard.jsx";
import GroupCard from "../components/GroupCard.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

function Profile() {
  const { currentUser, loading: isAuthLoading } = useAuth();

  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfileData = async (userId) => {
    setError(null);
    const Parse = window.Parse;
    try {
      const query = new Parse.Query(Parse.User);
      //Temporary
      query.include("profile_picture");

      const parseUser = await query.get(userId);

      //Temporary fix for default picture logic
      const profilePictureFile = parseUser.get("profile_picture");
      const pictureUrl =
        profilePictureFile && typeof profilePictureFile.url === "function"
          ? profilePictureFile.url()
          : null;

      const groupsJoinedRelation = parseUser.relation("groups_joined");
      const groupsQuery = groupsJoinedRelation.query();
      const groupsResults = await groupsQuery.find();

      const structuredUser = {
        id: parseUser.id,
        name: parseUser.get("user_firstname"),
        surname: parseUser.get("user_surname"),
        bio: parseUser.get("bio") || "No bio yet.",
        picture: pictureUrl, //Temporary
        friends: [],
        groups: groupsResults.map((group) => ({
          id: group.id,
          name: group.get("group_name"),
          memberCount: 0,
        })),
      };

      setUser(structuredUser);
    } catch (err) {
      console.error("Error fetching user profile data:", err);
      setError(
        err.message || "An unknown error occurred while loading profile data."
      );
      setUser(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (currentUser?.id) {
      setProfileLoading(true);
      fetchProfileData(currentUser.id);
    } else {
      setUser(null);
      setProfileLoading(false);
      setError("User is not logged in or ID is missing.");
    }
  }, [currentUser, isAuthLoading]);

  if (isAuthLoading || profileLoading) {
    return <div className="page-wrapper">Loading Profile...</div>;
  }

  if (!currentUser) {
    return <div className="page-wrapper">Access Denied.</div>;
  }

  if (error) {
    return (
      <div className="page-wrapper" style={{ textAlign: "center" }}>
        <h2>Profile Data Failed to Load!</h2>
        <p style={{ color: "red", fontWeight: "bold" }}>
          **Specific Error from Parse:** {error}
        </p>
        <hr />
        <p>
          **Action Required:** This error is likely a database permission issue.
          You must fix the **File Class Read Permissions** in your Back4App
          dashboard later!
        </p>
      </div>
    );
  }

  if (!user) {
    return <div className="page-wrapper">Error loading profile data.</div>;
  }

  const defaultProfilePicUrl = "/path/to/your/default/image.png"; // will be changed
  const profilePictureUrl = user.picture || defaultProfilePicUrl;

  return (
    <div className="page-wrapper">
      <div className="feature-names">Profile</div>
      <div className="profile-content-layout">
        <div className="profile-main-column">
          <Card>
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <img
                src={profilePictureUrl}
                alt={`${user.name} picture`}
                className="avatar-large"
              />
            </div>

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
              <button className="secondary-button">Edit Profile</button>
            </div>
          </Card>
        </div>

        <div className="profile-sidebar-column">
          <Card title="Bio">
            <p className="long-text">{user.bio}</p>
          </Card>
          <Card title={`Friends (${user.friends.length})`}>
            <div className="card-content-list"></div>
          </Card>
          <Card title={`My Groups (${user.groups.length})`}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {user.groups.map((group) => (
                <Link
                  key={group.id}
                  to={`/groups/${group.id}`}
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
