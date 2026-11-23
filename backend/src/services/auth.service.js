const prisma = require("../db");

// Find a single user by normalized email (includes passwordHash for verification)
async function findUserByEmail(email) {
  return await prisma.user.findUnique({
    where: {
      email: email
    }
  });
}

// Find a single user by ID (excludes passwordHash)
async function findUserById(id) {
  return await prisma.user.findUnique({
    where: {
      id: id
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });
}

// Create a new user in PostgreSQL
async function createUser({ name, email, passwordHash, role }) {
  return await prisma.user.create({
    data: {
      name: name,
      email: email,
      passwordHash: passwordHash,
      role: role || "USER"
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });
}

// Upgrade user to PROVIDER role in PostgreSQL
async function updateUserRoleToProvider(userId) {
  return await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      role: "PROVIDER"
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });
}

// Format user data into the client-safe structure expected by the frontend
function formatUserResponse(user) {
  if (!user) return null;

  const isProvider = user.role === "PROVIDER";

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roles: isProvider ? ["creator", "provider"] : ["creator"],
    createdAt: user.createdAt
  };
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserRoleToProvider,
  formatUserResponse
};
