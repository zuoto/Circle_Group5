import { useEffect, useState } from "react";
import EventTile from "../reusable-components/EventTile";
import EventCard from "../reusable-components/EventCard";

// Use the same Parse instance that AuthProvider uses
const Parse = window.Parse;

export default function Events() {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        // Query the Event class via Parse SDK
        const EventClass = Parse.Object.extend("Event");
        const query = new Parse.Query(EventClass);

        // sort by date, include host pointer
        query.ascending("event_date");
        query.include("event_host");

        const rows = await query.find();
        console.log("Events from Parse SDK:", rows);

        const mapped = rows.map((e) => {
          const eventDate = e.get("event_date"); 
          const iso = eventDate ? eventDate.toISOString() : null;

          const hostObj = e.get("event_host");

          return {
            id: e.id, // same as objectId
            title: e.get("event_name"),
            description: e.get("event_info"),
            // string for your existing formatMeetupTime(dateString) helper
            meetupTime: iso,
            // also keep a generic date field as string for anything else
            date: iso,
            location: e.get("event_location") || "",
            hostId: hostObj ? hostObj.id : "u2",
            attendees: [], // you can wire event_attendees later
            tags: [],
          };
        });

        setEvents(mapped);
        setSelected(mapped[0] || null);
      } catch (err) {
        console.error("Error loading events via Parse SDK:", err);
        setEvents([]);
      }
    }

    load();
  }, []);

  if (events.length === 0) return <p>No events yet</p>;

  return (
    <div className="events-layout">
      <div className="events-list">
        {events.map((ev) => (
          <EventTile key={ev.id} event={ev} onOpen={() => setSelected(ev)} />
        ))}
      </div>

      <div className="events-detail">
        <EventCard event={selected} currentUserId="u1" />
      </div>
    </div>
  );
}
