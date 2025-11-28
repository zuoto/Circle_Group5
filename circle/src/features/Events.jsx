import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import profilepic from "../../public/avatars/default.png";
import EventInfoSidebar from "../components/EventInfoSidebar.jsx";
import EventCommentsSection from "../components/EventCommentsSection.jsx";
import Modal from "../reusable-components/Modal.jsx";

const Parse = window.Parse;

function getUserAvatar(user) {
  if (!user) return profilepic;

  const pic = user.get("profile_picture");
  if (!pic) return profilepic;

  if (typeof pic === "string") return pic;
  if (typeof pic.url === "function") return pic.url();

  return profilepic;
}

// Map Parse Event → UI object
function mapParseEvent(e) {
  const date = e.get("event_date");
  const iso = date ? date.toISOString() : null;

  const host = e.get("event_host");
  const group = e.get("parent_group");
  const coverFile = e.get("event_cover");

  return {
    id: e.id,
    title: e.get("event_name"),
    description: e.get("event_info"),
    date: iso,
    location: e.get("event_location_text") || "",

    hostId: host ? host.id : null,
    hostName: host ? host.get("user_firstname") || "Unknown" : "Unknown",
    hostAvatar: getUserAvatar(host),

    groupId: group ? group.id : null,
    groupName: group ? group.get("group_name") : null,

    cover: coverFile ? coverFile.url() : null,

    attendees: [],
  };
}

export default function EventDetail() {
  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { eventId } = useParams();
  const navigate = useNavigate();
  const currentUser = Parse.User.current();

  // Load event + attendees
  useEffect(() => {
    async function loadEvent() {
      setLoadingEvent(true);
      try {
        const EventClass = Parse.Object.extend("Event");
        const query = new Parse.Query(EventClass);

        query.include("event_host");
        query.include("parent_group");
        query.equalTo("objectId", eventId);

        const result = await query.first();
        if (!result) {
          setEvent(null);
          return;
        }

        const baseEvent = mapParseEvent(result);

        // Attendees from relation "event_attendees"
        let attendees = [];
        try {
          const relation = result.relation("event_attendees");
          const rows = await relation.query().find();
          attendees = rows.map((u) => ({
            id: u.id,
            name:
              u.get("user_firstname") ||
              u.get("username") ||
              "Unknown",
            avatar: getUserAvatar(u),
          }));
        } catch (attErr) {
          console.error("Error loading event attendees:", attErr);
        }

        setEvent({ ...baseEvent, attendees });
      } catch (err) {
        console.error("Error loading event:", err);
        setEvent(null);
      } finally {
        setLoadingEvent(false);
      }
    }

    loadEvent();
  }, [eventId]);

  const handleBackClick = () => navigate(-1);

  const isOwner =
    currentUser && event && event.hostId === currentUser.id;

  const handleOpenDeleteModal = () => setIsDeleteModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  const handleConfirmDelete = async () => {
    if (!event) return;

    try {
      const EventClass = Parse.Object.extend("Event");
      const query = new Parse.Query(EventClass);
      const obj = await query.get(event.id);
      await obj.destroy();

      setIsDeleteModalOpen(false);
      navigate("/events");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event.");
      setIsDeleteModalOpen(false);
    }
  };

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
        {/* LEFT COLUMN */}
        <div className="group-main-content">
          <button onClick={handleBackClick} className="back-button">
            ← Back
          </button>

          {event.cover && (
            <div
              className="group-detail-cover-photo"
              style={{ backgroundImage: `url(${event.cover})` }}
            />
          )}

          {/* Header */}
          <div className="group-header">
            <div className="user-info event-header">
              <Link
                to={event.hostId ? `/users/${event.hostId}` : "#"}
                onClick={(e) => {
                  if (!event.hostId) e.preventDefault();
                }}
                className="user-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <img
                  src={event.hostAvatar}
                  alt={event.hostName}
                  className="avatar"
                />
              </Link>
              <div>
                <h2 className="event-detail-title">{event.title}</h2>
                {event.groupName && event.groupId && (
                  <div className="event-meta">
                    In group{" "}
                    <Link to={`/groups/${event.groupId}`}>
                      <strong>{event.groupName}</strong>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="group-description-box">
            <h3>Event Description</h3>
            <p>{event.description}</p>
          </div>

          {/* Comments */}
          <EventCommentsSection eventId={event.id} />
        </div>

        {/* RIGHT COLUMN – sidebar */}
        <div className="group-sidebar">
          <EventInfoSidebar
            event={event}
            isOwner={isOwner}
            onDeleteClick={handleOpenDeleteModal}
          />
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal}>
        <div className="delete-confirm-modal">
          <h3>Delete this event?</h3>
          <p>This action cannot be undone.</p>
          <div className="form-actions">
            <button
              className="secondary-button"
              onClick={handleCloseDeleteModal}
            >
              Cancel
            </button>
            <button
              className="danger-button"
              onClick={handleConfirmDelete}
            >
              Yes, delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
