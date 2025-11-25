import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../reusable-components/EventCard";
import NewPostButton from "../reusable-components/NewPostButton.jsx";
import Modal from "../reusable-components/Modal.jsx";
import NewEventForm from "../reusable-components/NewEventForm.jsx";
import { getAllGroups } from "../services/ParseGroupService.js";
import "../index.css";

const Parse = window.Parse;

// Map Parse Event → UI
function mapParseEvent(e) {
  const date = e.get("event_date");
  const iso = date ? date.toISOString() : null;

  const host = e.get("event_host");
  const group = e.get("parent_group");
  const coverFile = e.get("event_cover"); // may be undefined, that’s fine

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

    cover: coverFile ? coverFile.url() : null,
    attendees: e.get("event_attendees") || [],
    tags: [],
  };
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Load events + groups
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      // 1) Load events
      try {
        const EventClass = Parse.Object.extend("Event");
        const query = new Parse.Query(EventClass);

        query.include("event_host");
        query.include("parent_group");
        query.ascending("event_date");

        const rows = await query.find();
        setEvents(rows.map(mapParseEvent));
      } catch (err) {
        console.error("Error loading events:", err);
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }

      // 2) Load groups (for dropdown) – but don’t break the page if this fails
      try {
        const fetchedGroups = await getAllGroups();
        setGroups(fetchedGroups);
      } catch (err) {
        console.error("Error loading groups for event form:", err);
        // no setError here on purpose
      }
    }

    loadData();
  }, []);

  const handleCreateEvent = async (formData) => {
    try {
      const EventClass = Parse.Object.extend("Event");
      const event = new EventClass();

      event.set("event_name", formData.title);
      event.set("event_info", formData.description);
      event.set("event_date", formData.date);
      event.set("event_location", formData.location);

      const host = Parse.User.current();
      if (host) {
        event.set("event_host", host);
      }

      // connect to group if chosen
      if (formData.groupId) {
        const GroupClass = Parse.Object.extend("Group");
        const groupPtr = new GroupClass();
        groupPtr.id = formData.groupId;
        event.set("parent_group", groupPtr);
      }

      // optional: event cover
      if (formData.coverFile) {
        const file = new Parse.File(formData.coverFile.name, formData.coverFile);
        await file.save();
        event.set("event_cover", file);
      }

      const saved = await event.save();

      // add to UI
      setEvents((prev) => [...prev, mapParseEvent(saved)]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating event:", err);
      // optionally show a UI error
    }
  };

  return (
    <div className="page-wrapper">
      <div className="feature-header">
        <div className="feature-names">Events</div>
        <NewPostButton
          onClick={() => setIsModalOpen(true)}
          hoverText="create event"
        />
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
              currentUserId="u1"
              onToggleAttend={() => {}}
              onClick={() => navigate(`/events/${ev.id}`)}
            />
          ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NewEventForm
          groups={groups}
          onSubmit={handleCreateEvent}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
