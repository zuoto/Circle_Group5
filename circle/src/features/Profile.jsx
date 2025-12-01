import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../index.css";
import ProfileHeader from "../components/ProfileHeader";
import ProfileSideBar from "../components/ProfileSideBar";
import Modal from "../reusable-components/Modal";
import { useAuth } from "../auth/AuthProvider";
import { fetchPendingFriendRequests } from "../services/FriendRequestService";

function Profile() {
  const { currentUser, loading: isAuthLoading } = useAuth();

  const { userId: urlUserId } = useParams();

  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pendingRequests, setPendingRequests] = useState([]);
  // Modal should not show on initial render, only after requests are loaded
  const [showModal, setShowModal] = useState(false);

  /**
   * Fetches the main user data (profile details, friends count, groups joined).
   * @param {string} userId - The ID of the user to fetch.
   * @returns {boolean} True if successful, false otherwise.
   */
  const fetchProfileData = async (userId) => {
    setError(null);
    const Parse = window.Parse;

    try {
      const query = new Parse.Query(Parse.User);
      // Ensure profile_picture is fetched
      query.include("profile_picture");

      // Fetch the user object
      const parseUser = await query.get(userId);

      const profilePictureFile = parseUser.get("profile_picture");
      const isParseFile =
        profilePictureFile && typeof profilePictureFile.url === "function";

      const pictureUrl = isParseFile ? profilePictureFile.url() : null;

      // Fetch groups joined via the relation
      const groupsJoinedRelation = parseUser.relation("groups_joined");
      const groupsQuery = groupsJoinedRelation.query();
      const groupsResults = await groupsQuery.find();

      // Note: Friend relations are often queried separately or managed by the client.
      // Assuming 'user.friends' will be populated elsewhere or its count is accurate
      // upon the ParseUser object's fetch/update from the server.

      const structuredUser = {
        id: parseUser.id,
        name: parseUser.get("user_firstname"),
        surname: parseUser.get("user_surname"),
        bio: parseUser.get("bio") || "No bio yet.",
        picture: pictureUrl,
        friends: [], // Keep this array, assuming friend objects are fetched elsewhere
        groups: groupsResults.map((group) => ({
          id: group.id,
          name: group.get("group_name"),
        })),
      };

      setUser(structuredUser);
      return true; // SUCCESS: Explicitly return true
    } catch (err) {
      console.error("Error fetching user profile data:", err);
      setError(
        err.message || "An unknown error occurred while loading profile data."
      );
      setUser(null);
      return false; // FAILURE: Explicitly return false
    } finally {
      setProfileLoading(false);
    }
  };

  /**
   * Fetches only the pending friend requests for the current user.
   */
  const loadRequests = async (targetUserId) => {
    // Only run if the user is viewing their OWN profile
    if (currentUser?.id === targetUserId) {
      try {
        const requests = await fetchPendingFriendRequests();
        setPendingRequests(requests);

        // Show the modal if new requests are found
        if (requests.length > 0) {
          setShowModal(true);
        }
      } catch (error) {
        console.error("Failed to load friend requests in Profile:", error);
      }
    }
  };

  /**
   * 🔄 COMBINED REFRESHER: Refreshes the entire profile (friend count) AND the request list (sidebar).
   * This is called after a friend request is ACCEPTED or REJECTED.
   */
  const loadProfileAndRequests = async (targetUserId) => {
    // 1. Re-fetch the entire profile data (updates the friend count)
    const success = await fetchProfileData(targetUserId);

    if (success) {
      // 2. Re-fetch the pending requests list (makes the accepted/rejected box disappear)
      if (currentUser?.id === targetUserId) {
        try {
          const requests = await fetchPendingFriendRequests();
          setPendingRequests(requests);

          // Re-open the modal if any new requests remain, otherwise, leave it closed
          if (requests.length > 0) {
            setShowModal(true);
          } else {
            setShowModal(false); // Ensure modal closes if list is now empty
          }
        } catch (error) {
          console.error("Failed to load requests after refresh:", error);
        }
      }
    }
  };

  // PRIMARY EFFECT HOOK: Runs once on load/ID change to fetch initial data.
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    const targetUserId = urlUserId || currentUser?.id;

    if (targetUserId) {
      setProfileLoading(true);

      // 1. Fetch main profile data
      fetchProfileData(targetUserId).then((success) => {
        if (success) {
          // 2. Initial load: Fetch requests only after profile data is successful
          loadRequests(targetUserId);
        }
      });
    } else {
      setUser(null);
      setProfileLoading(false);
      setError("User is not logged in or ID is missing.");
    }
  }, [currentUser, isAuthLoading, urlUserId]);

  // -----------------------------------------------------------------
  // RENDER CHECKS
  // -----------------------------------------------------------------

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

  // -----------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------

  return (
    <div className="page-wrapper">
      <div className="feature-names">Profile</div>
      <div className="profile-content-layout">
        <ProfileHeader
          user={user}
          profilePictureURL={profilePictureUrl}
          isViewingSelf={isViewingSelf}
        />
        {/* Pass the data and the combined refresh function to the sidebar */}
        <ProfileSideBar
          user={user}
          pendingRequests={pendingRequests}
          // This is the function the sidebar calls after Accept/Reject
          loadRequests={(userId) => loadProfileAndRequests(userId)}
        />
      </div>

      {/* MODAL (Option A): Shows immediately if requests are found on load or refresh */}
      {showModal && pendingRequests.length > 0 && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          <h2>You have {pendingRequests.length} new friend request(s)!</h2>
          <p>Please check the "Pending Requests" section in your sidebar.</p>
          <button
            className="primary-button"
            onClick={() => setShowModal(false)}
            style={{ marginTop: "20px" }}
          >
            Close for now
          </button>
        </Modal>
      )}
    </div>
  );
}

export default Profile;
