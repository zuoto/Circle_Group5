import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import JoinButton from "../reusable-components/JoinButton";
import { toggleGroupMembership } from "../services/ParseGroupService";

function GroupCard({ id, name, description, initialMemberCount, initialIsUserJoined, coverPhotoUrl }) {

    const [members, setMembers] = useState(initialMemberCount || 0);
    const [isJoined, setIsJoined] = useState(initialIsUserJoined === true);

    const handleGroupCardJoin = async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();   
        }
        
        const isJoining = !isJoined;
        try {
            const memberChange = await toggleGroupMembership(id, isJoining);
            setIsJoined(isJoining);
            setMembers(prevMembers => prevMembers + memberChange);

            console.log(`Membership toggled for group ID: ${id}`);
        } catch (error) {
            console.error("Failed to update membership: ", error);
        }
    };

    return(
        <Link to={`/groups/${id}`} className="group-card-link">
            <div className="group-card">
                {coverPhotoUrl && (
                    <div className="group-card-cover-photo"
                    style={{ backgroundImage: `url(${coverPhotoUrl})`}} ></div>
                )}
                <div className="group-card-content">
                    <h3>{name}</h3>
                    <p>{description}</p>
                </div>
                <div className="card-footer-row">
                <span>Members: {members}</span>
                <div className="group-card-actions">
                    <button className="secondary-button" onClick={(e) => { e.preventDefault(); e.stopPropagation();}}>Share</button>
                    <JoinButton
                        isUserJoined={isJoined}
                        onClick={handleGroupCardJoin}
                    />
                </div>
                </div>
            </div>
        </Link>
    );
    
}
export default GroupCard;