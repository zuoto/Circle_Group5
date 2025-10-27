import { useState } from "react";

export default function ImInButton({ initial = false, onToggle, onMouseEnter, onHover, onMouseLeave }) {
  const [joined, setJoined] = useState(initial);

  function handleClick() {
    setJoined((j) => {
      const next = !j;
      if (onToggle) onToggle(next);
      return next;
    });
  }

  return (
    <button
      type="button"
      className={joined ? "primary-button-joined" : "primary-button"}
      onClick={handleClick}
      aria-pressed={joined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {joined ? "You're in!" : "I'm in!"}
    </button>
  );
}
