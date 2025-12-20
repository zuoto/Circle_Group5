import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getGroupById, toggleGroupMembership, fetchGroupMembers } from "../services/ParseGroupService";

export const useGroupDetails = () => {
    // Hooks
        const { groupId } = useParams();    // get group id from URL

     // State: starts as null for the single group object
        const [group, setGroup] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [isPostModalOpen, setIsPostModalOpen] = useState(false);
        const [groupMembers, setGroupMembers] = useState([]);
        const [showMembersTooltip, setShowMembersTooltip] = useState(false);
    
        // fetch data for specific group 
        const loadGroupDetails = useCallback(async () => {
            setLoading(true);
            setError(null); // reset error before a new attempt
            try {
                const fetchedGroup = await getGroupById(groupId);
                if (!fetchGroup) {
                    throw new Error("Group not found.");
                }
                setGroup(fetchedGroup);
            } catch (err) {
                console.error("Error fetching group details: ", err);
                setError(err.message || "Failed to load group details.");
            } finally {
                setLoading(false);
            }
        }, [groupId]);
        
        // Hook for initial data load that runs if groupId changes
        useEffect(() => {
            loadGroupDetails();
        }, [loadGroupDetails]);
    
        // Hook to fetch member details for the tooltip
        useEffect(() => {
            // check whether group object and its member list are available
            if (group && group.id) {
                const fetchMembers = async () => {
                    const membersList = await fetchGroupMembers(group.id);
                    setGroupMembers(membersList);
                };
                fetchMembers();
            }
        }, [group]);

    // Handlers
    const handleJoinClick = useCallback(async () => {
            if (!group) {
                console.warn("Attempted to join a null group object.");
                return;
            }
    
            const isJoining = !group.isUserJoined;  // toggle state
    
            try {
                // call database
                await toggleGroupMembership(group.id, isJoining);
                // update local state
                setGroup(prevGroup => ({
                    ...prevGroup,
                    isUserJoined: isJoining,
                    // adjust member count
                    memberCount: isJoining ? prevGroup.memberCount + 1 : prevGroup.memberCount - 1
                }));
            } catch (error) {
                console.error("Failed to toggle join: ", error);
                alert("Error joining group. Please try again.");
            }
        }, [group]);

    const handleOpenPostModal = useCallback(() => setIsPostModalOpen(true), []);
    const handleClosePostModal = useCallback(() => setIsPostModalOpen(false));
    const handlePostCreated = useCallback(() => {
        handleClosePostModal();
        loadGroupDetails();
    }, [handleClosePostModal, loadGroupDetails]);

    return {
        group,
        loading,
        error,
        groupMembers,
        showMembersTooltip,
        isPostModalOpen,
        loadGroupDetails,
        handleJoinClick,
        handlePostCreated,
        handleOpenPostModal,
        handleClosePostModal,
        setShowMembersTooltip,
        groupId,
    };
};
