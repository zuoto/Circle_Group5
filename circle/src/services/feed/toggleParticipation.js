async function toggleParticipation(postId) {
  try {
    const Parse = window.Parse; 
    
    const currentUser = Parse.User.current();
    const Post = Parse.Object.extend("Post");
    const query = new Parse.Query(Post);

    const post = await query.get(postId);
    let participants = post.get("participants") || [];

    const userIndex = participants.findIndex((p) => p.id === currentUser.id);

    if (userIndex > -1) {
      participants.splice(userIndex, 1);
    } else {
      participants.push(currentUser);
    }

    post.set("participants", participants);
    await post.save();

    return participants;
  } catch (error) {
    console.error("Error toggling participation:", error);
    throw error;
  }
}

export default toggleParticipation;