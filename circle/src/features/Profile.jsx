import React, { useState, useEffect } from "react";
import "../index.css";
import { users } from "../mock-data/mock-data-user/MockDataUsers.jsx";

function Profile() {
  const [user, setUser] = useState(null);

  function loadUser() {
    const found = users.find((u) => u.id === "u5");
    setUser(found);
  }

  useEffect(() => {
    loadUser(1);
  }, []);

  return (
    user && (
      <div className="profile-name">
        <img
          src={user.avatar}
          alt={`${user.name} avatar`}
          style={{ width: "150px", height: "150px", borderRadius: "50%" }}
        />
        <div className="name">
          <h1>
            {" "}
            {user.name} {user.surname}{" "}
          </h1>
        </div>
      </div>
    )
  );
}

export default Profile;
