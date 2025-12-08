import React from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../reusable-components/EventCard";
import NewPostButton from "../reusable-components/NewPostButton.jsx";
import Modal from "../reusable-components/Modal.jsx";
import NewEventForm from "../reusable-components/NewEventForm.jsx";
import "../index.css";
import { useEventsPage } from "../hooks/useEventsPage.js";

export default function Events() {
  const navigate = useNavigate();

  const {
    events,
    groups,
    loading,
    error,
    isModalOpen,
    openModal,
    closeModal,
    currentUserId,
    handleToggleAttend,
    handleCreateEvent,
  } = useEventsPage();

  return (
    <div className="page-wrapper">
      <div className="feature-header">
        <div className="feature-names">Events</div>
        <NewPostButton onClick={openModal} hoverText="create event" />
      </div>

      <div className="main-content">
        {loading && <p>Loading events...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && events.length === 0 && <p>No events yet.</p>}

        {!loading &&
          !error &&
          events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              currentUserId={currentUserId}
              onToggleAttend={() => handleToggleAttend(ev.id)}
              onClick={() => navigate(`/events/${ev.id}`)}
            />
          ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <NewEventForm
          groups={groups}
          onSubmit={handleCreateEvent}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
