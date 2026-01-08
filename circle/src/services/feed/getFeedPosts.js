async function getFeedPosts() {
  try {
    const Parse = window.Parse; 
    
    const currentUser = Parse.User.current();
    if (!currentUser) {
      throw new Error("No user is currently logged in.");
    }

    const friendsRelation = currentUser.relation("user_friends");
    const friendsQuery = friendsRelation.query();
    const friends = await friendsQuery.find();
    
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
        const authorUser = post.get("author");
        // handle deleted users:
        if (!authorUser) return null;
        const groupObject = post.get("group");

        const firstName = authorUser.get("user_firstname") || "";
        const surname = authorUser.get("user_surname") || "";
        const fullName = `${firstName} ${surname}`.trim() || authorUser.get("username"); 

        const profilePictureFile = authorUser.get("profile_picture");
        const profilePicUrl = profilePictureFile?.url ? profilePictureFile.url() : null;

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
            name: fullName,
            username: authorUser.get("username"),
            profile_picture: profilePicUrl,
          },
          createdAt: post.get("createdAt"),
          participants: post.get("participants") || [],
          comments: comments.map((comment) => {
            const commentAuthor = comment.get("comment_author");

            // handle comment author's name and profile pic
            const cFirst = commentAuthor?.get("user_firstname") || "";
            const cLast = commentAuthor?.get("user_surname") || "";
            const cName = `${cFirst} ${cLast}`.trim() || commentAuthor?.get("username") || "Unknown";

            const cPic = commentAuthor?.get("profile_picture");
            
            return {
              id: comment.id,
              text: comment.get("text"),
              comment_author: {
                id: commentAuthor?.id,
                name: cName,
                username: commentAuthor?.get("username"),
                profile_picture: cPic?.url ? cPic.url() : null
              },
              createdAt: comment.get("createdAt"),
            };
          }),
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