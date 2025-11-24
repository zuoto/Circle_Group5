export const performSearch = async (query) => {
  const Parse = window.Parse;
  const lowerQuery = query.toLowerCase();

  try {
    // users
    const UserQuery = new Parse.Query(Parse.User);
    UserQuery.matches("user_firstname", new RegExp(lowerQuery, "i"));

    const UserQuery2 = new Parse.Query(Parse.User);
    UserQuery2.matches("user_surname", new RegExp(lowerQuery, "i"));

    const UserQuery3 = new Parse.Query(Parse.User);
    UserQuery3.matches("username", new RegExp(lowerQuery, "i"));

    const userCompoundQuery = Parse.Query.or(UserQuery, UserQuery2, UserQuery3);
    userCompoundQuery.limit(10);
    const users = await userCompoundQuery.find();

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
      events: events.length
    });

    return { users, groups, events };
  } catch (error) {
    console.error("Search error details:", error);
    throw error;
  }
};