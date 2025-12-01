import profilepic from "/avatars/default.png";

// Reusable avatar helper
export function getUserAvatar(user) {
  if (!user) return profilepic;

  const pic = user.get ? user.get("profile_picture") : user.profile_picture;
  if (!pic) return profilepic;

  if (typeof pic === "string") return pic;
  if (typeof pic.url === "function") return pic.url();

  return profilepic;
}

// Helper: turn "emina.something@gmail.com" → "Emina"
function deriveNameFromUsername(username) {
  if (!username || typeof username !== "string") return null;

  // take part before @
  const [local] = username.split("@");
  if (!local) return null;

  // split on . or _ or - and take the first chunk
  const firstChunk = local.split(/[._-]/)[0] || local;

  if (!firstChunk) return null;

  // Capitalize first letter, keep the rest as-is
  return firstChunk.charAt(0).toUpperCase() + firstChunk.slice(1);
}

// Reusable mapper: Parse Event → plain JS object
export function mapParseEvent(e) {
  const date = e.get("event_date");
  const iso = date ? date.toISOString() : null;

  const host = e.get("event_host");
  const group = e.get("parent_group");
  const coverFile = e.get("event_cover");

  const hostFirstName = host ? host.get("user_firstname") : null;
  const hostUsername = host ? host.get("username") : null;

  // Prefer user_firstname, otherwise derive something human from username
  let hostName = hostFirstName;
  if (!hostName && hostUsername) {
    hostName = deriveNameFromUsername(hostUsername);
  }
  if (!hostName) {
    hostName = "Unknown";
  }

  // Debug once in a while if you like:
  // console.log("EVENT HOST DEBUG", e.id, {
  //   hostId: host ? host.id : null,
  //   hostFirstName,
  //   hostUsername,
  //   resolvedName: hostName,
  // });

  return {
    id: e.id,
    title: e.get("event_name"),
    description: e.get("event_info"),
    date: iso,
    location: e.get("event_location_text") || "",

    hostId: host ? host.id : null,
    hostName,
    hostAvatar: getUserAvatar(host),

    groupId: group ? group.id : null,
    groupName: group ? group.get("group_name") : null,

    cover: coverFile ? coverFile.url() : null,

    attendees: [],
    tags: [],
  };
}
