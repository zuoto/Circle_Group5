import { useEffect, useState } from "react";
import Parse from "parse/dist/parse.min.js";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const Event = Parse.Object.extend("Event");
        const query = new Parse.Query(Event);
        query.ascending("event_date"); // sort by date

        const results = await query.find();

        // Map Parse objects into plain JS objects your UI can use
        const mapped = results.map((e) => ({
          id: e.id,
          title: e.get("event_name"),
          description: e.get("event_info"),
          date: e.get("event_date"), // this is a JS Date
          isActive: e.get("isActive"),
        }));

        setEvents(mapped);
      } catch (err) {
        console.error("Failed to load events:", err);
        setError("Could not load events");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  if (loading) return <p>Loading events…</p>;
  if (error) return <p>{error}</p>;

  if (events.length === 0) {
    return <p>No events found in the database.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Events from Back4App</h1>
      {events.map((ev) => (
        <div key={ev.id} className="border rounded-lg p-4 text-left">
          <h2 className="text-xl font-semibold">{ev.title}</h2>
          <p className="mt-1">{ev.description}</p>
          {ev.date && (
            <p className="mt-2 text-sm text-gray-500">
              {ev.date.toLocaleString()}
            </p>
          )}
          {ev.isActive === false && (
            <p className="mt-1 text-xs text-red-500">Inactive event</p>
          )}
        </div>
      ))}
    </div>
  );
}
