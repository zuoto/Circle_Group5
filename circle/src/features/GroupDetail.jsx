import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import GroupHeader from "../components/GroupHeader";
import GroupInfoSidebar from "../components/GroupInfoSidebar"; 
import Post from "../reusable-components/Post";
import { mockGroups } from "../mock-data/mock-data-groups/MockGroupsData";

export default function GroupDetail() {

    const { groupId } = useParams();
    console.log("Loading details for: ", groupId);

    // Back button:
    const navigate = useNavigate();
    const handleBackClick = () => {
        navigate(-1);   // goes one step back on history stack
    };

    const group = mockGroups.find(g => g.id == groupId);

    if (!group) {
        return (
            <div className="page-wrapper">
                <h1>Group Not Found</h1>
                <p>Could not find any groups with the search word</p>
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
                <GroupHeader name={group.name} />

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
                <GroupInfoSidebar />
            </div>
        </div>
    </div>
  );
}
