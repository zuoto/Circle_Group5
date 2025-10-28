import React from "react";
import { useParams } from "react-router-dom";
import GroupHeader from "../components/GroupHeader";
import GroupComment from "../components/GroupComment";
import GroupInfoSidebar from "../components/GroupInfoSidebar"; 

export default function GroupDetail() {

    const { groupId } = useParams();
    console.log("Loading details for: ", groupId);

    const groupData = {
        name: "D&D Group",
        description: "The Fellowship of the Chaotic Dice",
    };

    const comments = [
        {
            author: "Jane Doe",
            text: "Lots of people mentioned changing the hour of meetup! Should we?",
        },
    ];

  return (
    <div className="page-wrapper">
        <div className="group-detail-layout">
            <div className="group-main-content">
                <GroupHeader name={groupData.name} />
                <div className="group-description.box">
                    <h3>Group Description</h3>
                    <p>
                        {groupData.description}{" "}
                        <span className="read-more">+ Read more</span>
                    </p>
                </div>
                <div className="group-feed">
                    {comments.map((comment, index) => (
                        <GroupComment
                        key={index}
                        author={comment.author}
                        text={comment.text}
                        />
                    ))}
                </div>
            </div>
            <div className="group-sidebar">
                <GroupInfoSidebar />
            </div>
        </div>
    </div>
  );
}
