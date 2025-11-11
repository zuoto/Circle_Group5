import React from "react";
import JoinButton from "../reusable-components/JoinButton";

function GroupHeader({ name, isUserJoined }) {
    
    const handleJoinToggle = (e, newIsJoinedState) => {
        console.log(`User toggled join state to: ${newIsJoinedState}`);
    };

    return(
       <div className="group-header">
        <h1>{name}</h1>
        <div className="group-actions">
            <button className="secondary-button share-button">Share</button>
            <JoinButton
                isUserJoined={isUserJoined}
                onClick={handleJoinToggle}
            />
        </div>
       </div>
    );
}
export default GroupHeader;