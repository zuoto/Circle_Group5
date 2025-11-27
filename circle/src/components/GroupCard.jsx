import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import JoinButton from "../reusable-components/JoinButton";
import { toggleGroupMembership, fetchGroupMembers } from "../services/ParseGroupService";
import MembersTooltip from "./MembersTooltip";

function GroupCard({ id, name, description, initialMemberCount, initialIsUserJoined, coverPhotoUrl }) {

    const [members, setMembers] = useState(initialMemberCount || 0);
    const [isJoined, setIsJoined] = useState(initialIsUserJoined === true);
    const [groupMembers, setGroupMembers] = useState([]);
    const [showMembersTooltip, setShowMembersTooltip] = useState(false);

    // Handler to fetch members when hovering
    const handleMouseEnter = async () => {
        setShowMembersTooltip(true);
        if (groupMembers.length === 0) {
            try {
                const membersList = await fetchGroupMembers(id);
                setGroupMembers(membersList);
            } catch (error) {
                console.error("Failed to fetch group members: ", error);
            }
        }
    };

    // Handler to hide tooltip
    const handleMouseLeave = () => {
        setShowMembersTooltip(false);
    };
    

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
        <Link to={`/groups/${id}`} 
        className={`group-card-link ${showMembersTooltip ? 'is-tooltip-active' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        >
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
                    <div className="members-info-wrapper">
                        <span>Members: {members}</span>
                        <MembersTooltip members={groupMembers}
                            show={showMembersTooltip} />
                        </div>
                
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