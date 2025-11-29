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

// Reusable mapper: Parse Event → plain JS object
export function mapParseEvent(e) {
  const date = e.get("event_date");
  const iso = date ? date.toISOString() : null;

  const host = e.get("event_host");
  const group = e.get("parent_group");
  const coverFile = e.get("event_cover");

  return {
    id: e.id,
    title: e.get("event_name"),
    description: e.get("event_info"),
    date: iso,
    location: e.get("event_location_text") || "",

    hostId: host ? host.id : null,
    hostName: host ? host.get("user_firstname") || "Unknown" : "Unknown",
    hostAvatar: getUserAvatar(host),

    groupId: group ? group.id : null,
    groupName: group ? group.get("group_name") : null,

    cover: coverFile ? coverFile.url() : null,

    attendees: [],
    tags: [],
  };
}
