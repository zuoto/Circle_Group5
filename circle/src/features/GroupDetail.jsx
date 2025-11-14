import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GroupHeader from "../components/GroupHeader";
import GroupInfoSidebar from "../components/GroupInfoSidebar"; 
import Post from "../reusable-components/Post";
import { getGroupById } from "../services/ParseGroupService";

export default function GroupDetail() {

    // State: starts as null for the single group object
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    // Hooks
    const { groupId } = useParams();    // get group id from URL
    const navigate = useNavigate();

    // fetch data for specific group with useEffect hook
    useEffect(() => {
        async function loadGroupDetails() {
            setLoading(true);
            const fetchedGroup = await getGroupById(groupId);
            setGroup(fetchedGroup);
            setLoading(false);
        }

        loadGroupDetails();
    }, [groupId]);  // hook re-runs if groupId changes

    // Handlers
    const handleBackClick = () => {
        navigate(-1);   // goes one step back on history stack
    };

    // Render
    if (loading) {
        return <div className="page-wrapper">Loading groups...</div>;
    }

    if (!group) {
        return (
            <div className="page-wrapper">
                <h1>Group Not Found</h1>
                <p>Could not find any group with this ID.</p>
                <button onClick={handleBackClick} className="back-button">← Back</button>
            </div>
        );
    }

  return (
    <div className="page-wrapper group-detail-page-wrapper">
        <div className="group-detail-layout">
            <div className="group-main-content">
                <button 
                onClick={handleBackClick}
                className="back-button">← Back</button>
                {group.coverPhotoUrl && (
                    <div className="group-detail-cover-photo"
                    style={{ backgroundImage: `url(${group.coverPhotoUrl})`}}></div>
                )}
                <GroupHeader name={group.name}
                isUserJoined={group.isUserJoined}
                />

                <div className="group-description-box">
                    <h3>Group Description</h3>
                    <p>{group.description}{" "}</p>
                </div>
                    {group.posts.map((groupPost, index) => (
                        <Post
                        key={index}
                        post={groupPost}
                        isGroupPost={true}
                        />
                    ))}
            </div>
            <div className="group-sidebar">
                <h3 className="sidebar-header">Upcoming group meetings:</h3>
                <GroupInfoSidebar meetup={group.nextMeetup} />
            </div>
        </div>
    </div>
  );
}
