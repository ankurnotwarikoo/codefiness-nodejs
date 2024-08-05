const express = require("express");
const authenticationcontroller = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
require("dotenv").config();

const {
  ERROR_EMAIL_FORMAT,
  ERROR_EMAIL_EXISTS,
  ERROR_PASSWORD_MANDATORY,
  ERROR_EMAIL_NOT_FOUND,
  ERROR_INVALID_PASSWORD,
  RESPONSE_MESSAGES,
} = require("../helpers/constants");

authenticationcontroller.use(express.json());

/**
 * Middleware function to validate the request body for user registration.
 * Validates that the request contains the required fields: firstName, lastName, email, and password.
 * Ensures that the email is in the correct format and that the password is provided.
 * If validation fails, sends an appropriate error response.
 * If validation succeeds, forwards the request to the next middleware or route handler.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next function.
 */
async function validateRequestBodyForRegistration(req, res, next) {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName) {
    return res
      .status(400)
      .json({ body: "Bad Request: First Name cannot be blank", status: 400 });
  }

  if (!lastName) {
    return res
      .status(400)
      .json({ body: "Bad Request: Last Name cannot be blank", status: 400 });
  }

  if (!password) {
    return res.status(400).json({ error: ERROR_PASSWORD_MANDATORY });
  }

  if (!email || !RESPONSE_MESSAGES.EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      error: ERROR_EMAIL_FORMAT,
    });
  }

  next();
}

/**
 * Route handler for user registration.
 * Registers a new user with the provided firstName, lastName, email, and password.
 * Hashes the user's password using bcrypt for security before saving it to the database.
 * Checks if the email is already registered and sends an error response if it is.
 * If registration is successful, sends a success response with a status code of 201.
 *
 * @route POST /register
 * @param {object} req - Express request object containing user registration data in the body.
 * @param {object} res - Express response object used to send the response.
 */
authenticationcontroller.post(
  "/register",
  validateRequestBodyForRegistration,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      let userFromDb = await User.findOne({ email: email });
      if (userFromDb) {
        return res.status(400).json({ error: ERROR_EMAIL_EXISTS });
      }

      let user = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: bcrypt.hashSync(password, 8),
      });

      await user.save();
      return res
        .status(201)
        .json({ body: "User Registered Successfully", status: 201 });
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate key error code
        console.log("Duplicate key error: " + err);
        return res.status(400).json({ error: ERROR_EMAIL_EXISTS });
      }
      console.log("Error logged: " + err);
      return res.status(500).send(err.errmsg);
    }
  }
);

/**
 * Route handler for user login.
 * Authenticates a user with the provided email and password.
 * If the email is not found or the password is incorrect, sends an appropriate error response.
 * If authentication is successful, generates a JWT token and sends it in the response.
 *
 * @route POST /login
 * @param {object} req - Express request object containing user login data in the body.
 * @param {object} res - Express response object used to send the response.
 */
authenticationcontroller.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email: email });
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
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.JWT_SIGNING_SECRET,
      {
        expiresIn: 86400, // Token expires in 24 hours
      }
    );
  }

  return res.status(200).json({
    email: user.email,
    message: RESPONSE_MESSAGES.LOGIN_SUCCESSFUL,
    token: token,
  });
});

module.exports = authenticationcontroller;
