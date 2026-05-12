const jwt = require("jsonwebtoken");

const JWT_SECRET = "mysecretkey";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  // If no token
  if (!token) {
    return res.status(401).json({
      error: "Access denied. No token provided.",
    });
  }

  // Verify token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: "Invalid token",
      });
    }

    // Store decoded user info
    req.user = user;

    next();
  });
}

module.exports = authenticateToken;