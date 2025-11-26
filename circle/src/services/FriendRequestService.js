const Parse = window.Parse;

/**
 * Creates a new FriendRequest object in the database.
 * @param {string} recipientId - The ID of the user receiving the request.
 */
export const sendFriendRequest = async (recipientId) => {
  try {
    const currentUser = Parse.User.current();
    if (!currentUser) {
      throw new Error("You must be logged in to send a friend request.");
    }

    const FriendRequest = Parse.Object.extend("FriendRequest");
    const newRequest = new FriendRequest();

    const recipientPointer = Parse.User.createWithoutData(recipientId);

    newRequest.set("requester", currentUser);
    newRequest.set("recipient", recipientPointer);
    newRequest.set("status", "pending");

    await newRequest.save();

    return true; // Success
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
};
