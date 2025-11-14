import { useEffect, useState } from "react";
import EventCard from "../reusable-components/EventCard";

const Parse = window.Parse;

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const EventClass = Parse.Object.extend("Event");
        const query = new Parse.Query(EventClass);

        query.ascending("event_date");
        query.include("event_host");

        const rows = await query.find();
        console.log("Events from Parse SDK:", rows);

        const mapped = rows.map((e) => {
          const eventDate = e.get("event_date"); // JS Date
          const iso = eventDate ? eventDate.toISOString() : null;
          const hostObj = e.get("event_host");

          return {
            id: e.id,
            title: e.get("event_name"),
            description: e.get("event_info") || "",
            // give both, so whatever EventCard uses will work
            meetupTime: iso,
            date: iso,
            location: e.get("event_location") || "",
            hostId: hostObj ? hostObj.id : "u1",
            // keep it simple for now; later you can load real attendees
            attendees: [],
            tags: [],
          };
        });

        setEvents(mapped);
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
      {events.map((ev) => (
        <EventCard key={ev.id} event={ev} currentUserId="u1" />
      ))}
    </div>
  );
}
