import React, { useState } from "react";
import "../index.css";

export default function EventAttendButton({ isAttending, onClick }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (loading || !onClick) return;

    try {
      setLoading(true);
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  const label = loading
    ? "Updating..."
    : isAttending
    ? "I'm out"
    : "I'm in";

  const buttonClass = isAttending
    ? "event-attend-active"  // green, same size
    : "primary-button";      // normal color

  return (
    <button
      type="button"
      className={buttonClass}
      onClick={handleClick}
      disabled={loading}
    >
      {label}
    </button>
  );
}
