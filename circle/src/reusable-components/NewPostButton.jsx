import { useState } from "react";

export default function NewPostButton({ onClick, hoverText = "add a post" }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className="new-post-button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {isHovered ? hoverText : "+"}
    </button>
  );
}
