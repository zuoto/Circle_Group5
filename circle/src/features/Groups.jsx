import React, { useEffect, useState } from "react";
import GroupCard from "../components/GroupCard";
import NewPostButton from "../reusable-components/NewPostButton";
import Modal from "../reusable-components/Modal.jsx";
import NewGroupForm from "../reusable-components/NewGroupForm";
import {
  getAllGroups,
  createNewGroup,
} from "../services/groups/ParseGroupService.js";

export default function Groups() {
  // state for the groups list, starting empty
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Hooks
  useEffect(() => {
    async function loadGroups() {
      setLoading(true);
      const fetchedGroups = await getAllGroups();
      setGroups(fetchedGroups);
      setLoading(false);
    }

    loadGroups();
  }, []); // runs only once when component loads, hence empty array

  // Handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreateGroup = async (newGroupData) => {
    try {
      setLoading(true);
      await createNewGroup(newGroupData);
      handleCloseModal();

      // refresh group list fron the server
      const fetchedGroups = await getAllGroups();
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Failed to create group: ", error);
      alert("Failed to create group. Are you logged in?");
    } finally {
      setLoading(false);
    }
  };

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
        {groups.map((group) => (
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
        <NewGroupForm
          onSubmit={handleCreateGroup}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}
