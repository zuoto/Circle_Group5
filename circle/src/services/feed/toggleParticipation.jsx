async function toggleParticipation(postId) {
  try {
    const currentUser = Parse.User.current();
    const Post = Parse.Object.extend("Post");
    const query = new Parse.Query(Post);

    const post = await query.get(postId);
    let participants = post.get("participants") || [];

    //are they already in?
    const userIndex = participants.findIndex((p) => p.id === currentUser.id);

    if (userIndex > -1) {
      //remove them
      participants.splice(userIndex, 1);
    } else {
      // add them
      participants.push(currentUser);
    }

    post.set("participants", participants);
    await post.save();

    return participants;
  } catch (error) {
    console.error("Error toggling participation:", error); //debugging, can be removed later
    throw error;
  }
}
