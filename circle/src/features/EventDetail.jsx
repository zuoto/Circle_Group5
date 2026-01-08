import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import EventInfoSidebar from "../components/EventInfoSidebar.jsx";
import Modal from "../reusable-components/Modal.jsx";
import NewPostForm from "../reusable-components/NewPostForm.jsx";

import { useEventDetails } from "../hooks/useEventDetails.js";
import EventHeaderSection from "../components/EventHeaderSection.jsx";
import EventDiscussionSection from "../components/EventDiscussionSection.jsx";

export default function EventDetail() {
  const params = useParams();
  const eventId = params.eventId || params.id;

  const navigate = useNavigate();

  const {
    event,
    loadingEvent,
    posts,
    loadingPosts,
    isPostModalOpen,
    openPostModal,
    closePostModal,
    handlePostCreated,
    isOwner,
    handleDeleteEvent,
    currentUser,
  } = useEventDetails(eventId);

  const handleBackClick = () => navigate(-1);

  if (loadingEvent) {
    return <div className="page-wrapper">Loading event...</div>;
  }

  if (!event) {
    return (
      <div className="page-wrapper">
        <h1>Event Not Found</h1>
        <p>Could not find any event with this ID.</p>
        <button onClick={handleBackClick} className="back-button">
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrapper group-detail-page-wrapper">
      <div className="group-detail-layout">
        {/* LEFT COLUMN – main content */}
        <div className="group-main-content">
          <button onClick={handleBackClick} className="back-button">
            ← Back
          </button>

          {/* Header (cover + host + group link) */}
          <EventHeaderSection event={event} />

          {/* Description inline */}
          <div className="group-description-box">
            <h3>Event Description</h3>
            <p>{event.description}</p>
          </div>

          {/* Discussion / posts */}
          <EventDiscussionSection
            posts={posts}
            loadingPosts={loadingPosts}
            canPost={!!currentUser}
            onOpenPostModal={openPostModal}
          />
        </div>

        {/* RIGHT COLUMN – sidebar */}
        <div className="group-sidebar">
          <EventInfoSidebar
            event={event}
            isOwner={isOwner}
            onDelete={handleDeleteEvent}
          />
        </div>
      </div>

      {/* NEW POST MODAL */}
      <Modal isOpen={isPostModalOpen} onClose={closePostModal}>
        <NewPostForm
          onSubmitSuccess={handlePostCreated}
          onCancel={closePostModal}
          eventId={eventId}
        />
      </Modal>
    </div>
  );
}
