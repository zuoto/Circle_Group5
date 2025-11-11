import React, { useState } from "react";

function JoinButton({ isUserJoined, onClick, className }) {
 
    const [isJoined, setIsJoined] = useState(isUserJoined || false);

    const handleJoinClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Toggle
        setIsJoined(!isJoined);

        if (onClick) {
            onClick(e);
        }
    };

    const buttonText = isJoined ? "Joined" : "Join";
    const buttonClass = isJoined ? "joined-button" : 'primary-button';

    return (
        <button
            className={`${buttonClass} ${className || ''}`}
            onClick={handleJoinClick}
        >
            {buttonText}
        </button>
    );
}

export default JoinButton;