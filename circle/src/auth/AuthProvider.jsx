import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getParse = () => {
    // We rely on main.jsx to ensure window.Parse is initialized before AuthProvider is rendered
    return window.Parse;
  };

  useEffect(() => {
    const checkUser = async () => {
      const Parse = getParse();
      try {
        const user = Parse.User.current();
        if (user) {
          setCurrentUser(user);
        } else {
          console.log("no current user"); //for debugging
        }
      } catch (error) {
        console.error(" error checking current user:", error); //for debugging
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async ({ email, password }) => {
    const Parse = getParse();
    try {
      const user = await Parse.User.logIn(email, password);
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error("Login error:", error); //for debugging
      throw error;
    }
  };

  const register = async ({
    name,
    surname,
    email,
    password,
    dateOfBirth,
    location,
  }) => {
    const Parse = getParse();
    try {
      //creating new user
      const user = new Parse.User();
      user.set("username", email);
      user.set("user_firstname", name);
      user.set("user_surname", surname);
      user.set("email", email);
      user.set("password", password);

      if (dateOfBirth) {
        user.set("dateOfBirth", new Date(dateOfBirth));
      }

      if (location && location !== "Not specified") {
        user.set("locationText", location);
      }
      await user.signUp();

      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error("Register error:", error); //for debugging
      throw error;
    }
  };

  const logout = async () => {
    const Parse = getParse();
    try {
      await Parse.User.logOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error); //for debugging
      throw error;
    }
  };

  const values = {
    currentUser,
    loading,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={{ values }}>{children}</AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext without having to import useContext and AuthContext every time

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context.values;
}
