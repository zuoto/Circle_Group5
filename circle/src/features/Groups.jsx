import React from "react";
import GroupCard from "../components/GroupCard";
import { mockGroups } from "../mock-data/mock-data-groups/MockGroupsData";

export default function Groups() {

  return (
    <div className="page-wrapper">
      <div className="groups-content-wrapper">
      <div className="feature-names">Groups</div>
      <div className="main-content">
      {mockGroups.map(group => (
       <GroupCard
          key={group.id}
          id={group.id}
          name={group.name}
          description={group.description}
          memberCount={"Members: " + group.memberCount}
          isUserJoined={group.isUserJoined}
          coverPhotoUrl={group.coverPhotoUrl}
       />

       ))}
      </div>
      </div>
    </div>
  );
}
