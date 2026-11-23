const bcrypt = require("bcrypt");
const authService = require("../../services/auth.service");
const { generateToken } = require("../../utils/jwt");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// User Registration Handler: POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate required fields and types
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Name is required and must be a valid string." });
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "Email is required and must be a valid string." });
    }

    if (!password || typeof password !== "string" || password.trim().length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    // 2. Validate email format
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    // 3. Check for existing user with duplicate email
    const existingUser = await authService.findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // 4. Determine target role
    let targetRole = "USER";
    if (role && typeof role === "string" && (role === "PROVIDER" || role.toLowerCase() === "provider")) {
      targetRole = "PROVIDER";
    }

    // 5. Hash password with bcrypt (10 rounds)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password.trim(), saltRounds);

    // 6. Create user in database
    const newUser = await authService.createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: passwordHash,
      role: targetRole
    });

    // 7. Sign JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    // 8. Return token and sanitized user
    return res.status(201).json({
      token: token,
      user: authService.formatUserResponse(newUser)
    });
  } catch (err) {
    next(err);
  }
}

// User Login Handler: POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields and types
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (!password || typeof password !== "string" || !password.trim()) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // 2. Find user by normalized email
    const normalizedEmail = email.trim().toLowerCase();
    const user = await authService.findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // 3. Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password.trim(), user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // 4. Sign JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // 5. Return token and sanitized user
    return res.status(200).json({
      token: token,
      user: authService.formatUserResponse(user)
    });
  } catch (err) {
    next(err);
  }
}

// Get Current User Profile: GET /api/auth/me
async function getMe(req, res, next) {
  try {
    // req.user is attached by authenticate middleware
    return res.status(200).json({
      user: authService.formatUserResponse(req.user)
    });
  } catch (err) {
    next(err);
  }
}

// Activate Provider Role: POST /api/auth/activate-provider
async function activateProvider(req, res, next) {
  try {
    // req.user identity is derived strictly from verified JWT
    const userId = req.user.id;

    // Update user role in database to PROVIDER
    const updatedUser = await authService.updateUserRoleToProvider(userId);

    // Generate fresh JWT token with updated role
    const token = generateToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role
    });

    return res.status(200).json({
      message: "Provider privileges activated.",
      token: token,
      user: authService.formatUserResponse(updatedUser)
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
  activateProvider
};
