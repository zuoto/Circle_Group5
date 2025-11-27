import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GroupHeader from "../components/GroupHeader";
import GroupInfoSidebar from "../components/GroupInfoSidebar"; 
import Post from "../reusable-components/Post";
import { getGroupById, toggleGroupMembership, fetchGroupMembers } from "../services/ParseGroupService";
import NewPostButton from "../reusable-components/NewPostButton";
import Modal from "../reusable-components/Modal";
import NewPostForm from "../reusable-components/NewPostForm";
import MembersTooltip from "../components/MembersTooltip";

export default function GroupDetail() {

    // State: starts as null for the single group object
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [groupMembers, setGroupMembers] = useState([]);
    const [showMembersTooltip, setShowMembersTooltip] = useState(false);

    // Hooks
    const { groupId } = useParams();    // get group id from URL
    const navigate = useNavigate();

    // fetch data for specific group 
    const loadGroupDetails = useCallback(async () => {
        setLoading(true);
        const fetchedGroup = await getGroupById(groupId);
        setGroup(fetchedGroup);
        setLoading(false);
    }, [groupId]);
    
    // Hook that runs if groupId changes
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
    const handlePostCreated = () => {
        handleClosePostModal();
        loadGroupDetails();
    };

    const handleBackClick = () => {
        navigate(-1);   // goes one step back on history stack
    };

    const handleOpenPostModal = () => setIsPostModalOpen(true);
    const handleClosePostModal = () => setIsPostModalOpen(false);
    const handleJoinClick = async (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }

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
    };

    // Render
    if (loading) {
        return <div className="page-wrapper">Loading group...</div>;
    }

    if (!group) {
        return (
            <div className="page-wrapper">
                <h1>Group Not Found</h1>
            </div>
        );
    }

  return (
    <div className="page-wrapper group-detail-page-wrapper">
        <div className="group-detail-layout">
            <div className="group-main-content">
                <button 
                onClick={handleBackClick}
                className="back-button">← Back</button>
                {group.coverPhotoUrl && (
                    <div className="group-detail-cover-photo"
                    style={{ backgroundImage: `url(${group.coverPhotoUrl})`}}></div>
                )}
                <GroupHeader name={group.name}
                isUserJoined={group.isUserJoined}
                onJoinClick={handleJoinClick}
                />

                <div className="group-description-header">
                    <div className="description-name">Group Description</div>
                </div>

                <div className="group-description-box">
                    <p>{group.description}{" "}</p>
                    <div
                        className="members-info-wrapper"
                        onMouseEnter={() => setShowMembersTooltip(true)}
                        onMouseLeave={() => setShowMembersTooltip(false)}
                        >
                    <span>Members: {group.memberCount}</span>
                    <MembersTooltip
                        members={groupMembers}
                        show={showMembersTooltip} />
                    </div>
                </div>

                <div className="group-discussion-header">
                    <div className="discussion-name">Group Discussion</div>
                        {group.isUserJoined && (
                        <NewPostButton onClick={handleOpenPostModal} hoverText="Add Post" customClass="small-post-button" />
                    )}
                </div>

                {group.posts && group.posts.length > 0 ? (
                    group.posts.map((groupPost) => (
                        <Post
                            key={groupPost.id}
                            post={groupPost}
                            isGroupPost={true}
                        />
                    ))
                ) : (
                    <p>No discussions yet. Start one!</p>
                )}
            </div>

            <div className="group-sidebar">
                <h3 className="sidebar-header">Upcoming group meetings:</h3>
                <GroupInfoSidebar event={group.nextEvent} />
            </div>
        </div>

        <Modal isOpen={isPostModalOpen} onClose={handleClosePostModal}>
            <NewPostForm
                onSubmitSuccess={handlePostCreated}
                onCancel={handleClosePostModal}
                groupId={groupId} />
        </Modal>
    </div>
  );
}
