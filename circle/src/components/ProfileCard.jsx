import React from "react";

//container that reuses the visual styles of a group-card
function Card({ title, children }) {
  return (
    <div className="group-card profile-card">
      {title && <h3>{title}</h3>}
      <div className="card-content">{children}</div>
    </div>
  );
}
export default Card;
