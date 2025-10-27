import React from "react";

function GroupInfoSidebar() {
    return(
        <>
       <div className="sidebar-box photos-box">
        <span role="img" aria-label="camera-icon">📸</span>
        <span>Photos from Meetups</span>
        </div>
        <div className="sidebar-box meetup-box">
            <span>Monday 20:00-22:00</span>
            <strong>Meet Up @ David's</strong>
        </div>
        </>
    );
}
export default GroupInfoSidebar;