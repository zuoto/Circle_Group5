// SearchService.js (MODIFIED)

export const performSearch = async (query) => {
  const Parse = window.Parse;
  const lowerQuery = query.toLowerCase();
  const caseSensitiveQuery = query;

  // Initialize users as an array (this will be overwritten by the cloud function result)
  let users = [];

  try {
    // ----------------------------------------------------
    // NEW SECURE USER SEARCH VIA CLOUD FUNCTION
    // ----------------------------------------------------

    // The previous client-side Parse.Query(Parse.User) logic is REMOVED.
    // We now call the Cloud Function you implemented, which uses the Master Key
    // to search all users securely on the server.

    users = await Parse.Cloud.run("searchUsers", { query: caseSensitiveQuery });

    // ----------------------------------------------------
    // GROUPS AND EVENTS SEARCH (Existing Logic)
    // ----------------------------------------------------

    // groups
    const GroupClass = Parse.Object.extend("Group");
    const GroupQuery = new Parse.Query(GroupClass);
    GroupQuery.matches("group_name", new RegExp(lowerQuery, "i"));
    GroupQuery.include("group_admin");
    GroupQuery.include("members");
    GroupQuery.limit(10);
    const groups = await GroupQuery.find();

    // events
    const EventClass = Parse.Object.extend("Event");
    const EventNameQuery = new Parse.Query(EventClass);
    EventNameQuery.contains("event_name", lowerQuery);

    const EventInfoQuery = new Parse.Query(EventClass);
    EventInfoQuery.contains("event_info", lowerQuery);

    const eventCompoundQuery = Parse.Query.or(EventNameQuery, EventInfoQuery);
    eventCompoundQuery.include("event_host");
    eventCompoundQuery.include("parent_group");
    eventCompoundQuery.ascending("event_date");
    eventCompoundQuery.limit(10);

    const events = await eventCompoundQuery.find();

    console.log("Search results:", {
      users: users.length,
      groups: groups.length,
      events: events.length,
    });

    return { users, groups, events };
  } catch (error) {
    // If the Cloud Function fails, the error will be caught here.
    console.error("Search error details:", error);
    throw error;
  }
};
