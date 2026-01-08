export const performSearch = async (query) => {
  const lowerQuery = query.toLowerCase().trim();

  try {
    const users = await Parse.Cloud.run("searchUsers", { query });

    const GroupClass = Parse.Object.extend("Group");
    const parts = lowerQuery.split(/\s+/);
    
    let groupQuery;
    
    if (parts.length === 1) {
      groupQuery = new Parse.Query(GroupClass);
      groupQuery.matches("group_name", new RegExp(parts[0], "i"));
    } else {
      const queries = parts.map(part => {
        const q = new Parse.Query(GroupClass);
        q.matches("group_name", new RegExp(part, "i"));
        return q;
      });
      
      const fullPhraseQuery = new Parse.Query(GroupClass);
      fullPhraseQuery.matches("group_name", new RegExp(lowerQuery, "i"));
      
      queries.push(fullPhraseQuery);
      
      groupQuery = Parse.Query.or(...queries);
    }
    
    groupQuery.include("group_admin");
    groupQuery.include("members");
    groupQuery.limit(10);
    const groups = await groupQuery.find();

    const EventClass = Parse.Object.extend("Event");
    
    let eventQuery;
    
    if (parts.length === 1) {
      const EventNameQuery = new Parse.Query(EventClass);
      EventNameQuery.contains("event_name", parts[0]);

      const EventInfoQuery = new Parse.Query(EventClass);
      EventInfoQuery.contains("event_info", parts[0]);

      eventQuery = Parse.Query.or(EventNameQuery, EventInfoQuery);
    } else {
      const nameQueries = parts.map(part => {
        const q = new Parse.Query(EventClass);
        q.contains("event_name", part);
        return q;
      });
      
      const infoQueries = parts.map(part => {
        const q = new Parse.Query(EventClass);
        q.contains("event_info", part);
        return q;
      });
      
      const fullNameQuery = new Parse.Query(EventClass);
      fullNameQuery.contains("event_name", lowerQuery);
      
      const fullInfoQuery = new Parse.Query(EventClass);
      fullInfoQuery.contains("event_info", lowerQuery);
      
      eventQuery = Parse.Query.or(
        ...nameQueries,
        ...infoQueries,
        fullNameQuery,
        fullInfoQuery
      );
    }
    
    eventQuery.include("event_host");
    eventQuery.include("parent_group");
    eventQuery.ascending("event_date");
    eventQuery.limit(10);

    const events = await eventQuery.find();

    console.log("Search results:", {
      users: users.length,
      groups: groups.length,
      events: events.length,
    });

    return { users, groups, events };
  } catch (error) {
    console.error("Search error details:", error);
    throw error;
  }
};