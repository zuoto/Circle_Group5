import React from "react";
import JoinButton from "../reusable-components/JoinButton";

function GroupHeader({ name, isUserJoined, onJoinClick }) {

    return(
       <div className="group-header">
        <h1>{name}</h1>
        <div className="group-actions">
            <button className="secondary-button share-button">Share</button>
            <JoinButton
                isUserJoined={isUserJoined}
                onClick={onJoinClick}
            />
        </div>
       </div>
    );
}
export default GroupHeader;