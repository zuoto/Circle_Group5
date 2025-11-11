Parse.Cloud.define("optimizeGetAllGroups", async (request) => {
    const query = new Parse.Query("Group");
    query.descending("createdAt");  // sort by creation date

    // get user who's making the request
    const currentUser = request.user;

    try {
        // fetch groups from database
        const groupObjects = await query.find({ useMasterKey: true });

        // process all groups at once on the server
        const groupsData = await Promise.all(groupObjects.map(async group => {
            const relation = group.relation('group_members');
            const memberQuery = relation.query();

            // get member count
            const memberCount = await memberQuery.count({ useMasterKey: true });
            let isUserJoined = false;

            // check if current user is member
            if (currentUser) {
                const userCheck = relation.query();
                userCheck.equalTo("objectId", currentUser.id);
                const count = await userCheck.count({ useMasterKey: true });
                isUserJoined = count > 0;
            }

            // get file object from the group
            const picFile = group.get('group_default_pic');
            const picUrl = picFile ? picFile.url() : '/covers/default-cover.jpg';   // if no pic, use placeholder
           
            return {
                id: group.id,
                name: group.get('group_name'),
                description: group.get('group_description'),
                coverPhotoUrl: picUrl,
                memberCount: memberCount,
                isUserJoined: isUserJoined
                }; 
        }));

       return groupsData;
    } catch (error) {
        console.error("Cloud Function Error: ", error);
        throw new Parse.Error(500, "Error fetching groups.");
    }
});
