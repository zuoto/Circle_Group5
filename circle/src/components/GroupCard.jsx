import React from "react";
import { Link } from "react-router-dom";

function GroupCard({ id, name, description, memberCount }) {
    return(
        <Link to={`/features/groups/${id}`} className="group-card-link">
            <div className="group-card">
                <div className="group-card-content">
                    <h3>{name}</h3>
                    <p>{description}</p>
                    <span>{memberCount}</span>
                </div>
            </div>
        </Link>
    );
    
}
export default GroupCard;