async function createPost(postContent, hangoutTime) {
  try {
    const Parse = window.Parse; 
    
    const currentUser = Parse.User.current();
    if (!currentUser) {
      throw new Error("No user is currently logged in.");
    }

    // new post object
    const Post = Parse.Object.extend("Post");
    const newPost = new Post();

    newPost.set("post_content", postContent);
    newPost.set("hangoutTime", hangoutTime);
    newPost.set("author", currentUser);
    newPost.set("participants", []); // no participants yet

    const savedPost = await newPost.save();

    console.log("Post created successfully:", savedPost.id);

    return {
      id: savedPost.id,
      content: savedPost.get("post_content"),
      hangoutTime: savedPost.get("hangoutTime"), //TODO: MAKE IT INTO DATE OBJECT
      author: {
        id: currentUser.id,
        username: currentUser.get("username")
      },
      createdAt: savedPost.get("createdAt"),
      participants: [],
      comments: []
    };
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

export default createPost;