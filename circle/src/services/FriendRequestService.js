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

    const existingQuery = new Parse.Query(FriendRequest);
    existingQuery.equalTo("requester", currentUser);
    existingQuery.equalTo("recipient", recipientPointer);
    existingQuery.equalTo("status", "pending");

    const existingRequest = await existingQuery.first();

    const acl = new Parse.ACL(currentUser);
    acl.setReadAccess(recipientId, true);

    newRequest.setACL(acl);

    newRequest.set("requester", currentUser);
    newRequest.set("recipient", recipientPointer);
    newRequest.set("status", "pending");

    if (existingRequest || reverseRequest) {
      throw new Error(
        "A pending friend request already exists with this user."
      );
    }

    await newRequest.save();

    return true;
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
};

export const fetchPendingFriendRequests = async () => {
  const currentUser = Parse.User.current();
  if (!currentUser) {
    // Always return a result if the user isn't logged in, avoids errors
    return [];
  }

  const FriendRequest = Parse.Object.extend("FriendRequest");
  const query = new Parse.Query(FriendRequest);

  query.equalTo("recipient", currentUser);
  query.equalTo("status", "pending");

  query.include("requester");

  try {
    return await query.find();
  } catch (error) {
    console.error("Error fetching pending friend requests:", error);
    throw error;
  }
};

/**
 * Calls the secure server-side function to accept or reject a request.
 * @param {string} requestId - The ID of the FriendRequest object.
 * @param {'accept' | 'reject'} action - The action to perform.
 */
export const handleFriendRequest = async (requestId, action) => {
  try {
    // 💡 Learning: This is the client-side entry point for the secure logic
    return await Parse.Cloud.run("handleFriendRequest", { requestId, action });
  } catch (error) {
    console.error(`Error handling request on client side:`, error);
    throw error;
  }
};
