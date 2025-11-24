import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GroupHeader from "../components/GroupHeader";
import GroupInfoSidebar from "../components/GroupInfoSidebar"; 
import Post from "../reusable-components/Post";
import { getGroupById } from "../services/ParseGroupService";
import NewPostButton from "../reusable-components/NewPostButton";
import Modal from "../reusable-components/Modal";
import NewPostForm from "../reusable-components/NewPostForm";
import createPost from "../services/feed/createPost";

export default function GroupDetail() {

    // State: starts as null for the single group object
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    // Hooks
    const { groupId } = useParams();    // get group id from URL
    const navigate = useNavigate();

    // fetch data for specific group with useEffect hook
    useEffect(() => {
        async function loadGroupDetails() {
            setLoading(true);
            const fetchedGroup = await getGroupById(groupId);
            setGroup(fetchedGroup);
            setLoading(false);
        }

        loadGroupDetails();
    }, [groupId]);  // hook re-runs if groupId changes

    // Handlers
    const handleBackClick = () => {
        navigate(-1);   // goes one step back on history stack
    };

    const handleOpenPostModal = () => setIsPostModalOpen(true);
    const handleClosePostModal = () => setIsPostModalOpen(false);
    const handleCreateGroupPost = async () => {
        
    };

    // Render
    if (loading) {
        return <div className="page-wrapper">Loading group...</div>;
    }

    if (!group) {
        return (
            <div className="page-wrapper">
                <h1>Group Not Found</h1>
                <button onClick={handleBackClick} className="back-button">← Back</button>
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
                />

                <div className="group-description-box">
                    <h3>Group Description</h3>
                    <p>{group.description}{" "}</p>
                </div>

                <div className="feature-header" style={{marginBottom: '1rem'}}>
                    <h3>Group Discussion</h3>
                    {group.isUserJoined && (
                        <NewPostButton onClick={handleOpenPostModal} hoverText="Add Post" />
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
                <GroupInfoSidebar meetup={group.nextMeetup} />
            </div>
        </div>

        <Modal isOpen={isPostModalOpen} onClose={handleClosePostModal}>
            <NewPostForm
                onCancel={handleClosePostModal}
                onSubmit={() => {
                    handleClosePostModal();
                    window.location.reload();
                }}
                groupId={groupId} />
        </Modal>
    </div>
  );
}
