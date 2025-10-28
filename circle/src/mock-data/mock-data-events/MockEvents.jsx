// src/mock-data/MockEvents.jsx
import { users } from "../mock-data-user/MockDataUsers.jsx";

export const mockEvents = [
  {
    id: "e1",
    title: "70's Disco Fever @ Reffen",
    description:
      "Step into the groove and travel back to the dazzling era of disco at Reffen! Funky beats, shimmering outfits, and non-stop vibes straight out of the 70's.",
    details: [
      "DJ lineup: Donna Summer, Chic, Bee Gees classics and more.",
      "Dress code: bell bottoms, platforms, sequins, afros.",
      "Retro photo booth for your groovy looks.",
      "Cocktail specials: Grasshopper, Harvey Wallbanger, Disco Daiquiri.",
      "Live dance show with dazzling routines.",
    ],
    date: "2025-11-08T18:00:00.000Z", // Saturday, 6 PM until late
    location: "Reffen (Disco Hall)",
    hostId: "u2",
    attendees: ["u1", "u3", "u6"],
    tags: ["music", "party", "disco", "70s"],
    cover: "/images/events/disco.jpg",
  },
  {
    id: "e2",
    title: "Board Games & Chai Night",
    description:
      "Cozy strategy night: bring a friend or join a table. Learn a new game or crush Catan diplomatically.",
    details: [
      "Open tables for Catan, Azul, Wingspan, and more.",
      "Warm chai + snacks corner.",
      "Friendly mini-tournament (prizes! )",
    ],
    date: "2025-11-05T18:00:00.000Z",
    location: "Bastard Cafe",
    hostId: "u1",
    attendees: ["u2", "u4", "u5"],
    tags: ["social", "games", "cozy"],
    cover: "/images/events/boardgames.jpg",
  },
  {
  id: "e3",
  title: "Cult Movie Marathon: Midnight Madness @ Husets Biograf",
  description:
    "A night for true film fanatics! Join us for a cult-classic triple feature at Husets Biograf — from campy horror to cosmic comedy. Expect trivia, popcorn, and questionable life choices.",
  details: [
    "Lineup: The Rocky Horror Picture Show, Repo Man, and The Room.",
    "Sing-along intermissions & movie trivia between screenings.",
    "Midnight snacks and themed cocktails at the bar.",
    "Dress as your favorite cult character for a chance to win free tickets!",
  ],
  date: "2025-11-15T19:00:00.000Z",
  location: "Husets Biograf, Rådhusstræde 13",
  hostId: "u3",
  attendees: ["u1", "u2", "u5", "u7"],
  tags: ["cinema", "cult", "social", "nightlife"],
  cover: "/images/events/cult-marathon.jpg",
}
];


// helper to attach people objects (host + attendees) 
export const withPeople = (event) => ({
  ...event,
  host: users.find((u) => u.id === event.hostId),
  attendeeObjects: event.attendees
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean),
});
