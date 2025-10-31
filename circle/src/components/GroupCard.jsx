import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

function GroupCard({ id, name, description, memberCount, isUserJoined, coverPhotoUrl }) {

    const Checkmark = () => <span role="img" aria-label="checkmark">✔️</span>;
    const [isJoined, setIsJoined] = useState(isUserJoined || false);

    const handleJoinClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsJoined(!isJoined);
    };

    const joinButtonText = isJoined ? (
        <>
        <Checkmark >Joined</Checkmark>
        </>
    ) : "Join";
    const joinButtonClass = isJoined ? "joined-button" : 'primary-button';

    return(
        <Link to={`/features/groups/${id}`} className="group-card-link">
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
                    <button className={joinButtonClass} onClick={handleJoinClick}>{joinButtonText}</button>
                </div>
                </div>
            </div>
        </Link>
    );
    
}
export default GroupCard;