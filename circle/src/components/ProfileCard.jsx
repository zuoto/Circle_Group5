import React from "react";

//container that reuses the visual styles of a group-card
function Card({ title, children }) {
  return (
    // Reuses the .group-card style (box-shadow, border-radius, background)
    <div className="group-card profile-card">
      {/* Reuses the H3 tag style (Funnel Display, bold) */}
      {title && <h3>{title}</h3>}
      <div className="card-content">{children}</div>
    </div>
  );
}
export default Card;
