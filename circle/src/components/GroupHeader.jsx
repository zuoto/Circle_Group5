import React from "react";
import { useState } from "react";

const Checkmark = () => <span role="img" aria-label="checkmark">✔️</span>;

function GroupHeader({ name }) {
    const [isJoined, setIsJoined] = useState(false);
    const handleJoinClick = () => {
        setIsJoined(!isJoined);
    };

    const buttonChange = isJoined ? "joined-button" : "primary-button";
    const buttonText = isJoined ? (
        <>
        <Checkmark >Joined</Checkmark>
        </>
    ) : "Join";

    return(
       <div className="group-header">
        <h1>{name}</h1>
        <div className="group-actions">
            <button className="secondary-button share-button">Share</button>
            <button className={buttonChange} onClick={handleJoinClick}>{buttonText}</button>
        </div>
       </div>
    );
}
export default GroupHeader;