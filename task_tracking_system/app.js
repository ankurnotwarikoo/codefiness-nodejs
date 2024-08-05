const express = require("express");
const app = express();
const port = 3000;
const jwt = require("jsonwebtoken");

// Database connection
const connectDB = require("./config/db.js");

// Controllers
const authenticationController = require("./controller/authenticationcontroller.js");
const taskController = require("./controller/taskcontroller");
const teamsController = require("./controller/teamscontroller.js");
const userController = require("./controller/usercontroller.js");

// Connect to MongoDB
connectDB();

/**
 * Middleware function for shared token verification.
 * Checks if a valid token is provided in the request headers.
 * If no token is provided, responds with an unauthorized error status and message.
 * If a token is provided, verifies its validity using jwt.verify.
 * If the token is invalid, responds with a forbidden error status and message.
 * If the token is valid, attaches the decoded user information to the request object and calls the next middleware.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next function.
 */
const sharedMiddleware = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  token = token.substring(7);

  jwt.verify(token, process.env.JWT_SIGNING_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
    req.user = decoded;
    next();
  });
};

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

// Router
const routes = express.Router();
routes.use("/api/task-management", sharedMiddleware, taskController);
routes.use("/api/auth", authenticationController);
routes.use("/api", sharedMiddleware, userController);
routes.use("/api/team-management", sharedMiddleware, teamsController);

// Use routes
app.use(routes);

// Start the server
app.listen(port, (err) => {
  if (err) {
    return console.log("Something bad happened", err);
  }
  console.log(`Server is listening on port ${port}`);
});

module.exports = app;
