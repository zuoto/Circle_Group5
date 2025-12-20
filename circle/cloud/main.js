// Helper functions

function mapParseEventToUi(e) {
    const date = e.get("event_date");
    if (!date) {
        return null;
    }

    const host = e.get("event_host");

    let hostData = { id: 'unknown', name: 'Unknown User' };

    if (host) {
        // Assume host has user_firstname and user_surname fields
        hostData = {
            id: host.id,
            name: `${host.get("user_firstname")} ${host.get("user_surname")}`,
            username: host.get("username")
            // Include other fields needed by the client
        };
    }
  
    return {
        id: e.id,
        title: e.get("event_name"),
        date: date.toISOString(),
        // format to group detail sidebar
        timeDisplay: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        dateDisplay: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        host: hostData
    };
}


function mapPostToUi(post, commentsForPost) {
    const author = post.get("author");

  // format mapped comments
    const formattedComments = commentsForPost.map(c => {
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
        comments: formattedComments
    };
}


Parse.Cloud.define("optimizeGetAllGroups", async (request) => {
  const currentUser = request.user;
  const Group = Parse.Object.extend("Group");
    const query = new Parse.Query(Group);
    query.descending("createdAt");  // sort by creation date

    try {
        // fetch all groups from database
        const groupObjects = await query.find({ useMasterKey: true });

        // fetch all groups current user has joined in 1 query
        const joinedGroupsIds = new Set();
        if (currentUser) {
          try {
            const membershipQuery = new Parse.Query(Group);
            membershipQuery.equalTo("group_members", currentUser);
            membershipQuery.select('objectId');

          const joinedGroups = await membershipQuery.find({ useMasterKey: true });
          // store IDs in a set for quick lookup
          joinedGroups.forEach(g => joinedGroupsIds.add(g.id));
        } catch (memError) {
            console.error("Membership check failed:", memError);
        }
      }

        // process all groups at once on the server
        const groupsData = await Promise.all(groupObjects.map(async group => { 
          let memberCount = 0;
          try {
            const relation = group.relation('group_members');
        
            // get member count
            memberCount = await relation.query().count({ useMasterKey: true });
          } catch (countErr) {
            console.error("Count failed for group " + group.id, countErr);
          }
          
            // get file object from the group
            const picFile = group.get('group_default_pic');
            const picUrl = picFile ? picFile.url() : '/covers/default-cover.jpg';   // if no pic, use placeholder

            // define if user is joined by checking the Set
            const isUserJoined = joinedGroupsIds.has(group.id);
           
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

        // fetch posts
        const PostClass = Parse.Object.extend("Post");
        const postQuery = new Parse.Query(PostClass);
        postQuery.equalTo("group", group);  // only posts for this group
        postQuery.include("author");
        postQuery.descending("createdAt");

        const parsePosts = await postQuery.find({ useMasterKey: true });

        // fetch all comments for these posts with 1 query
        // query for comments
        const CommentClass = Parse.Object.extend("Comments");
        const commentQuery = new Parse.Query(CommentClass);

        // get comments where the post pointer is in the list of fetched posts
        commentQuery.containedIn("post", parsePosts);
        commentQuery.include("comment_author");
        commentQuery.ascending("createdAt");

        const allComments = await commentQuery.find({ useMasterKey: true });

        // map posts and comments
        const mappedPosts = parsePosts.map(post => {
          // filter list of comments for only the ones for this specific post
          const commentsForPost = allComments.filter(c => c.get("post").id === post.id);
          return mapPostToUi(post, commentsForPost);
        });

    // fetch upcoming event
    let nextEvent = null;
        const EventClass = Parse.Object.extend("Event");
        const eventQuery = new Parse.Query(EventClass);
        eventQuery.include("event_host");

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

  const UserQuery4 = new Parse.Query(Parse.User);
  UserQuery4.matches("user_firstname" + "user_surname", regex);

  const userCompoundQuery = Parse.Query.or(UserQuery, UserQuery2, UserQuery3, UserQuery4);
  userCompoundQuery.limit(20);

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

Parse.Cloud.define("handleFriendRequest", async (request) => {
  // Use the Master Key to allow changes to user relations
  Parse.Cloud.useMasterKey();
  
  const { requestId, action } = request.params; 
  
  try {
    const FriendRequest = Parse.Object.extend("FriendRequest");
    // Fetch the request and include the users it points to
    const req = await new Parse.Query(FriendRequest)
      .include("requester")
      .include("recipient")
      .get(requestId);
      
    if (req.get("status") !== "pending") {
      throw new Error("Request already handled.");
    }
    
    // Set status to accepted/rejected and save the request object
    req.set("status", action === "accept" ? "accepted" : "rejected");

    if (action === "accept") {
      const requester = req.get("requester");
      const recipient = req.get("recipient");
    
      // 1. Add recipient to requester's friends
      requester.relation("user_friends").add(recipient);
      
      // 2. Add requester to recipient's friends (makes it mutual)
      recipient.relation("user_friends").add(requester);
      
      // Save all three objects at once to ensure consistency
      await Parse.Object.saveAll([requester, recipient, req]);
    } else { 
      // If rejected, just save the status update on the request object
      await req.save();
    }
    
    return { success: true, message: `Request ${action}ed.` };
  } catch (error) {
    console.error(`Error handling friend request (${action}):`, error);
    throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, `Failed to handle request: ${error.message}`);
  }
});

Parse.Cloud.define("optimizeGetAllEvents", async (request) => {
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

        // Load attendees as IDs (array), so EventCard can use it
        let attendeeIds = [];
        try {
          const relation = e.relation("event_attendees");
          const users = await relation.query().find({ useMasterKey: true });
          attendeeIds = users.map((u) => u.id);
        } catch (err) {
          console.error("Error loading attendees for event", e.id, err);
        }

        // Host name
        let hostName = "Unknown";
        let hostAvatar = "/avatars/default.png";

        if (host) {
          const first = host.get("user_firstname");
          const last = host.get("user_surname");
          const username = host.get("username");

          if (first || last) {
            hostName = `${first || ""} ${last || ""}`.trim();
          } else if (username) {
            hostName = username;
          }

          const avatarFile = host.get("profile_picture");
          if (avatarFile && typeof avatarFile.url === "function") {
            hostAvatar = avatarFile.url();
          }
        }

        return {
          id: e.id,
          title: e.get("event_name"),
          description: e.get("event_info"),
          date: date ? date.toISOString() : null,
          location: e.get("event_location_text") || "",

          hostId: host ? host.id : null,
          hostName,
          hostAvatar,

          groupId: group ? group.id : null,
          groupName: group ? group.get("group_name") : null,

          cover: coverFile ? coverFile.url() : null,

          attendees: attendeeIds,
          tags: [],          // keep this to mirror mapParseEvent
        };
      })
    );

    return result;
  } catch (error) {
    console.error("Cloud Function Error (optimizeGetAllEvents): ", error);
    throw new Parse.Error(500, "Error fetching events.");
  }
});