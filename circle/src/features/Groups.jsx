import React, { useEffect, useState } from "react";
import GroupCard from "../components/GroupCard";
import NewPostButton from "../reusable-components/NewPostButton";
import Modal from "../reusable-components/Modal.jsx";
import NewGroupForm from "../reusable-components/NewGroupForm";
import { getAllGroups, createNewGroup } from "../services/ParseGroupService.js";

export default function Groups() {

  // state for the groups list, starting empty
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);  // form submission

  // Hooks
  useEffect(() => {
    async function loadGroups() {
      setLoading(true);

      try {
        const fetchedGroups = await getAllGroups();
        setGroups(fetchedGroups);
        console.log("Fetched groups: ", fetchedGroups);
      } catch (error) {
        console.error("Error loading groups: ", error);
        alert("Failed to load groups. Please check your connection.");
      } finally {
        setLoading(false);  // sets loading to false no matter if try succeeded or catch failed
      }
    }

    loadGroups();
  }, []); // runs only once when component loads, hence empty array

  // Handlers
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleCreateGroup = async (newGroupData) => {
      setIsSubmitting(true);

      try {
        const savedGroupObject = await createNewGroup(newGroupData);
        handleCloseModal();

        const picFile = savedGroupObject.get('group_default_pic');
        const newGroupPicUrl = picFile ? picFile.url() : '/covers/default-cover.jpg';

        const newGroup = {
          id: savedGroupObject.id,
          name: savedGroupObject.get('group_name'),
          description: savedGroupObject.get('group_description'),
          memberCount: 1,   // creator automatically a member
          isUserJoined: true,
          coverPhotoUrl: newGroupPicUrl,
        };
        setGroups(prevGroups => [newGroup, ...prevGroups]);
      } catch (error) {
      console.error("Failed to create group: ", error);
      alert("Failed to create group. Are you logged in?");
    } finally {
      setIsSubmitting(false);
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
      {groups
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

       ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <NewGroupForm onSubmit={handleCreateGroup} onCancel={handleCloseModal} isSubmitting={isSubmitting} />
      </Modal>
    </div>
  );
}
