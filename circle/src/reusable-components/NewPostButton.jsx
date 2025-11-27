import { useState } from "react";

export default function NewPostButton({ onClick, hoverText = "add a post", customClass }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className={`new-post-button ${customClass || ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {isHovered ? hoverText : "+"}
    </button>
  );
}
