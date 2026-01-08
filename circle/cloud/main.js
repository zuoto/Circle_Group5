
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

    let authorName = 'Unknown User';
    if (commentAuthor) {
      const first = commentAuthor.get("user_firstname");
      const last = commentAuthor.get("user_surname");
      if (first || last) {
        authorName = `${first || ""} ${last || ""}`.trim();
      } else {
        authorName = commentAuthor.get("username");
      }
    }
    
    return {
      id: c.id,
      content: c.get("text"),
      comment_author: commentAuthor ? {
        id: commentAuthor.id,
        name: authorName, // this sends now 'First Last'
        username: commentAuthor.get("username"),
        profile_picture: commentAuthor.get("profile_picture") ? commentAuthor.get("profile_picture").url() : null
    } : {
        id: 'unknown',
        name: 'Unknown User',
        profile_picture: null
    },
      createdAt: c.get("createdAt")
    };
  });

  // Format post author:

  // safe defaults for worst-case scenario when an account has been deleted
  let postAuthorName = 'Deleted User';
  let postAuthorPic = null;
  let postAuthorId = 'deleted';
  let postAuthorData = { id: 'deleted', name: 'Deleted User', profile_picture: null };

  if (author) {
    postAuthorId = author.id;
    postAuthorPic = author.get("profile_picture") ? author.get("profile_picture").url() : null;

    const first = author.get("user_firstname");
    const last = author.get("user_surname");
      if (first || last) {
        postAuthorName = `${first || ""} ${last || ""}`.trim();
      } else {
        postAuthorName = author.get("username");
      }

  postAuthorData = {
      id: author.id,
      name: postAuthorName, // this sends now 'First Last'
      username: author.get("username"),
      user_firstname: author.get("user_firstname"),
      user_surname: author.get("user_surname"),
      profile_picture: postAuthorPic
    };
  }

  return {
      id: post.id,
      content: post.get("post_content"),
      hangoutTime: post.get("hangoutTime"),
      authorId: postAuthorId,
      author: postAuthorData,
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
      const CommentClass = Parse.Object.extend("Comments");
      const commentQuery = new Parse.Query(CommentClass);

      // get comments where the post pointer is in the list of fetched posts
      commentQuery.containedIn("post", parsePosts);
      commentQuery.include("comment_author");
      commentQuery.ascending("createdAt");

      const allComments = await commentQuery.find({ useMasterKey: true });

      // Force-fetch authors with master key, i.e. ensure names/pics are loaded 
      // even if the current user is not friends with the author

      // fetch post authors
      const postAuthors = parsePosts.map(p => p.get("author")).filter(a => !!a);
      if (postAuthors.length > 0) {
        await Parse.Object.fetchAllIfNeeded(postAuthors, { useMasterKey: true });
      }

      // fetch comment authors
      const commentAuthors = allComments.map(c => c.get("comment_author")).filter(a => !!a);
      if (commentAuthors.length > 0) {
        await Parse.Object.fetchAllIfNeeded(commentAuthors, { useMasterKey: true });
      }

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

Parse.Cloud.beforeSave("FriendRequest", async (request) => {
const obj = request.object;
if (!obj.isNew()) return;

const requester = obj.get("requester");
const recipient = obj.get("recipient");

const query = new Parse.Query("FriendRequest");
query.equalTo("requester", requester);
query.equalTo("recipient", recipient);
query.equalTo("status", "pending");

const existing = await query.first({ useMasterKey: true });

if (existing) {
  throw new Parse.Error(400, "NO DUPLICATES: A request is already pending.");
}
});

Parse.Cloud.define("handleFriendRequest", async (request) => {
const { requestId, action } = request.params;

if (!requestId) throw new Parse.Error(400, "Missing requestId parameter.");

try {
  const FriendRequest = Parse.Object.extend("FriendRequest");
  const query = new Parse.Query(FriendRequest);

  const req = await query.get(requestId, { useMasterKey: true });

  if (req.get("status") !== "pending") {
    throw new Error("This request has already been handled.");
  }

  req.set("status", action === "accept" ? "accepted" : "rejected");

  if (action === "accept") {
    const requester = req.get("requester");
    const recipient = req.get("recipient");

    const u1 = await requester.fetch({ useMasterKey: true });
    const u2 = await recipient.fetch({ useMasterKey: true });

    u1.relation("user_friends").add(u2);
    u2.relation("user_friends").add(u1);

    await Parse.Object.saveAll([u1, u2, req], { useMasterKey: true });
  } else {
    await req.save(null, { useMasterKey: true });
  }

  return { success: true, message: "Request processed successfully." };

} catch (error) {
  console.error("Handle Error:", error);
  throw new Parse.Error(500, "Error handling friend request: " + error.message);
}
});

Parse.Cloud.define("getGroupMemberNames", async (request) => {
  const { groupId } = request.params;
  const Group = Parse.Object.extend("Group");
  const query = new Parse.Query(Group);
  
  try {
      const group = await query.get(groupId, { useMasterKey: true });
      const membersRelation = group.relation('group_members');
      const memberQuery = membersRelation.query();
      
      // bypass ACLs and get name fields with master key
      const users = await memberQuery.find({ useMasterKey: true });
      
      return users.map(user => ({
          id: user.id,
          user_firstname: user.get('user_firstname') || "",
          user_surname: user.get('user_surname') || user.get('username') || "Anonymous User"
      }));
  } catch (error) {
      throw new Parse.Error(500, "Failed to fetch member names: " + error.message);
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


Parse.Cloud.define("searchUsers", async (request) => {
const query = request.params.query;
if (!query) return [];

const lowerQuery = query.toLowerCase().trim();
const parts = lowerQuery.split(/\s+/);

let userCompoundQuery;

if (parts.length === 1) {
  // Single word: search firstname OR surname OR username
  const regex = new RegExp(parts[0], "i");
  
  const UserQuery = new Parse.Query(Parse.User);
  UserQuery.matches("user_firstname", regex);

  const UserQuery2 = new Parse.Query(Parse.User);
  UserQuery2.matches("user_surname", regex);

  const UserQuery3 = new Parse.Query(Parse.User);
  UserQuery3.matches("username", regex);

  userCompoundQuery = Parse.Query.or(UserQuery, UserQuery2, UserQuery3);
} else {
  // Multiple words: assume "firstname surname"
  const [firstName, ...restParts] = parts;
  const lastName = restParts.join(" ");

  // Search firstname AND surname
  const BothQuery = new Parse.Query(Parse.User);
  BothQuery.matches("user_firstname", new RegExp(firstName, "i"));
  BothQuery.matches("user_surname", new RegExp(lastName, "i"));

  // Fallback: full query in firstname OR surname OR username
  const fullRegex = new RegExp(lowerQuery, "i");

  const UserQuery = new Parse.Query(Parse.User);
  UserQuery.matches("user_firstname", fullRegex);

  const UserQuery2 = new Parse.Query(Parse.User);
  UserQuery2.matches("user_surname", fullRegex);

  const UserQuery3 = new Parse.Query(Parse.User);
  UserQuery3.matches("username", fullRegex);

  userCompoundQuery = Parse.Query.or(BothQuery, UserQuery, UserQuery2, UserQuery3);
}

userCompoundQuery.limit(20);

try {
  const users = await userCompoundQuery.find({ useMasterKey: true });

  return users.map((user) => ({
    id: user.id,
    user_firstname: user.get("user_firstname"),
    user_surname: user.get("user_surname"),
    username: user.get("username"),
    profile_picture: user.get("profile_picture")?.url() || null,
  }));
} catch (error) {
  throw new Parse.Error(500, "User search failed.");
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