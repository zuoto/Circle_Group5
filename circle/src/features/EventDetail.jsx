import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Parse = window.Parse;

// Reuse the same mapping as in Events.jsx
function mapParseEvent(e) {
  const date = e.get("event_date");
  const iso = date ? date.toISOString() : null;

  const host = e.get("event_host");
  const group = e.get("parent_group");

  return {
    id: e.id,
    title: e.get("event_name"),
    description: e.get("event_info"),
    date: iso,
    location: e.get("event_location") || "",

    hostId: host ? host.id : null,
    hostName: host ? host.get("user_firstname") || "Unknown" : "Unknown",
    hostAvatar: host
      ? host.get("avatar_url") || "/avatar/default.jpg"
      : "/avatar/default.jpg",

    groupId: group ? group.id : null,
    groupName: group ? group.get("group_name") : null,

    attendees: e.get("event_attendees") || [],
    tags: [],
  };
}

export default function EventDetail() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const { eventId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      try {
        const EventClass = Parse.Object.extend("Event");
        const query = new Parse.Query(EventClass);

        query.include("event_host");
        query.include("parent_group");
        query.equalTo("objectId", eventId);

        const result = await query.first();
        if (result) {
          setEvent(mapParseEvent(result));
        } else {
          setEvent(null);
        }
      } catch (err) {
        console.error("Error loading event:", err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  const handleBackClick = () => {
    navigate(-1);
  };

  if (loading) {
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
        {/* LEFT COLUMN – main content, same structure as GroupDetail */}
        <div className="group-main-content">
          <button onClick={handleBackClick} className="back-button">
            ← Back
          </button>

          {/* Reuse cover style class if you later add event.cover */}
          {event.cover && (
            <div
              className="group-detail-cover-photo"
              style={{ backgroundImage: `url(${event.cover})` }}
            />
          )}

          {/* This mimics GroupHeader area visually */}
          <div className="group-header">
            <div className="user-info event-header">
              <img
                src={event.hostAvatar}
                alt={event.hostName}
                className="avatar"
              />
              <div>
                <h2 className="event-detail-title">{event.title}</h2>
                <div className="event-meta">
                  Hosted by <strong>{event.hostName}</strong>
                  {event.groupName && (
                    <> · in group <strong>{event.groupName}</strong></>
                  )}
                  {event.date && (
                    <>
                      <br />
                      <span>
                        {new Date(event.date).toLocaleString("en-GB", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </>
                  )}
                  {event.location && (
                    <>
                      <br />
                      <span>📍 {event.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Reuse the same description box styling as groups */}
          <div className="group-description-box">
            <h3>Event Description</h3>
            <p>{event.description}</p>
          </div>

          {/* Future: event comments will go here */}
          {/* <CommentsForEvent eventId={event.id} /> */}
        </div>

        {/* RIGHT COLUMN – sidebar, styled like GroupInfoSidebar */}
        <div className="group-sidebar">
          <h3 className="sidebar-header">Event details</h3>
          <p>
            <strong>Attending:</strong> {event.attendees.length} people
          </p>

          {event.groupName && (
            <p>
              <strong>Hosted in group:</strong> {event.groupName}
            </p>
          )}

          {event.date && (
            <p>
              <strong>Date & time:</strong>{" "}
              {new Date(event.date).toLocaleString()}
            </p>
          )}

          {event.location && (
            <p>
              <strong>Location:</strong> {event.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
