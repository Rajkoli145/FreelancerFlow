const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/config");
const User = require("../models/user");

// protect middleware
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // No token provided?
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Decode token
    const decoded = jwt.verify(token, jwtSecret);

    // Fetch user from DB
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ message: "User not found, authorization denied" });
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = { protect };
