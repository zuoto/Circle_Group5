// Helper functions

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

Parse.Cloud.define("optimizeGetAllEvents", async (request) => {
  const currentUser = request.user;

  const EventClass = Parse.Object.extend("Event");
  const query = new Parse.Query(EventClass);

  query.include("event_host");
  query.include("parent_group");
  query.ascending("event_date");

  try {
    const events = await query.find({ useMasterKey: true });

    const result = await Promise.all(
      events.map(async (e) => {
        const date = e.get("event_date");
        const host = e.get("event_host");
        const group = e.get("parent_group");
        const coverFile = e.get("event_cover");

        // attendee relation
        const relation = e.relation("event_attendees");
        const attendeeQuery = relation.query();
        const attendeeCount = await attendeeQuery.count({ useMasterKey: true });

        // is current user attending?
        let isUserAttending = false;
        if (currentUser) {
          const userCheckQuery = relation.query();
          userCheckQuery.equalTo("objectId", currentUser.id);
          isUserAttending =
            (await userCheckQuery.count({ useMasterKey: true })) > 0;
        }

        return {
          id: e.id,
          title: e.get("event_name"),
          description: e.get("event_info"),
          date: date ? date.toISOString() : null,
          location: e.get("event_location_text") || "",

          // host info (simple but good enough)
          hostId: host ? host.id : null,
          hostName:
            (host &&
              (host.get("user_firstname") || host.get("username"))) ||
            "Unknown",

          // group info
          groupId: group ? group.id : null,
          groupName: group ? group.get("group_name") : null,

          cover: coverFile ? coverFile.url() : null,

          attendeeCount,
          isUserAttending,
        };
      })
    );

    return result;
  } catch (error) {
    console.error("Cloud Function Error (optimizeGetAllEvents): ", error);
    throw new Parse.Error(500, "Error fetching events.");
  }
});


async function fetchPostComments(post) {
    // fetch comments for posts
    const Comment = Parse.Object.extend("Comments");
    const commentQuery = new Parse.Query(Comment);
    commentQuery.equalTo("post", post);
    commentQuery.include("comment_author");
    commentQuery.ascending("createdAt");
    const comments = await commentQuery.find({ useMasterKey: true});

    return comments.map(c => {
        const commentAuthor = c.get("comment_author");
        return {
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
        };
    });
}

async function mapPostToUi(post) {
    const author = post.get("author");
    const comments = await fetchPostComments(post);

    const authorData = author ? {
        id: author.id,
            name: author.get("username"),
            user_firstname: author.get("user_firstname"),
            user_surname: author.get("user_surname"),
            profile_picture: author.get("profile_picture") ? author.get("profile_picture").url() : null 
        } : { id: 'deleted', name: 'Deleted User', profile_picture: null };

    return {
        id: post.id,
        content: post.get("post_content"),
        hangoutTime: post.get("hangoutTime"),
        authorId: authorData.id,
        author: authorData,
        createdAt: post.get("createdAt"),
        participants: post.get("participants") || [],
        comments: comments
    };
}


Parse.Cloud.define("optimizeGetAllGroups", async (request) => {
    const query = new Parse.Query("Group");
    query.descending("createdAt");  // sort by creation date

    // get user who's making the request
    const currentUser = request.user;

    try {
        // fetch groups from database
        const groupObjects = await query.find({ useMasterKey: true });

        // process all groups at once on the server
        const groupsData = await Promise.all(groupObjects.map(async group => {
            const relation = group.relation('group_members');
            const memberQuery = relation.query();

            // get member count
            const memberCount = await memberQuery.count({ useMasterKey: true });
            let isUserJoined = false;

            // check if current user is member
            if (currentUser) {
                const userCheck = relation.query();
                userCheck.equalTo("objectId", currentUser.id);
                const count = await userCheck.count({ useMasterKey: true });
                isUserJoined = count > 0;
            }

            // get file object from the group
            const picFile = group.get('group_default_pic');
            const picUrl = picFile ? picFile.url() : '/covers/default-cover.jpg';   // if no pic, use placeholder
           
            return {
                id: group.id,
                name: group.get('group_name'),
                description: group.get('group_description'),
                coverPhotoUrl: picUrl,
                memberCount: memberCount,
                isUserJoined: isUserJoined
                }; 
        }));

       return groupsData;
    } catch (error) {
        console.error("Cloud Function Error: ", error);
        throw new Parse.Error(500, "Error fetching groups.");
    }
});

