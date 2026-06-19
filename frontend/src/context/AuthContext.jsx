// src/context/AuthContext.jsx — Global auth state with localStorage persistence
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token

  // On mount, check if there's a valid token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("jobpilot_token");
    if (!token) {
      setLoading(false);
      return;
    }

    authAPI
      .me()
      .then((userData) => setUser(userData))
      .catch(() => {
        // Token is invalid/expired — clear it
        localStorage.removeItem("jobpilot_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem("jobpilot_token", data.token);
    // Fetch full user profile after login
    const userData = await authAPI.me();
    setUser(userData);
    return data;
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const data = await authAPI.signup(name, email, password);
    localStorage.setItem("jobpilot_token", data.token);
    const userData = await authAPI.me();
    setUser(userData);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("jobpilot_token");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authAPI.me();
      setUser(userData);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
