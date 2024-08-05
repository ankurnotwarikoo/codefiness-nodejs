const express = require("express");
const teamsController = express.Router();
const Team = require("../models/teams"); // Path to your Team model
const User = require("../models/users"); // Path to your User model

/**
 * @route POST /teams
 * @description Create a new team
 * @access Private
 *
 * @param {string} req.body.name - The name of the team to be created
 * @param {string} [req.body.description] - Optional description of the team
 * @param {string[]} req.body.memberEmails - Array of member emails to be added to the team
 * @returns {object} 201 - Created team object
 * @returns {string} 400 - Validation error message if required fields are missing
 * @returns {string} 404 - Error message if some members are not found
 * @returns {string} 500 - Error message for server errors
 */
teamsController.post("/teams", async (req, res) => {
  const { name, description, memberEmails } = req.body;

  try {
    // Validate input: Ensure that both name and memberEmails are provided
    if (!name || !memberEmails) {
      return res
        .status(400)
        .json({ text: "Name and member emails are required" });
    }

    // Find users by their email addresses provided in memberEmails
    const members = await User.find({ email: { $in: memberEmails } });

    // Check if all provided emails have corresponding users in the database
    if (members.length !== memberEmails.length) {
      return res.status(404).json({ text: "Some members not found" });
    }

    // Create a new Team document
    const team = new Team({
      name, // Set the team name
      description, // Set the team description
      members: members.map((member) => member._id), // Map member objects to their IDs
      createdBy: req.user._id, // Set the team creator to the current logged-in user's ID
    });

    if (!team.createdBy) {
      return res.status(400).json({ text: "Created by cannot be blank" });
    }

    // Save the team to the database
    const savedTeam = await team.save();

    // Respond with the created team object and a 201 status
    res.status(201).json(savedTeam);
  } catch (err) {
    // Handle errors and respond with a 500 status and error message
    if (err.code === 11000) {
      // Duplicate key error code
      console.log("Duplicate key error: " + err);
      return res
        .status(400)
        .json({ error: RESPONSE_MESSAGES.ERROR_EMAIL_EXISTS });
    }
    res.status(500).send(err.message);
    console.log(err.message);
    console.log("Ankur Mandalllll");
  }
});

/**
 * @middleware authorizeTeamEdit
 * @description Middleware to authorize user for editing a team
 *
 * @param {string} req.params.id - The ID of the team to be edited
 * @returns {function} next - Calls the next middleware function if authorized
 * @returns {string} 404 - Error message if the team is not found
 * @returns {string} 403 - Error message if the user is not authorized to edit the team
 * @returns {string} 500 - Error message for server errors
 */
async function authorizeTeamEdit(req, res, next) {
  try {
    const { id } = req.params; // Get the team ID from the request parameters
    const team = await Team.findById(id); // Find the team by ID in the database

    // Check if the team exists
    if (!team) {
      return res.status(404).json({ text: "Team not found" });
    }

    // Check if the logged-in user is the creator of the team
    if (!team.createdBy.equals(req.user._id)) {
      return res
        .status(403)
        .json({ text: "You are not authorized to edit this team" });
    }

    // If the user is authorized, proceed to the next middleware or route handler
    next();
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error code
      console.log("Duplicate key error: " + err);
      return res
        .status(400)
        .json({ error: RESPONSE_MESSAGES.ERROR_EMAIL_EXISTS });
    }
    // Handle errors and respond with a 500 status and error message
    res.status(500).send(err.message);
  }
}

/**
 * @route PUT /teams/:id
 * @description Update a team
 * @access Private
 *
 * @middleware authorizeTeamEdit - Authorizes the user to edit the team
 * @param {string} req.params.id - The ID of the team to be updated
 * @param {string} [req.body.name] - Optional new name of the team
 * @param {string} [req.body.description] - Optional new description of the team
 * @param {string[]} [req.body.memberEmails] - Optional array of new member emails to be added to the team
 * @returns {object} 200 - Updated team object
 * @returns {string} 400 - Validation error message if nothing to update
 * @returns {string} 404 - Error message if some members are not found or team not found
 * @returns {string} 500 - Error message for server errors
 */
teamsController.put("/teams/:id", authorizeTeamEdit, async (req, res) => {
  const { id } = req.params; // Get the team ID from the request parameters
  const { name, description, memberEmails } = req.body; // Destructure name, description, and memberEmails from the request body

  try {
    // Validate input: Ensure at least one field is provided for update
    if (!name && !description && !memberEmails) {
      return res.status(400).json({ text: "Nothing to update" });
    }

    // If memberEmails are provided, find corresponding users
    let members;
    if (memberEmails) {
      members = await User.find({ email: { $in: memberEmails } });

      // Check if all provided emails have corresponding users in the database
      if (members.length !== memberEmails.length) {
        return res.status(404).json({ text: "Some members not found" });
      }
    }

    // Find the team by ID in the database
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ text: "Team not found" });
    }

    // Update team fields if provided in the request body
    if (name) team.name = name; // Update team name
    if (description) team.description = description; // Update team description
    if (members) team.members = members.map((member) => member._id); // Update team members

    // Save the updated team to the database
    const updatedTeam = await team.save();

    // Respond with the updated team object and a 200 status
    res.status(200).json(updatedTeam);
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error code
      console.log("Duplicate key error: " + err);
      return res
        .status(400)
        .json({ error: RESPONSE_MESSAGES.ERROR_EMAIL_EXISTS });
    }
    // Handle errors and respond with a 500 status and error message
    res.status(500).send(err.message);
  }
});

module.exports = teamsController;