Parse.Cloud.define("getGroupDetailData", async (request) => {
    const { groupId } = request.params;
    const currentUser = request.user;

    const GroupClass = Parse.Object.extend("Group");
    const query = new Parse.Query(GroupClass);
    let group;

    try {
        group = await query.get(groupId, { useMasterKey: true });
    } catch (error) {
        console.error(`Group Not Found for ID: ${groupId}`, error);
        throw new Parse.Error(404, "Group Not Found");
    }

    // get file object from the group
    const picFile = group.get('group_default_pic');
    const picUrl = picFile ? picFile.url() : '/covers/default-cover.jpg';   // if no pic, use placeholder
    
    // membership count and check
    let memberCount = 0;
    let isUserJoined = false;

    if (group.has('group_members')) {
        const relation = group.relation('group_members');
        const memberQuery = relation.query();
        memberCount = await memberQuery.count({ useMasterKey: true });

        if (currentUser) { 
            const userCheckQuery = relation.query();
            userCheckQuery.equalTo("objectId", currentUser.id);
            isUserJoined = (await userCheckQuery.count({ useMasterKey: true })) > 0; 
        }
    }

        const PostClass = Parse.Object.extend("Post");
        const postQuery = new Parse.Query(PostClass);
        postQuery.equalTo("group", group);  // only posts for this group
        postQuery.include("author");
        postQuery.descending("createdAt");

        const parsePosts = await postQuery.find({ useMasterKey: true });
        // map the posts to simple objects
        const mappedPosts = await Promise.all(parsePosts.map(mapPostToUi));

    // fetch upcoming event
    let nextEvent = null;
        const EventClass = Parse.Object.extend("Event");
        const eventQuery = new Parse.Query(EventClass);

        // point to current group
        eventQuery.equalTo("parent_group", group);
        eventQuery.greaterThanOrEqualTo("event_date", new Date());  // get only future events
        eventQuery.ascending("event_date");
        eventQuery.limit(1);    // show only first result

        const nextEventResult = await eventQuery.first({ useMasterKey: true });
        if (nextEventResult) {
            nextEvent = mapParseEventToUi(nextEventResult);
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
    }, {
        requireUser: false
});

Parse.Cloud.define("searchUsers", async (request) => {
  const query = request.params.query;

  const regex = new RegExp(query, "i");

  // Use the Master Key to ensure we can search all users
  Parse.Cloud.useMasterKey();

  const UserQuery = new Parse.Query(Parse.User);
  UserQuery.matches("user_firstname", regex);

  const UserQuery2 = new Parse.Query(Parse.User);
  UserQuery2.matches("user_surname", regex);

  const UserQuery3 = new Parse.Query(Parse.User);
  UserQuery3.matches("username", regex);

  const userCompoundQuery = Parse.Query.or(UserQuery, UserQuery2, UserQuery3);
  userCompoundQuery.limit(10);

  try {
    const users = await userCompoundQuery.find();

    return users.map((user) => ({
      id: user.id,
      user_firstname: user.get("user_firstname"),
      user_surname: user.get("user_surname"),
      username: user.get("username"),
      profile_picture: user.get("profile_picture")?.url() || null, 
    }));
  } catch (error) {
    console.error("Cloud Search Error:", error);
    throw new Parse.Error(
      Parse.Error.INTERNAL_SERVER_ERROR,
      "User search failed on server."
    );
  }
});


Parse.Cloud.define("cleanupMissingAuthors", async (request) => {
    const Post = Parse.Object.extend("Post");
    const query = new Parse.Query(Post);
    
    // 1. Find posts where the 'author' pointer is not set (i.e., undefined/null)
    query.doesNotExist("author"); 
    query.limit(1000); 

    let postsToDelete;
    try {
        postsToDelete = await query.find({ useMasterKey: true });
    } catch (error) {
        console.error("Error querying posts with missing authors: ", error);
        throw new Error("Query failed.");
    }
    
    const count = postsToDelete.length;
    const deletedIds = postsToDelete.map(post => post.id);

    if (count > 0) {
        console.log(`Found ${count} post(s) with missing authors: ${deletedIds.join(', ')}`);
        
        try {
            // 2. Delete the found posts
            await Parse.Object.destroyAll(postsToDelete, { useMasterKey: true });
            console.log(`Successfully deleted ${count} posts.`);
            
            return {
                status: "success",
                count: count,
                deletedIds: deletedIds,
                message: `Cleaned up ${count} posts missing an author.`
            };

        } catch (error) {
            console.error("Error destroying posts: ", error);
            return {
                status: "error",
                count: count,
                deletedIds: deletedIds,
                message: `Failed to delete posts. Found ${count} posts, but deletion failed.`
            };
        }
    } else {
        return {
            status: "success",
            count: 0,
            message: "No posts found missing an author. Data is clean."
        };
    }
});
