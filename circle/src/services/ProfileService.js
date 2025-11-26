const Parse = window.Parse;

export const updateProfile = async (userId, newBio, photoFile) => {
  try {
    const currentUser = Parse.User.current();

    if (!currentUser || currentUser.id !== userId) {
      throw new Error("Unauthorized: Cannot edit another user's profile.");
    }

    let userToUpdate = Parse.User.createWithoutData(userId);

    userToUpdate.set("bio", newBio);

    if (photoFile) {
      const parseFile = new Parse.File(photoFile.name, photoFile);
      await parseFile.save();
      userToUpdate.set("profile_picture", parseFile);
    }

    await userToUpdate.save(null, { useMasterKey: false });

    await currentUser.fetch();

    return true;
  } catch (error) {
    console.error("Profile update failed:", error);
    throw new Error(`Save failed: ${error.message || "Network error"}.`);
  }
};
