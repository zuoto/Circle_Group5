import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import JoinButton from "../reusable-components/JoinButton";

function GroupCard({ id, name, description, memberCount, isUserJoined, coverPhotoUrl }) {

    const handleGroupCardJoin = (e) => {
        console.log(`User toggled join state for group ID: ${id}`);
    };

    return(
        <Link to={`/groups/${id}`} className="group-card-link">
            <div className="group-card">
                {coverPhotoUrl && (
                    <div className="group-card-cover-photo"
                    style={{ backgroundImage: `url(${coverPhotoUrl})`}} ></div>
                )}
                <div className="group-card-content">
                    <h3>{name}</h3>
                    <p>{description}</p>
                </div>
                <div className="card-footer-row">
                <span>{memberCount}</span>
                <div className="group-card-actions">
                    <button className="secondary-button" onClick={(e) => { e.preventDefault(); e.stopPropagation();}}>Share</button>
                    <JoinButton
                        isUserJoined={isUserJoined}
                        onClick={handleGroupCardJoin}
                    />
                </div>
                </div>
            </div>
        </Link>
    );
    
}
export default GroupCard;