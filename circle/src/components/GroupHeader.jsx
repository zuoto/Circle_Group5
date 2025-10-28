import React from "react";

function GroupHeader({ name }) {
    return(
       <div className="group-header">
        <h1>{name}</h1>
        <div className="group-actions">
            <button className="secondary-button share-button">Share</button>
            <button className="primary-button">Join</button>
        </div>
       </div>
    );
}
export default GroupHeader;