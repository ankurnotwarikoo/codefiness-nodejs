const express = require("express");
const routes = require("express").Router();
const authcontroller = require("./controller/authenticationcontroller");
const app = express();
const port = process.env.PORT || 3000; // Using process.env.PORT or defaulting to 3000
const usercontroller = require("./controller/usercontoller");
const newscontroller = require("./controller/newscontroller");
const jwt = require("jsonwebtoken");

// Importing constants
const {
  UNAUTHORIZED_ERROR,
  INVALID_TOKEN_ERROR,
  UNAUTHORIZED_STATUS,
  FORBIDDEN_STATUS,
  SERVER_LISTENING_MESSAGE,
  SERVER_ERROR_MESSAGE,
} = require("./utilities/constants");

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
    return res.status(UNAUTHORIZED_STATUS).json({ error: UNAUTHORIZED_ERROR });
  }
  token = token.substring(7);

  jwt.verify(token, process.env.JWT_SIGNING_SECRET, (err, decoded) => {
    if (err) {
      return res.status(FORBIDDEN_STATUS).json({ error: INVALID_TOKEN_ERROR });
    }
    req.user = decoded;
    next();
  });
};

// Route handling for authentication, user, and news endpoints
routes.use("/api/auth", authcontroller.router);
routes.use("/api/users", sharedMiddleware, usercontroller);
routes.use("/api/users", sharedMiddleware, newscontroller);

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Assigning routes to the application
app.use(routes);

// Start the server
app.listen(port, (err) => {
  if (err) {
    return console.log(`${SERVER_ERROR_MESSAGE}`, err);
  }
  console.log(`${SERVER_LISTENING_MESSAGE} ${port}`);
});

module.exports = app;
