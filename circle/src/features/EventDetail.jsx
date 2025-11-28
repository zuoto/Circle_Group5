import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Comment from "../reusable-components/Comment.jsx";
import EventCommentButton from "../reusable-components/EventCommentButton.jsx";
import profilepic from "../../public/avatars/default.png";
import EventInfoSidebar from "../components/EventInfoSidebar.jsx";

const Parse = window.Parse;

// Helper: consistent avatar logic
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

    attendees: [], // will be filled after loading relation
  };
}

export default function EventDetail() {
  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const [comments, setComments] = useState([]); // Parse objects
  const [loadingComments, setLoadingComments] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");

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
        if (result) {
          const baseEvent = mapParseEvent(result);

          // Load attendees from relation "event_attendees"
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
        } else {
          setEvent(null);
        }
      } catch (err) {
        console.error("Error loading event:", err);
        setEvent(null);
      } finally {
        setLoadingEvent(false);
      }
    }

    loadEvent();
  }, [eventId]);

  // Load comments for this event
  useEffect(() => {
    if (!eventId) return;

    async function loadComments() {
      setLoadingComments(true);
      try {
        const EventCommentClass = Parse.Object.extend("EventComments");
        const query = new Parse.Query(EventCommentClass);

        const eventPtr = new Parse.Object("Event");
        eventPtr.id = eventId;

        query.equalTo("parent_event", eventPtr);
        query.include("comment_author");
        query.ascending("createdAt");

        const rows = await query.find();
        setComments(rows); // pass Parse objects directly to <Comment />
      } catch (err) {
        console.error("Error loading event comments:", err);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    }

    loadComments();
  }, [eventId]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCommentAdded = (savedComment) => {
    setComments((prev) => [...prev, savedComment]);
    setNewCommentText("");
  };

  // 🔑 Only host can delete
  const isOwner =
    currentUser && event && event.hostId === currentUser.id;

  const handleDeleteEvent = async () => {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;

    try {
      const EventClass = Parse.Object.extend("Event");
      const query = new Parse.Query(EventClass);
      const obj = await query.get(event.id);
      await obj.destroy();

      navigate("/events");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event.");
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
        {/* LEFT COLUMN – main content */}
        <div className="group-main-content">
          <button onClick={handleBackClick} className="back-button">
            ← Back
          </button>

          {/* Cover image */}
          {event.cover && (
            <div
              className="group-detail-cover-photo"
              style={{ backgroundImage: `url(${event.cover})` }}
            />
          )}

          {/* Header: avatar, title, optional group */}
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

          {/* COMMENTS */}
          <div className="comment-section">
            <h3>Comments</h3>

            {loadingComments && <p>Loading comments...</p>}

            {!loadingComments && comments.length === 0 && (
              <p>No comments yet. Be the first.</p>
            )}

            {!loadingComments &&
              comments.map((c) => <Comment key={c.id} comment={c} />)}

            {/* New comment form */}
            <div className="comment-form" style={{ marginTop: "16px" }}>
              <textarea
                className="post-textarea"
                style={{ minHeight: "80px" }}
                placeholder="Write a comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "8px",
                }}
              >
                <EventCommentButton
                  eventId={event.id}
                  commentText={newCommentText}
                  onCommentAdded={handleCommentAdded}
                />
              </div>
            </div>
          </div>
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
    </div>
  );
}
