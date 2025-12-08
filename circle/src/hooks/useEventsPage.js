import { useEffect, useState, useCallback } from "react";
import { mapParseEvent } from "../utils/eventHelpers.js";

const Parse = window.Parse;

export function useEventsPage() {
  const [events, setEvents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = Parse.User.current();
  const currentUserId = currentUser ? currentUser.id : null;

  // Load events from backend
  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const EventClass = Parse.Object.extend("Event");
      const query = new Parse.Query(EventClass);

      query.include("event_host");
      query.include("parent_group");
      query.ascending("event_date");

      const rows = await query.find();
      const mapped = rows.map(mapParseEvent);
      setEvents(mapped);
    } catch (err) {
      console.error("Error loading events:", err);
      setError("Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load groups for the "choose group" dropdown
  const loadGroups = useCallback(async () => {
    try {
      const GroupClass = Parse.Object.extend("Group");
      const query = new Parse.Query(GroupClass);
      query.ascending("group_name");

      const rows = await query.find();
      const mappedGroups = rows.map((g) => ({
        id: g.id,
        name: g.get("group_name") || "Unnamed group",
      }));

      setGroups(mappedGroups);
    } catch (err) {
      console.error("Error loading groups for event form:", err);
      setGroups([]);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Toggle attendance using Relation<_User> event_attendees
  const handleToggleAttend = useCallback(
    async (eventId) => {
      if (!currentUserId) {
        alert("You need to be logged in to join an event.");
        return;
      }

      try {
        const existing = events.find((ev) => ev.id === eventId);
        const alreadyAttending = existing
          ? (existing.attendees || []).includes(currentUserId)
          : false;

        const EventClass = Parse.Object.extend("Event");
        const query = new Parse.Query(EventClass);
        const eventObj = await query.get(eventId);

        const relation = eventObj.relation("event_attendees");
        const user = Parse.User.current();

        if (alreadyAttending) {
          relation.remove(user);
        } else {
          relation.add(user);
        }

        await eventObj.save();

        // Update local state
        setEvents((prev) =>
          prev.map((ev) => {
            if (ev.id !== eventId) return ev;

            const current = ev.attendees || [];
            let newAttendees;

            if (alreadyAttending) {
              newAttendees = current.filter((id) => id !== currentUserId);
            } else {
              newAttendees = current.includes(currentUserId)
                ? current
                : [...current, currentUserId];
            }

            return {
              ...ev,
              attendees: newAttendees,
            };
          })
        );
      } catch (err) {
        console.error("Error updating attendance:", err);
        alert("Failed to update attendance. Please try again.");
      }
    },
    [events, currentUserId]
  );

  // Create new event
  const handleCreateEvent = useCallback(async (formData) => {
    try {
      const EventClass = Parse.Object.extend("Event");
      const event = new EventClass();

      event.set("event_name", formData.title);
      event.set("event_info", formData.description);
      event.set("event_date", formData.date);
      event.set("event_location_text", formData.location);

      const host = Parse.User.current();
      if (host) {
        event.set("event_host", host);
      }

      // optional: connect to group if your form sends groupId
      if (formData.groupId) {
        const GroupClass = Parse.Object.extend("Group");
        const groupPtr = new GroupClass();
        groupPtr.id = formData.groupId;
        event.set("parent_group", groupPtr);
      }

      // cover file (browser File → Parse.File)
      if (formData.coverFile) {
        const parseFile = new Parse.File(
          formData.coverFile.name,
          formData.coverFile
        );
        await parseFile.save();
        event.set("event_cover", parseFile);
      }

      const saved = await event.save();

      setEvents((prev) => [...prev, mapParseEvent(saved)]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event.");
    }
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return {
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
  };
}
