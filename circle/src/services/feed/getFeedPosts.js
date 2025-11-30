async function getFeedPosts() {
  try {
    const Parse = window.Parse; 
    
    const currentUser = Parse.User.current();
    if (!currentUser) {
      throw new Error("No user is currently logged in.");
    }

    const friends = currentUser.get("friends") || [];
    const usersToShow = [...friends, currentUser];

    const PostClass = Parse.Object.extend("Post");
    const query = new Parse.Query(PostClass);
    query.containedIn("author", usersToShow);
    query.include("author");
    query.include("group");
    query.descending("createdAt");
    query.limit(20);

    const parsePosts = await query.find();

    const postsWithComments = await Promise.all(
      parsePosts.map(async (post) => {
        const authorPointer = post.get("author");
        const groupObject = post.get("group");
        
        const userQuery = new Parse.Query(Parse.User);
        const authorUser = await userQuery.get(authorPointer.id);

        const profilePictureFile = authorUser.get("profile_picture");
        const profilePicUrl = profilePictureFile && typeof profilePictureFile.url === "function" 
          ? profilePictureFile.url() 
          : null;

        const Comment = Parse.Object.extend("Comments");
        const commentQuery = new Parse.Query(Comment);
        commentQuery.equalTo("comment_post", post);
        commentQuery.include("comment_author");
        commentQuery.ascending("createdAt");

        const comments = await commentQuery.find();

        const postData = {
          id: post.id,
          content: post.get("post_content"),
          hangoutTime: post.get("hangoutTime"),
          groupId: groupObject ? groupObject.id : null,
          groupName: groupObject ? groupObject.get("group_name") : null,
          author: {
            id: authorUser.id,
            username: authorUser.get("username"),
            user_firstname: authorUser.get("user_firstname"),
            user_surname: authorUser.get("user_surname"),
            profile_pic: profilePicUrl,
          },
          createdAt: post.get("createdAt"),
          participants: post.get("participants") || [],
          comments: comments.map((comment) => ({
            id: comment.id,
            content: comment.get("text"),
            author: {
              id: comment.get("comment_author")?.id,
              username: comment.get("comment_author")?.get("username"),
            },
            createdAt: comment.get("createdAt"),
          })),
        };

        return postData;
      })
    );

    return postsWithComments;
  } catch (error) {
    console.error("Error fetching feed:", error);
    throw error;
  }
}

export default getFeedPosts;