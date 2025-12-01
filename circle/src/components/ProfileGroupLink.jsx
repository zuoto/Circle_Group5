import React from "react";
import { Link } from "react-router-dom";

export default function ({ group }) {
  return (
    <Link
      key={group.id}
      to={`/groups/${group.id}`}
      className="group-card-link-compact"
    >
      <div className="group-card-compact">
        <h3 style={{ margin: 0 }}>{group.name}</h3>
      </div>
    </Link>
  );
}
