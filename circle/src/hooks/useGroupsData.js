import { useEffect, useState, useCallback } from "react";
import { getAllGroups, createNewGroup } from "../services/ParseGroupService.js";

export const useGroupsData = () => {
    // state for the groups list, starting empty
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);  // form submission
    
      // Fetcher function
      const loadGroups = useCallback(async () => {
          setLoading(true);
    
          try {
            const fetchedGroups = await getAllGroups();
            setGroups(fetchedGroups);
            console.log("Fetched groups: ", fetchedGroups);
          } catch (error) {
            console.error("Error loading groups: ", error);
          } finally {
            setLoading(false);  // sets loading to false no matter if try succeeded or catch failed
          }
        }, []);
    
    // Data load
    useEffect(() => {
        loadGroups();
    }, [loadGroups]);   // runs only once when component loads

    // Handlers
    const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
    const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

    const handleCreateGroup = useCallback(async (newGroupData) => {
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
        // add new group to start of the list
        setGroups(prevGroups => [newGroup, ...prevGroups]);
      } catch (error) {
      console.error("Failed to create group: ", error);
      alert("Failed to create group. Are you logged in?");
    } finally {
      setIsSubmitting(false);
    }
  }, [handleCloseModal]);

    return {
        groups,
        loading,
        isModalOpen,
        isSubmitting,
        handleOpenModal,
        handleCloseModal,
        handleCreateGroup,
    };
    
};
