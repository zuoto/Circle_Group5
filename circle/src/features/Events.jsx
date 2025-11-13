// src/features/Events.jsx
import { useEffect, useState } from "react";
import Parse from "../lib/parseClient";
import EventTile from "../reusable-components/EventTile.jsx";
import EventCard from "../reusable-components/EventCard.jsx";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const currentUserId = "u1";
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // ← you were missing this

  useEffect(() => {
    async function loadEvents() {
      try {
        const Event = Parse.Object.extend("Event");
        const query = new Parse.Query(Event);
        query.ascending("event_date");
        const results = await query.find();

        const mapped = results.map((e) => ({
          id: e.id,
          title: e.get("event_name"),
          description: e.get("event_info"),
          date: e.get("event_date"),
          // these don't exist in the DB yet, so we just fake / leave empty
          location: e.get("location") || "",
          hostId: "u2", // temporary: pick a mock host so EventCard works
          attendees: [],
          tags: [],
          cover: null,
          details: [],
        }));

        setEvents(mapped);
        setSelected(mapped[0] || null);
      } catch (err) {
        console.error("Failed to load events:", err);
        setError("Could not load events");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  const handleToggleAttend = () => {
    console.log("Toggle attend for", selected?.id);
  };

  if (loading) return <p>Loading events…</p>;
  if (error) return <p>{error}</p>;
  if (events.length === 0) return <p>No events found in the database.</p>;

  return (
    <div className="events-layout">
      {/* left: list */}
      <div className="events-list">
        {events.map((ev) => (
          <EventTile
            key={ev.id}
            event={ev}
            onOpen={(event) => setSelected(event)}
          />
        ))}
      </div>

      {/* right: details */}
      <div className="events-detail">
        <EventCard
          event={selected}
          currentUserId={currentUserId}
          onToggleAttend={handleToggleAttend}
        />
      </div>
    </div>
  );
}
