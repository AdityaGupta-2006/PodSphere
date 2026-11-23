import { useState, useEffect } from "react";
import * as authApi from "../services/authApi";
import { AuthContext } from "./authContextInstance";

function isValidUser(u) {
  if (!u || typeof u !== "object") return false;
  if (!u.id || typeof u.id !== "string" || !u.id.trim()) return false;
  if (!u.email || typeof u.email !== "string" || !u.email.trim()) return false;
  return true;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    const saved = localStorage.getItem("podsphere_active_workspace");
    return saved === "provider" ? "provider" : "creator";
  });

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("podsphere_token");
        const storedUser = localStorage.getItem("podsphere_user");

        if (!storedToken || !storedUser) {
          if (isMounted) {
            setUser(null);
            setToken(null);
            setLoading(false);
          }
          return;
        }

        let parsedUser = null;
        try {
          parsedUser = JSON.parse(storedUser);
        } catch {
          parsedUser = null;
        }

        if (!isValidUser(parsedUser) || typeof storedToken !== "string" || !storedToken.trim()) {
          localStorage.removeItem("podsphere_user");
          localStorage.removeItem("podsphere_token");
          if (isMounted) {
            setUser(null);
            setToken(null);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setUser(parsedUser);
          setToken(storedToken);
          const savedWs = localStorage.getItem("podsphere_active_workspace");
          if (savedWs === "creator" || savedWs === "provider") {
            setActiveWorkspace(savedWs);
          } else if (parsedUser.role === "provider") {
            setActiveWorkspace("provider");
            localStorage.setItem("podsphere_active_workspace", "provider");
          } else {
            setActiveWorkspace("creator");
            localStorage.setItem("podsphere_active_workspace", "creator");
          }
        }

        try {
          const remoteUser = await authApi.getCurrentUser();
          if (isMounted && remoteUser) {
            setUser(remoteUser);
            localStorage.setItem("podsphere_user", JSON.stringify(remoteUser));
          }
        } catch (err) {
          if (err && (err.status === 401 || err.status === 403)) {
            localStorage.removeItem("podsphere_user");
            localStorage.removeItem("podsphere_token");
            if (isMounted) {
              setUser(null);
              setToken(null);
            }
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const switchWorkspace = (targetWorkspace) => {
    const target = targetWorkspace === "provider" ? "provider" : "creator";
    setActiveWorkspace(target);
    localStorage.setItem("podsphere_active_workspace", target);
  };

  const hasProviderAccess = Boolean(
    user?.role === "provider" ||
    (Array.isArray(user?.roles) && user.roles.includes("provider"))
  );

  const activateProviderAccess = async () => {
    if (!user) return null;
    const currentRoles = Array.isArray(user.roles) ? user.roles : [user.role || "creator"];
    const updatedRoles = Array.from(new Set([...currentRoles, "provider", "creator"]));
    const updatedUser = {
      ...user,
      role: "provider",
      roles: updatedRoles,
    };
    setUser(updatedUser);
    localStorage.setItem("podsphere_user", JSON.stringify(updatedUser));
    setActiveWorkspace("provider");
    localStorage.setItem("podsphere_active_workspace", "provider");

    const storedUsers = localStorage.getItem("podsphere_registered_users");
    if (storedUsers) {
      try {
        const usersList = JSON.parse(storedUsers);
        const idx = usersList.findIndex((u) => u.id === user.id || u.email === user.email);
        if (idx !== -1) {
          usersList[idx] = {
            ...usersList[idx],
            role: "provider",
            roles: updatedRoles,
          };
          localStorage.setItem("podsphere_registered_users", JSON.stringify(usersList));
        }
      } catch {
        // Non-critical: failed to persist updated role to registered-users list.
        // State is already updated in memory; ignore storage errors silently.
      }
    }
    return updatedUser;
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const result = await authApi.login({ email, password });
      setUser(result.user);
      setToken(result.token);
      localStorage.setItem("podsphere_user", JSON.stringify(result.user));
      localStorage.setItem("podsphere_token", result.token);
      const targetWs = result.user.role === "provider" ? "provider" : "creator";
      setActiveWorkspace(targetWs);
      localStorage.setItem("podsphere_active_workspace", targetWs);
      return result.user;
    } catch (err) {
      setError(err.message || "Authentication failed");
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const result = await authApi.register(userData);
      setUser(result.user);
      setToken(result.token);
      localStorage.setItem("podsphere_user", JSON.stringify(result.user));
      localStorage.setItem("podsphere_token", result.token);
      const targetWs = result.user.role === "provider" ? "provider" : "creator";
      setActiveWorkspace(targetWs);
      localStorage.setItem("podsphere_active_workspace", targetWs);
      return result.user;
    } catch (err) {
      setError(err.message || "Registration failed");
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem("podsphere_user");
    localStorage.removeItem("podsphere_token");
    localStorage.removeItem("podsphere_active_workspace");
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    error,
    activeWorkspace,
    switchWorkspace,
    hasProviderAccess,
    activateProviderAccess,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
