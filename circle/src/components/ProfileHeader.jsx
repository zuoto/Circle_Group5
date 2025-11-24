import React from "react";
import Card from "./ProfileCard.jsx";
import User from "./User.jsx";

export default function ({ user, profilePictureURL }) {
  if (!user) return null;
  return (
    <div className="profile-main-column">
      <Card>
        <div
          style={{
            justifyContent: "center",
            display: "flex",
            marginBottom: "15px",
          }}
        >
          <User
            src={profilePictureURL}
            alt={`${user.name} picture`}
            size="large"
          />
        </div>

        <div
          className="name"
          style={{
            fontSize: "2em",
            textAlign: "center",
            marginBottom: "15px",
          }}
        >
          {user.name} {user.surname}
        </div>

        <div style={{ textAlign: "center" }}>
          <button className="secondary-button">Edit Profile</button>
        </div>
      </Card>
    </div>
  );
}
