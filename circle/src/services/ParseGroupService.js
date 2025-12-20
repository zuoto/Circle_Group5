// Helper function to handle event date formatting
function formatNextEvent(groupData) {
    if (groupData.nextEvent && groupData.nextEvent.date) {
        const dateObj = new Date(groupData.nextEvent.date);

        // date/time formatting
        groupData.nextEvent.timeDisplay = dateObj.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'});
        groupData.nextEvent.dateDisplay = dateObj.toLocaleDateString('en-US', {hour: '2-digit', minute: '2-digit'});
    }
    return groupData;
}

// Fetch all groups for list page using cloud function
export async function getAllGroups() {
    const Parse = window.Parse;
    try {
        const groups = await Parse.Cloud.run("optimizeGetAllGroups");
        return groups;
    } catch (error) {
        console.error("Error fetching groups from Cloud Function: ", error);
        throw error;
    }
}

// Fetch single group by id
export async function getGroupById(groupId) {
    const Parse = window.Parse;

    try {
        // API call to the server
        const groupData = await Parse.Cloud.run("getGroupDetailData", { groupId });
        // remap and format to client-side
        return formatNextEvent(groupData);
    } catch (error) {
        console.error("Error fetching group detail: ", error);
        return null;
    }
}     

// Create new group in database
export async function createNewGroup(newGroupData) {
    const Parse = window.Parse;
    const { groupName, description, coverPhotoFile } = newGroupData;
    const currentUser = Parse.User.current();   // gets the logged-in user

    if (!currentUser) {
        throw new Error("You must be logged in to create a group.");
    }

    const GroupClass = Parse.Object.extend("Group");
    const newGroup = new GroupClass();
    newGroup.set('group_name', groupName);
    newGroup.set('group_description', description);
    newGroup.set('group_admin', currentUser);

    if (coverPhotoFile) {
        // convert the file object to a parse file object
        const file = new Parse.File(coverPhotoFile.name, coverPhotoFile);

        try {
            const uploadedFile = await file.save();
            // link uploaded file to group object
            newGroup.set('group_default_pic', file);
        } catch (fileError) {
            console.error("Error uploading group header file: ", fileError);
        }
    }

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
    const Parse = window.Parse;
    const currentUser = Parse.User.current();
    if (!currentUser) {
        throw new Error("You must be logged in to change group membership.");
    }

    try {
        const Group = Parse.Object.extend("Group");
        const query = new Parse.Query(Group);
        const group = await query.get(groupId);

        const membersRelation = group.relation('group_members');
        const userGroupsRelation = currentUser.relation('groups_joined');

        if (isJoining) {
            membersRelation.add(currentUser);
            userGroupsRelation.add(group);
        } else {
            membersRelation.remove(currentUser);
            userGroupsRelation.remove(group);
        }
        await group.save();
        await currentUser.save();
        return isJoining ? 1 : -1;
    } catch (error) {
        console.error("Error toggling group membership: ", error);
        throw error;
    }
}

export async function fetchGroupMembers(groupId) {
    const Parse = window.Parse;

    try {
        // query group members with cloud function
        const members = await Parse.Cloud.run("getGroupMemberNames", { groupId });
        return members;
    } catch (error) {
        console.error("Error fetching group members: ", error);
        return [];
    }
}
