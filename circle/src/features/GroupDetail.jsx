import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import GroupHeader from "../components/GroupHeader";
import GroupInfoSidebar from "../components/GroupInfoSidebar"; 
import Post from "../reusable-components/Post";
import NewPostButton from "../reusable-components/NewPostButton";
import Modal from "../reusable-components/Modal";
import NewPostForm from "../reusable-components/NewPostForm";
import MembersTooltip from "../components/MembersTooltip";
import { useGroupDetails } from "../hooks/useGroupDetails";

export default function GroupDetail() {

    // Get state and handlers from useGroupDetails hook
    const {
        group,
        loading,
        error,
        groupMembers,
        showMembersTooltip,
        isPostModalOpen,
        handleJoinClick,
        handlePostCreated,
        handleOpenPostModal,
        handleClosePostModal,
        setShowMembersTooltip,
        groupId,
    } = useGroupDetails();

    const navigate = useNavigate();

    // Handlers
    const handleBackClick = () => {
        navigate(-1);   // goes one step back on history stack
    };

    // Render
    if (loading) {
        return <div className="page-wrapper">Loading group...</div>;
    }

    if (error) {
        return (
            <div className="page-wrapper">
                <div className="error-container">
                    <h1>Oops! Something went wrong</h1>
                    <p>{error}</p>
                    <button onClick={handleBackClick} className="back-button">← Back</button>
                </div>
            </div>
        );
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
