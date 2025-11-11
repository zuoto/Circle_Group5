import React from "react";
import GroupCard from "../components/GroupCard";
import { mockGroups } from "../mock-data/mock-data-groups/MockGroupsData";
import NewPostButton from "../reusable-components/NewPostButton";
import Modal from "../reusable-components/Modal.jsx";
import NewGroupForm from "../reusable-components/NewGroupForm";

export default function Groups() {

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const handleCreateGroup = (newGroupData) => {
    handleCloseModal();
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="page-wrapper">
      <div className="feature-header">
      <div className="feature-names">Groups</div>
      <NewPostButton onClick={handleOpenModal} hoverText="start a group" />
      </div>

      <div className="main-content">
      {mockGroups.map(group => (
       <GroupCard
          key={group.id}
          id={group.id}
          name={group.name}
          description={group.description}
          memberCount={"Members: " + group.memberCount}
          isUserJoined={group.isUserJoined}
          coverPhotoUrl={group.coverPhotoUrl}
       />

       ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <NewGroupForm onSubmit={handleCreateGroup} onCancel={handleCloseModal} />
      </Modal>
    </div>
  );
}
