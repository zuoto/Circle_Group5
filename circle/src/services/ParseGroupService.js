const GroupClass = Parse.Object.extend("Group");

// Fetch all groups for list page
export async function getAllGroups() {
    const query = new Parse.Query(GroupClass);
    query.descending("createdAt");  // sort by creation date

    try {
        const groupObjects = await query.find();

        const currentUser = Parse.User.current();

        return await Promise.all(groupObjects.map(async group => {
             // get file object from the group
             const picFile = group.get('group_default_pic');
             const picUrl = picFile ? picFile.url() : '/covers/default-cover.jpg';   // if no pic, use placeholder
            
             let memberCount = 0;
             let isUserJoined = false;

             if (group.has('group_members')) {
                const relation = group.relation('group_members');
                const memberQuery = relation.query();
                memberCount = await memberQuery.count();

                if (currentUser) {
                    memberQuery.equalTo("objectId", currentUser.id);
                    isUserJoined = (await memberQuery.count()) > 0;
                }
             }
             return {
                id: group.id,
                name: group.get('group_name'),
                description: group.get('group_description'),
                coverPhotoUrl: picUrl,
                memberCount: memberCount,
                isUserJoined: isUserJoined
                }; 
        }));
    } catch (error) {
        console.error("Error fetching groups: ", error);
        return[];
    }
}

// Fetch single group by id
export async function getGroupById(groupId) {
    const query = new Parse.Query(GroupClass);
    const currentUser = Parse.User.current();

    try {
        const group = await query.get(groupId);

        // get file object from the group
        const picFile = group.get('group_default_pic');
        const picUrl = picFile ? picFile.url() : '/covers/default-cover.jpg';   // if no pic, use placeholder
        
        let memberCount = 0;
        let isUserJoined = false;

        if (group.has('group_members')) {
            const relation = group.relation('group_members');
            const memberQuery = relation.query();
            memberCount = await memberQuery.count();

            if (currentUser) {
                memberQuery.equalTo("objectId", currentUser.id);
                isUserJoined = (await memberQuery.count()) > 0;
            }
        }

        return {
            id: group.id,
            name: group.get('group_name'),
            description: group.get('group_description'),
            coverPhotoUrl: picUrl,
            isUserJoined: isUserJoined,
            memberCount: memberCount,
            posts: [],
            nextMeetup: { time: "N/A", location: "N/A"}
        };
    } catch (error) {
        console.error("Error fetching group by ID: ", error);
        return null;
    }
}

// Create new group in database
export async function createNewGroup(newGroupData) {
    const { groupName, description } = newGroupData;
    const currentUser = Parse.User.current();   // gets the logged-in user

    if (!currentUser) {
        throw new Error("You must be logged in to create a group.");
    }

    const newGroup = new GroupClass();
    newGroup.set('group_name', groupName);
    newGroup.set('group_description', description);
    newGroup.set('group_admin', currentUser);

    try {
        const savedGroup = await newGroup.save();
        return savedGroup;
    } catch (error) {
        console.error("Error creating new group: ", error);
        throw error;
    }
}

// Add or remove user from a group's members
export async function toggleGroupMembership(groupId, isJoining) {
    const currentUser = Parse.User.current();
    if (!currentUser) {
        throw new Error("You must be logged in to change group membership.");
    }

    try {
        const group = Parse.Object.createWithoutData("Group", groupId);
        const membersRelation = group.relation('group_members');

        if (isJoining) {
            membersRelation.add(currentUser);
        } else {
            membersRelation.remove(currentUser);
        }
        await group.save();
        return isJoining ? 1 : -1;
    } catch (error) {
        console.error("Error toggling group membership: ", error);
        throw error;
    }
}
