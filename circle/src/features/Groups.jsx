import React from "react";
import GroupCard from "../components/GroupCard";

export default function Groups() {

  const allGroups = [
    {
      id: "1",
      name: "D&D Group",
      description: "The Fellowship of the Chaotic Dice",
      memberCount: 12,
    },
    {
      id: "2",
      name: "DIY Group",
      description: "Let's do some arts & crafts together!",
      memberCount: 9,
    },
    {
      id: "3",
      name: "Run&Bun Club",
      description: "Join for a run every Sunday, the destination is a new cafe every week",
      memberCount: 18,
    },
    {
      id: "4",
      name: "Badminton Group",
      description: "Badminton every Wednesday at 18",
      memberCount: 15,
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="feature-names">Groups</div>
      <div className="main-content">
      {allGroups.map((group) => (
       <GroupCard
          key={group.id}
          id={group.id}
          name={group.name}
          description={group.description}
          memberCount={group.memberCount}
       />
       ))}
      </div>
    </div>
  );
}
