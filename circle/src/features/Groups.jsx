import React from "react";
import GroupCard from "../components/GroupCard";
import NewPostButton from "../reusable-components/NewPostButton";
import Modal from "../reusable-components/Modal.jsx";
import NewGroupForm from "../reusable-components/NewGroupForm";
import { useGroupsData } from "../hooks/useGroupsData.js";

export default function Groups() {

    // Get state and handlers from useGroupDetails hook
    const {
      groups,
      loading,
      isModalOpen,
      isSubmitting,
      handleOpenModal,
      handleCloseModal,
      handleCreateGroup
    } = useGroupsData();

  // Render
  if (loading) {
    return <div className="page-wrapper">Loading groups...</div>;
  }

  return (
    <div className="page-wrapper">
      <div className="feature-header">
      <div className="feature-names">Groups</div>
      <NewPostButton onClick={handleOpenModal} hoverText="start a group" />
      </div>

      <div className="main-content">
      {groups.length === 0 ? (
        <div className="empty-state-message">No groups yet</div>
      ) : (
        groups
        .filter(group => group && group.id)
        .map(group => (
       <GroupCard
          key={group.id}
          id={group.id}
          name={group.name}
          description={group.description}
          initialMemberCount={group.memberCount || 0}
          initialIsUserJoined={group.isUserJoined || false}
          coverPhotoUrl={group.coverPhotoUrl || '/covers/default-cover.jpg'}
       />

       )))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <NewGroupForm onSubmit={handleCreateGroup} onCancel={handleCloseModal} isSubmitting={isSubmitting} />
      </Modal>
    </div>
  );
}
