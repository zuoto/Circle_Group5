import React, { useState } from "react";
import "../index.css";

export default function EventAttendButton({ isAttending, onClick }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation(); // don't trigger card navigation
    if (!onClick || loading) return;

    try {
      setLoading(true);
      await onClick();      // parent (Events.jsx) handles Parse update
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
    ? "joined-button-small"
    : "primary-button";

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
