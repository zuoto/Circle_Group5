// Helper function to map a Parse event to a UI object
function mapParseEventToUi(e) {
    const date = e.get("event_date");
    if (!date) {
        return null;
    }

    return {
        id: e.id,
        title: e.get("event_name"),
        date: date.toISOString(),
        // format to group detail sidebar
        timeDisplay: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        dateDisplay: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
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
    const GroupClass = Parse.Object.extend("Group");
    const query = new Parse.Query(GroupClass);
    const currentUser = Parse.User.current() || null;

    try {
        const group = await query.get(groupId);

        if (!group) {
            console.warn(`Group not found for ID: ${groupId}`);
            return null;
        }

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
                const userCheckQuery = relation.query();
                userCheckQuery.equalTo("objectId", currentUser.id);
                isUserJoined = (await userCheckQuery.count()) > 0; 
            }
        }

        const PostClass = Parse.Object.extend("Post");
        const postQuery = new Parse.Query(PostClass);
        postQuery.equalTo("group", group);  // only posts for this group
        postQuery.include("author");
        postQuery.descending("createdAt");

        const parsePosts = await postQuery.find();

        // map the posts to simple objects
        const mappedPosts = await Promise.all(parsePosts.map(async (post) => {
            // fetch comments for posts
            const Comment = Parse.Object.extend("Comments");
            const commentQuery = new Parse.Query(Comment);
            commentQuery.equalTo("post", post);
            commentQuery.include("comment_author");
            commentQuery.ascending("createdAt");
            const comments = await commentQuery.find();

            const author = post.get("author");

            if (!author) {
                console.error(`Post ${post.id} found without an author. Skipping or using placeholder.`);
                return {
                    id: post.id,
                    content: post.get("post_content") || "Post content unavailable.",
                    author: { id: 'deleted', name: 'Deleted User'},
                    comments: [],
                };
            }

            return {
                id: post.id,
                content: post.get("post_content"),
                hangoutTime: post.get("hangoutTime"),
                authorId: author.id,
                author: {
                    id: author.id,
                    name: author.get("username"),
                    user_firstname: author.get("user_firstname"),
                    user_surname: author.get("user_surname"),
                    profile_picture: author.get("profile_picture") ? author.get("profile_picture").url() : null
                },

                createdAt: post.get("createdAt"),
                participants: post.get("participants") || [],
                comments: comments.map(c => {
                    const commentAuthor = c.get("comment_author");
                    return{
                        id: c.id,
                        content: c.get("text"),
                        author: commentAuthor ? {
                        id: commentAuthor.id,
                        name: commentAuthor.get("username")
                    } : {
                        id: 'unknown',
                        name: 'Unknown User'
                    },
                    createdAt: c.get("createdAt")
                }
            })
        };
    }));

    // fetch upcoming event
    let nextEvent = null;
    try {
        const EventClass = Parse.Object.extend("Event");
        const eventQuery = new Parse.Query(EventClass);

        // point to current group
        eventQuery.equalTo("parent_group", group);
        eventQuery.greaterThanOrEqualTo("event_date", new Date());  // get only future events
        eventQuery.ascending("event_date");
        eventQuery.limit(1);    // show only first result

        const nextEventResult = await eventQuery.first();
        if (nextEventResult) {
            nextEvent = mapParseEventToUi(nextEventResult);
        }
    } catch (eventError) {
        console.warn("Could not fetch next upcoming event: ", eventError);
    }

        return {
            id: group.id,
            name: group.get('group_name'),
            description: group.get('group_description'),
            coverPhotoUrl: picUrl,
            isUserJoined: isUserJoined,
            memberCount: memberCount,
            posts: mappedPosts,
            nextEvent: nextEvent,
        };
    } catch (error) {
        console.error("Error fetching group by ID: ", error);
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

export async function fetchGroupMembers(groupId) {
    const Parse = window.Parse;
    const GroupClass = Parse.Object.extend("Group");
    const query = new Parse.Query(GroupClass);

    try {
        const group = await query.get(groupId);
        const membersRelation = group.relation('group_members');    // get the members relation
        const memberQuery = membersRelation.query();
        const parseUsers = await memberQuery.find();

        // map the parse user object to javascript objects
        const mappedMembers = parseUsers.map(user => ({
            id: user.id,
            username: user.get('username'),
            user_firstname: user.get('user_firstname'),
            user_surname: user.get('user_surname'),
        }));
        return mappedMembers;
    } catch (error) {
        console.error("Error fetching group members: ", error);
        return [];
    }
}
