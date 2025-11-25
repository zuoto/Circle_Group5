import React from "react";

function JoinButton({ isUserJoined, onClick, className }) {
 
    const handleJoinClick = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (onClick) {
            onClick(e);
        }
    };

    const buttonText = isUserJoined ? "Joined" : "Join";
    const buttonClass = isUserJoined ? "joined-button" : 'primary-button';

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