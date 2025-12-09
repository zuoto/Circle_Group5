import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { mapParseEvent, getUserAvatar } from "../utils/eventHelpers.js";

const Parse = window.Parse;

export function useEventDetails(eventId) {
  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const navigate = useNavigate();
  const currentUser = Parse.User.current();

  // Load event + attendees
  const loadEvent = useCallback(async () => {
    if (!eventId) {
      console.warn("No eventId in route params");
      setEvent(null);
      setLoadingEvent(false);
      return;
    }

    setLoadingEvent(true);
    try {
      const EventClass = Parse.Object.extend("Event");
      const query = new Parse.Query(EventClass);

      query.include("event_host");
      query.include("parent_group");
      query.equalTo("objectId", eventId);

      const result = await query.first();
      if (!result) {
        console.warn("No Event found for id:", eventId);
        setEvent(null);
        return;
      }

      const baseEvent = mapParseEvent(result);

      // Attendees relation
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
  }, [eventId]);

  // Load posts belonging to this event
  const loadPosts = useCallback(async () => {
    if (!eventId) return;

    setLoadingPosts(true);
    try {
      const PostClass = Parse.Object.extend("Post");
      const query = new Parse.Query(PostClass);

      const eventPtr = new Parse.Object("Event");
      eventPtr.id = eventId;

      query.equalTo("parent_event", eventPtr);
      query.include("post_author");
      query.descending("createdAt");

      const rows = await query.find();

      const mapped = rows.map((p) => {
        const author = p.get("post_author");
        return {
          id: p.id,
          text: p.get("text"), // adjust if your field name is different
          createdAt: p.createdAt,
          author: author
            ? {
                id: author.id,
                name:
                  author.get("user_firstname") ||
                  author.get("username") ||
                  "Unknown",
                avatar: getUserAvatar(author),
              }
            : null,
        };
      });

      setPosts(mapped);
    } catch (err) {
      console.error("Error loading event posts:", err);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const isOwner = currentUser && event && event.hostId === currentUser.id;

  const handleDeleteEvent = useCallback(async () => {
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
  }, [event, navigate]);

  const openPostModal = () => setIsPostModalOpen(true);
  const closePostModal = () => setIsPostModalOpen(false);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setIsPostModalOpen(false);
  };

  return {
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
  };
}
