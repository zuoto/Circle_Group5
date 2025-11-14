const GroupClass = Parse.Object.extend("Group");

// Fetch all groups for list page
export async function getAllGroups() {
    const query = new Parse.Query(GroupClass);
    query.descending("createdAt");  // sort by creation date

    try {
        const parseGroups = await query.find();
        // map schema names to component prop names
        return parseGroups.map(group => {

            // get file object from the group
            const picFile = group.get('group_default_pic');
            const picUrl = picFile ? picFile.url() : '/covers/default-cover.jpg';   // if no pic, use placeholder
            
            return {
            id: group.id,
            name: group.get('group_name'),
            description: group.get('group_description'),
            coverPhotoUrl: picUrl,
            memberCount: 0,
            isUserJoined: false
            }; 
        });
    } catch (error) {
        console.error("Error fetching groups: ", error);
        return[];
    }
}

// Fetch single group by id
export async function getGroupById(groupId) {
    const query = new Parse.Query(GroupClass);

    try {
        const group = await query.get(groupId);

        // get file object from the group
        const picFile = group.get('group_default_pic');
        const picUrl = picFile ? picFile.url() : '/covers/default-cover.jpg';   // if no pic, use placeholder
        
        return {
            id: group.id,
            name: group.get('group_name'),
            description: group.get('group_description'),
            coverPhotoUrl: picUrl,
            isUserJoined: false,
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
