import { useState } from "react";

export default function ImInButton({ initial = false, onToggle }) {
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
    >
      {joined ? "You're in!" : "I'm in!"}
    </button>
  );
}
