import React, { useState } from "react";
import Modal from "../reusable-components/Modal";
import EditProfileModal from "../reusable-components/EditProfileModal";
import Card from "./ProfileCard";
import User from "./User";

export default function ProfileHeader({
  user,
  profilePictureURL,
  onProfileUpdate,
  isViewingSelf,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = () => {
    if (isViewingSelf) {
      setIsModalOpen(true);
    } else {
      console.warn("Cannot edit another user's profile.");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  if (!user) return null;

  const showEditButton = isViewingSelf;

  return (
    <div className="profile-main-column">
      <Card>
        <div
          style={{
            justifyContent: "center",
            display: "flex",
            marginBottom: "15px",
          }}
        >
          <User
            src={profilePictureURL}
            alt={`${user.name} picture`}
            size="large"
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
          <button className="secondary-button" onClick={handleEdit}>
            Edit Profile
          </button>
        </div>
      </Card>
      <Modal isOpen={isModalOpen} onClose={handleModalClose}>
        <EditProfileModal user={user} onClose={handleModalClose} />
      </Modal>
    </div>
  );
}
