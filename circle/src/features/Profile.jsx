import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";
import ProfileHeader from "../components/ProfileHeader";
import ProfileSideBar from "../components/ProfileSideBar";
import { useAuth } from "../auth/AuthProvider";

function Profile() {
  const { currentUser, loading: isAuthLoading } = useAuth();

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

      const parseUser = await query.get(userId);

      const profilePictureFile = parseUser.get("profile_picture");
      const isParseFile =
        profilePictureFile && typeof profilePictureFile.url === "function";

      const pictureUrl = isParseFile ? profilePictureFile.url() : null;

      const groupsJoinedRelation = parseUser.relation("groups_joined");
      const groupsQuery = groupsJoinedRelation.query();
      const groupsResults = await groupsQuery.find();
      console.log("Fetched groups: ", groupsResults.map(g => ({id: g.id, name: g.get("group_name")})));

      const structuredUser = {
        id: parseUser.id,
        name: parseUser.get("user_firstname"),
        surname: parseUser.get("user_surname"),
        bio: parseUser.get("bio") || "No bio yet.",
        picture: pictureUrl,
        friends: [],
        groups: groupsResults.map((group) => ({
          id: group.id,
          name: group.get("group_name"),
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

    const targetUserId = urlUserId || currentUser?.id;

    if (targetUserId) {
      setProfileLoading(true);
      fetchProfileData(targetUserId);
    } else {
      setUser(null);
      setProfileLoading(false);
      setError("User is not logged in or ID is missing.");
    }
  }, [currentUser, isAuthLoading, urlUserId]);

  if (isAuthLoading || profileLoading) {
    return <div className="page-wrapper">Loading Profile...</div>;
  }

  if (!currentUser && !urlUserId) {
    return (
      <div className="page-wrapper">Please log in to view your profile.</div>
    );
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
          **Action Required:** If you see "Object Not Found," the user ID in the
          URL is wrong. If you see an error like "Unauthorized," the profile you
          are trying to view is restricted by ACL.
        </p>
      </div>
    );
  }

  if (!user) {
    return <div className="page-wrapper">Profile data unavailable.</div>;
  }

  const defaultProfilePicUrl = "new_default_pic.png";
  const profilePictureUrl = user.picture || defaultProfilePicUrl;

  const isViewingSelf = currentUser?.id === user.id;

  return (
    <div className="page-wrapper">
      <div className="feature-names">Profile</div>
      <div className="profile-content-layout">
        <ProfileHeader
          user={user}
          profilePictureURL={profilePictureUrl}
          isViewingSelf={isViewingSelf}
        />
        <ProfileSideBar user={user} />
      </div>
    </div>
  );
}

export default Profile;
