import { useEffect, useState } from "react";
import { getEvents } from "../lib/api";
import EventTile from "../reusable-components/EventTile";
import EventCard from "../reusable-components/EventCard";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      const rows = await getEvents();

      const mapped = rows.map(e => ({
        id: e.objectId,
        title: e.event_name,
        description: e.event_info,
        date: e.event_date ? new Date(e.event_date.iso) : null,
        location: "",
        hostId: "u2",
        attendees: [],
        tags: [],
      }));

      setEvents(mapped);
      setSelected(mapped[0] || null);
    }

    load();
  }, []);

  if (events.length === 0) return <p>No events yet</p>;

  return (
    <div className="events-layout">
      <div className="events-list">
        {events.map(ev => (
          <EventTile
            key={ev.id}
            event={ev}
            onOpen={() => setSelected(ev)}
          />
        ))}
      </div>

      <div className="events-detail">
        <EventCard event={selected} currentUserId="u1" />
      </div>
    </div>
  );
}
