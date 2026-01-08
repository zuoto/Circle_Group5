import React from "react";
import { Link } from "react-router-dom";

function GroupInfoSidebar({ event }) {

    if (!event) {
    return(
        <div className="sidebar-box meetup-box">
            <strong>N/A</strong>
            <span>No upcoming meetings planned</span>
        </div>
        );
    }

    // if event exists
    return (
        <Link to={`/events/${event.id}`} className="meetup-box-link">
            <div className="sidebar-box meetup-box">
                <strong>{event.title}</strong>
                <span>
                    {event.dateDisplay} at {event.timeDisplay}
                </span>
            </div>
        </Link>
    );
}
export default GroupInfoSidebar;