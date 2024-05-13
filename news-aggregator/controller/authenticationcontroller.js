const express = require("express");
const authenticationcontroller = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const {
  EMAIL_REGEX,
  DEFAULT_PREFERENCES,
  ERROR_USERNAME_FORMAT,
  ERROR_EMAIL_EXISTS,
  ERROR_PASSWORD_MANDATORY,
  ERROR_EMAIL_NOT_FOUND,
  ERROR_INVALID_PASSWORD,
  LOGIN_SUCCESSFUL,
} = require("../utilities/constants");

authenticationcontroller.use(express.json());

let users = [];
let globalCounter = 0;

/**
 * Middleware function to validate the request body for user registration.
 * Checks if the provided email, password, and preferences are valid.
 * If the validation fails, appropriate error responses are sent.
 * If the validation passes, the request is forwarded to the next middleware.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next function.
 */
function validateRequestBodyForRegistration(req, res, next) {
  if (!req.body.email || !EMAIL_REGEX.test(req.body.email)) {
    return res.status(400).json({
      error: ERROR_USERNAME_FORMAT,
    });
  }

  let user = users.find((user) => user.email === req.body.email);
  if (user) {
    return res.status(400).json({ error: ERROR_EMAIL_EXISTS });
  }

  if (!req.body.password) {
    return res.status(400).json({ error: ERROR_PASSWORD_MANDATORY });
  }

  if (!req.body.preferences) req.body.preferences = DEFAULT_PREFERENCES;

  next();
}

/**
 * Handles the registration endpoint POST /register.
 * This route is responsible for registering a new user.
 * It first validates the request body using the validateRequestBodyForRegistration middleware.
 * If the request body is valid, it creates a new user object with the provided email, hashed password,
 * and preferences. The password is hashed using bcrypt for security.
 * It then assigns a unique ID to the user, increments the global counter for user IDs, adds the user
 * object to the users array, and responds with the details of the registered user.
 * @param {object} req - Express request object containing user registration data in the body.
 * @param {object} res - Express response object used to send the response.
 */
authenticationcontroller.post(
  "/register",
  validateRequestBodyForRegistration,
  (req, res) => {
    let user = {
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      preferences: req.body.preferences,
    };
    globalCounter++;
    user.id = globalCounter;
    users.push(user);
    res.status(200).send(user);
  }
);

/**
 * Handles the POST /login endpoint for user authentication.
 * Authenticates the user based on the provided email and password.
 * If authentication succeeds, it generates a JWT token and sends it in the response.
 * If authentication fails, appropriate error responses are sent.
 * @param {object} req - Express request object containing user login data in the body.
 * @param {object} res - Express response object used to send the response.
 */
authenticationcontroller.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(404).json({ error: ERROR_EMAIL_NOT_FOUND });
  }

  let passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: ERROR_INVALID_PASSWORD });
  } else {
    var token = jwt.sign(
      {
        email: user.email,
      },
      process.env.JWT_SIGNING_SECRET,
      {
        expiresIn: 86400,
      }
    );
  }

  return res.status(200).json({
    email: user.email,
    message: LOGIN_SUCCESSFUL,
    token: token,
  });
});

module.exports = {
  router: authenticationcontroller,
  users: users,
};
