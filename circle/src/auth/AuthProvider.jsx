import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    // Initialize from localStorage
    try {
      const raw = localStorage.getItem("auth");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  // Persist auth state to localStorage
  useEffect(() => {
    if (auth) {
      localStorage.setItem("auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("auth");
    }
  }, [auth]);

  async function login({ email, password }) {
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
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
