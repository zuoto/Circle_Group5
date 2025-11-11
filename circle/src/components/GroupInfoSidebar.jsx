import React from "react";

function GroupInfoSidebar({ meetup }) {

    if (!meetup || !meetup.time || !meetup.location) {
        return <p>No upcoming meetings planned</p>
    }

    return(
        <>
        <div className="sidebar-box meetup-box">
            <span>{meetup.time}</span>
            <strong>{meetup.location}</strong>
        </div>
        </>
    );
}
export default GroupInfoSidebar;