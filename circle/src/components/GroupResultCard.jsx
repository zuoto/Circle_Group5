import { useNavigate } from "react-router-dom";

function GroupResultCard({ group }) {
  const navigate = useNavigate();
  const currentUser = window.Parse.User.current();

  const memberCount = group.get("members")?.length || 0;
  const members = group.get("members") || [];
  const isUserJoined = members.some((member) => member.id === currentUser?.id);

  const coverPhotoFile = group.get("group_default_pic");

  let coverPhotoUrl = "/covers/default-cover.jpg";

  if (coverPhotoFile) {
    if (typeof coverPhotoFile.url === "function") {
      coverPhotoUrl = coverPhotoFile.url();
    } else if (typeof coverPhotoFile === "string") {
      coverPhotoUrl = coverPhotoFile;
    }
  }

  const description = group.get("group_description");

  return (
    <div
      className="group-card clickable"
      onClick={() => navigate(`/groups/${group.id}`)}
    >
      <div
        className="group-card-cover-photo"
        style={{ backgroundImage: `url(${coverPhotoUrl})` }}
      />
      <div className="group-card-content">
        <h3>{group.get("group_name")}</h3>
        <p>{description?.substring(0, 100)}...</p>
        <div className="card-footer-row">
          <span>{memberCount} members</span>
          {isUserJoined && (
            <div className="joined-button joined-button-small">Joined</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupResultCard;
