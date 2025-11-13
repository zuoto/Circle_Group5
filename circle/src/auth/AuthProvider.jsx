import React, { createContext, useContext, useState, useEffect } from "react";

//creating context for authentication information
const AuthContext = createContext();

export function AuthProvider({ children }) {
  //seeing if there is any existing authentication data in local storage, and loggin it in if yes
  //TODO: store in a more secure way, maybe cookies?
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem("auth");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  // put authentication data to localStorage so users stay logged in across page refreshes
  useEffect(() => {
    if (auth) {
      localStorage.setItem("auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("auth");
    }
  }, [auth]);

  async function login({ email, password }) {
    //mock user authentication
    //TODO: replace with real authentication API call
    try {
      const mockUser = {
        id: "user-123",
        email: email,
        name: email.split("@")[0],
      };
      const mockToken = "mock-jwt-token-" + Date.now();

      setAuth({ token: mockToken, user: mockUser });
      return mockUser;
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    setAuth(null);
    // TODO: make the logout function
  }

  return (
    //Share authentication with the rest of the app
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

//hook to access authentication context, skipping the need to import useContext and AuthContext in every file + error handling
//TODO: move to seperate file???
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
