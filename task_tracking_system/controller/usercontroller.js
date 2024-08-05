const express = require("express");
const User = require("../models/users");
const userController = express.Router();
userController.use(express.json());
const {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} = require("../helpers/constants");

/**
 * Retrieves the profile information of the currently authenticated user.
 *
 * This endpoint returns the profile details of the user based on the email address
 * provided in the authenticated user's information (assumed to be available in `req.user.email`).
 * The user is located using the email address, and their profile information is returned if found.
 *
 * - The `email` used to find the user is extracted from `req.user.email`, which should contain
 *   the email of the authenticated user.
 * - The user is located using `findOne` based on the provided email address.
 *
 * @param {Object} req - The request object, containing `user` with the authenticated user's details.
 * @param {Object} res - The response object used to send the result back to the client.
 * @returns {Object} - The user's profile information if found, or an error message if the user is not found or an exception occurs.
 */

userController.get("/me", async (req, res) => {
  const email = req.user.email;

  try {
    // Fetch the task from the database by ID
    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .send(RESPONSE_MESSAGES.NOT_FOUND_ERROR);
    }

    return res.status(HTTP_STATUS_CODES.SUCCESS).json(user);
  } catch (err) {
    console.log("Error logged: " + err);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.errmsg);
  }
});

/**
 * Updates the profile information of the currently authenticated user.
 *
 * This endpoint allows the user to update their profile details. It fetches the user based on the
 * authenticated user's email (assumed to be available in `req.user.email`), then applies the updates
 * provided in the request body. The endpoint supports validation of the updated data and returns
 * the updated user profile if successful.
 *
 * - The `email` used to find the user is extracted from `req.user.email`, which should contain
 *   the email of the authenticated user.
 * - The user is located using `findOne` and then updated with `findOneAndUpdate`.
 * - The `new` option in `findOneAndUpdate` ensures that the updated document is returned.
 * - The `runValidators` option ensures that any schema validations are applied to the updated data.
 *
 * @param {Object} req - The request object, containing the `body` with the update fields and `user` with the authenticated user's details.
 * @param {Object} res - The response object used to send the result back to the client.
 * @returns {Object} - The updated user profile if successful, or an error message if the user is not found or an exception occurs.
 */

userController.put("/me", async (req, res) => {
  const email = req.user.email;

  try {
    // Fetch the task from the database by ID
    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .send(RESPONSE_MESSAGES.NOT_FOUND_ERROR);
    }

    const updates = req.body;

    // Find the user and update their profile
    const updatedUser = await User.findOneAndUpdate({ email: email }, updates, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(HTTP_STATUS_CODES.SUCCESS).json(updatedUser);
  } catch (err) {
    console.log("Error logged: " + err);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.errmsg);
  }
});

module.exports = userController;
