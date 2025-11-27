// Profile.jsx

import React, { useState, useEffect } from "react";
import "../index.css";
import ProfileHeader from "../components/ProfileHeader";
import ProfileSideBar from "../components/ProfileSideBar";
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
      const isParseFile =
        profilePictureFile && typeof profilePictureFile.url === "function";

      const pictureUrl = isParseFile ? profilePictureFile.url() : null;

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

  const defaultProfilePicUrl = "new_default_pic.png"; // will be changed
  const profilePictureUrl = user.picture || defaultProfilePicUrl;

  return (
    <div className="page-wrapper">
      <div className="feature-names">Profile</div>
      <div className="profile-content-layout">
        <ProfileHeader user={user} profilePictureURL={profilePictureUrl} />
        <ProfileSideBar user={user} />
      </div>
    </div>
  );
}

export default Profile;
