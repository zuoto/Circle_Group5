export default function MembersTooltip({ members, show }) {
    if (!show || members.length === 0) {
        return null;
    }

    return (
        <div className="members-tooltip">
            <div className="members-header">
            {members.length} {members.length === 1 ? 'member' : 'members'}:
            </div>
            <div className="member-list">
                {members.map(member => (
                    <div key={member.id} className="member-name">
                        {member.user_firstname} {member.user_surname}
                        </div>
                ))}
            </div>
        </div>
    );
}