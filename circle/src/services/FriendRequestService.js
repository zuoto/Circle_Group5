import Parse from "../utils/parseClient.js";

/**
 * Creates a new FriendRequest object in the database.
 * @param {string} recipientId - The ID of the user receiving the request.
 */
export const sendFriendRequest = async (recipientId) => {
  if (!recipientId) {
    throw new Error("Recipient ID is required to send a friend request.");
  }

  const currentUser = Parse.User.current();

  const FriendRequest = Parse.Object.extend("FriendRequest");
  const newRequest = new FriendRequest();

  const recipientPointer = Parse.User.createWithoutData(recipientId);

  //checks if request has been sent to recipient
  const existingQuery = new Parse.Query(FriendRequest);
  existingQuery.equalTo("requester", currentUser);
  existingQuery.equalTo("recipient", recipientPointer);
  existingQuery.equalTo("status", "pending");
  const existingRequest = await existingQuery.first();

  //checks if request has been sent from the reqester
  const reverseQuery = new Parse.Query(FriendRequest);
  reverseQuery.equalTo("requester", recipientPointer);
  reverseQuery.equalTo("recipient", currentUser);
  reverseQuery.equalTo("status", "pending");
  const reverseRequest = await reverseQuery.first();

  const acl = new Parse.ACL(currentUser);
  acl.setReadAccess(recipientId, true);

  newRequest.setACL(acl);

  newRequest.set("requester", currentUser);
  newRequest.set("recipient", recipientPointer);
  newRequest.set("status", "pending");

  if (existingRequest || reverseRequest) {
    throw new Error("A pending friend request already exists with this user.");
  }

  await newRequest.save();

  return true;
};

export const fetchPendingFriendRequests = async () => {
  const currentUser = Parse.User.current();
  if (!currentUser) {
    return [];
  }

  try {
    const results = await Parse.Cloud.run("getMyPendingRequests");
    return results;
  } catch (error) {
    console.error("Error fetching pending friend requests:", error);
    return [];
  }
};

export const handleFriendRequest = async (requestId, action) => {
  try {
    return await Parse.Cloud.run("handleFriendRequest", { requestId, action });
  } catch (error) {
    console.error(`Error handling request on client side:`, error);
    throw error;
  }
};
