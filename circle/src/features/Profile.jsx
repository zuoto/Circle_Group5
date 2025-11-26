// Profile.jsx

import React, { useState, useEffect } from "react";
// Import useParams to read the ID from the URL
import { useParams } from "react-router-dom";
import "../index.css";
import ProfileHeader from "../components/ProfileHeader";
import ProfileSideBar from "../components/ProfileSideBar";
import { useAuth } from "../auth/AuthProvider";
import Parse from "parse"; // Sticking to team's pattern

function Profile() {
  const { currentUser, loading: isAuthLoading } = useAuth();

  // FIX 1: Get the userId from the URL path (e.g., '/profile/abc1234')
  const { userId: urlUserId } = useParams();

  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfileData = async (userId) => {
    setError(null);
    const Parse = window.Parse;

    try {
      const query = new Parse.Query(Parse.User);
      query.include("profile_picture");

      // FIX 2: Use the ID passed to the function (which comes from URL or currentUser)
      const parseUser = await query.get(userId);

      // ... (Rest of data processing, relations, etc. remains the same)

      //Temporary fix for default picture logic
      const profilePictureFile = parseUser.get("profile_picture");
      const isParseFile =
        profilePictureFile && typeof profilePictureFile.url === "function";

      const pictureUrl = isParseFile ? profilePictureFile.url() : null;

      // Fetching Groups relation
      const groupsJoinedRelation = parseUser.relation("groups_joined");
      const groupsQuery = groupsJoinedRelation.query();
      const groupsResults = await groupsQuery.find();

      const structuredUser = {
        id: parseUser.id,
        name: parseUser.get("user_firstname"),
        surname: parseUser.get("user_surname"),
        bio: parseUser.get("bio") || "No bio yet.",
        picture: pictureUrl,
        friends: [], // Friends relation logic would go here
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

    // FIX 3: Determine the single target user ID:
    // If an ID is in the URL, use it; otherwise, use the logged-in user's ID.
    const targetUserId = urlUserId || currentUser?.id;

    if (targetUserId) {
      setProfileLoading(true);
      fetchProfileData(targetUserId);
    } else {
      setUser(null);
      setProfileLoading(false);
      setError("User is not logged in or ID is missing.");
    }
  }, [currentUser, isAuthLoading, urlUserId]); // FIX 4: Add urlUserId to dependencies

  if (isAuthLoading || profileLoading) {
    return <div className="page-wrapper">Loading Profile...</div>;
  }

  // FIX 5: Simplified Conditional Rendering

  // Scenario 1: User is not logged in AND there is no ID in the URL (i.e., user clicked the main Profile link)
  if (!currentUser && !urlUserId) {
    return (
      <div className="page-wrapper">Please log in to view your profile.</div>
    );
  }

  // Scenario 2: Error occurred during data fetch (this catches the failed query)
  if (error) {
    return (
      <div className="page-wrapper" style={{ textAlign: "center" }}>
        <h2>Profile Data Failed to Load!</h2>
        <p style={{ color: "red", fontWeight: "bold" }}>
          **Specific Error from Parse:** {error}
        </p>
        <hr />
        <p>
          **Action Required:** If you see "Object Not Found," the user ID in the
          URL is wrong. If you see an error like "Unauthorized," the profile you
          are trying to view is restricted by ACL.
        </p>
      </div>
    );
  }

  // Scenario 3: Data successfully loaded (user is not null)
  if (!user) {
    // This catches scenarios where the fetch failed but didn't set a specific error message.
    return <div className="page-wrapper">Profile data unavailable.</div>;
  }

  const defaultProfilePicUrl = "new_default_pic.png";
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
