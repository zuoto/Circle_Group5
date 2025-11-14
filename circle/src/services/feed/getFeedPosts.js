async function getFeedPosts() {
  try {
    const Parse = window.Parse; 
    
    const currentUser = Parse.User.current();
    if (!currentUser) {
      throw new Error("No user is currently logged in.");
    }

    const friends = currentUser.get("friends") || [];
    const userIds = friends.map((friend) => friend.id);
    userIds.push(currentUser.id); // including own posts

    const PostClass = Parse.Object.extend("Post");
    const query = new Parse.Query(PostClass);
    query.containedIn("author", friends);
    query.include("author");
    query.descending("createdAt");
    query.limit(20); // maybe more?

    const parsePosts = await query.find();

    const postsWithComments = await Promise.all(
      parsePosts.map(async (post) => {
        const Comment = Parse.Object.extend("Comments");
        const commentQuery = new Parse.Query(Comment);
        commentQuery.equalTo("post", post);
        commentQuery.include("author");
        commentQuery.ascending("createdAt");

        const comments = await commentQuery.find();

        return {
          id: post.id,
          content: post.get("post_content"),
          hangoutTime: post.get("hangoutTime"),
          author: {
            id: post.get("author").id,
            username: post.get("author").get("username"),
          },
          createdAt: post.get("createdAt"),
          participants: post.get("participants") || [],
          comments: comments.map((comment) => ({
            id: comment.id,
            content: comment.get("text"),
            author: {
              id: comment.get("comment_author").id,
              username: comment.get("comment_author").get("username"),
            },
            createdAt: comment.get("createdAt"),
          })),
        };
      })
    );

    return postsWithComments;
  } catch (error) {
    console.error("Error fetching feed:", error);
    throw error;
  }
}

export default getFeedPosts;