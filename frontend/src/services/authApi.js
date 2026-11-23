import { request } from "./api.js";

const USERS_STORAGE_KEY = "podsphere_registered_users";
const isApiMode =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_USE_API === "true") ||
  (typeof globalThis.process !== "undefined" &&
    globalThis.process.env &&
    globalThis.process.env.VITE_USE_API === "true");

function getRegisteredUsers() {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function normalizeUser(user) {
  if (!user) return null;
  let role = user.role;
  if (role === "USER") {
    role = "creator";
  } else if (role === "PROVIDER") {
    role = "provider";
  } else if (typeof role === "string") {
    role = role.toLowerCase();
  }
  const cleanRole = role === "provider" ? "provider" : "creator";
  const userRoles = Array.isArray(user.roles)
    ? user.roles
    : cleanRole === "provider"
    ? ["creator", "provider"]
    : ["creator"];
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: cleanRole,
    roles: userRoles,
    avatar: user.avatar || null,
  };
}

export async function login({ email, password }) {
  const trimmedEmail = (email || "").trim().toLowerCase();
  const trimmedPassword = (password || "").trim();

  if (isApiMode) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
    });

    if (!data || !data.token || !data.user) {
      const error = new Error("Invalid response format received from authentication server.");
      error.status = 502;
      throw error;
    }

    return {
      user: normalizeUser(data.user),
      token: data.token,
    };
  }

  const users = getRegisteredUsers();
  const found = users.find(
    (u) => u.email.toLowerCase() === trimmedEmail && u.password === trimmedPassword
  );

  if (!found) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }

  const token = `pst_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  return {
    user: normalizeUser(found),
    token,
  };
}

export async function register({ name, email, password, role }) {
  const trimmedName = (name || "").trim();
  const trimmedEmail = (email || "").trim().toLowerCase();
  const trimmedPassword = (password || "").trim();
  const normalizedRole = (role || "creator").toLowerCase() === "provider" ? "PROVIDER" : "USER";

  if (isApiMode) {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        role: normalizedRole,
      }),
    });

    if (!data || !data.token || !data.user) {
      const error = new Error("Invalid response format received from authentication server.");
      error.status = 502;
      throw error;
    }

    return {
      user: normalizeUser(data.user),
      token: data.token,
    };
  }

  const users = getRegisteredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (existing) {
    const error = new Error("An account with this email already exists.");
    error.status = 409;
    throw error;
  }

  const roleStr = (role || "creator").toLowerCase() === "provider" ? "provider" : "creator";
  const newUser = {
    id: `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    name: trimmedName,
    email: trimmedEmail,
    password: trimmedPassword,
    role: roleStr,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveRegisteredUsers(users);

  const token = `pst_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  return {
    user: normalizeUser(newUser),
    token,
  };
}

export async function getCurrentUser() {
  const token = localStorage.getItem("podsphere_token");
  if (!token) return null;

  if (isApiMode) {
    const data = await request("/auth/me");
    if (data && data.user) {
      return normalizeUser(data.user);
    }
    return null;
  }

  const storedUser = localStorage.getItem("podsphere_user");
  if (!storedUser) return null;
  try {
    const parsed = JSON.parse(storedUser);
    return normalizeUser(parsed);
  } catch {
    return null;
  }
}

export async function activateProvider() {
  if (isApiMode) {
    const data = await request("/auth/activate-provider", {
      method: "POST",
    });
    if (data && data.token && data.user) {
      return {
        user: normalizeUser(data.user),
        token: data.token,
      };
    }
  }
  return null;
}

