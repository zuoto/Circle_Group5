async function createPost(postContent, hangoutTime, groupId = null) {
  try {
    const Parse = window.Parse; 
    
    const currentUser = Parse.User.current();
    if (!currentUser) {
      throw new Error("No user is currently logged in.");
    }

    if (!postContent || !postContent.trim()) {
      throw new Error("Post content is required");
    }
    
    if (!hangoutTime || !(hangoutTime instanceof Date)) {
      throw new Error("Valid hangout time is required");
    }
    // new post object
    const Post = Parse.Object.extend("Post");
    const newPost = new Post();

    newPost.set("post_content", postContent);
    newPost.set("hangoutTime", hangoutTime);
    newPost.set("author", currentUser);
    newPost.set("participants", []); // no participants yet

    if (groupId) {
      const groupPointer = Parse.Object.createWithoutData("Group", groupId);
      newPost.set("group", groupPointer);
    }
    
    const savedPost = await newPost.save();

    console.log("Post created successfully:", savedPost.id);

    return {
      id: savedPost.id,
      content: savedPost.get("post_content"),
      hangoutTime: savedPost.get("hangoutTime"), 
      author: {
        id: currentUser.id,
        username: currentUser.get("username")
      },
      createdAt: savedPost.get("createdAt"),
      participants: [],
      comments: []
    };
  } catch (error) {
    throw error;
  }
}

export default createPost;