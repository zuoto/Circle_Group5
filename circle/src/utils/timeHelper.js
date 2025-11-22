export const formatMeetupTime = (dateString) => {
  if (!dateString) return "No date set";
  const date = new Date(dateString);
  const time = date.toLocaleTimeString("en-Uk", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const day = date.toLocaleDateString("en-Uk", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${time} on ${day}`;
};

export const formatTimeAgo = (dateString) => {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
};