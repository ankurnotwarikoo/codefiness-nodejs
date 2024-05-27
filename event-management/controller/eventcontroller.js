const express = require("express");
const eventController = express.Router();
const events = require("../data/events").events;
const users = require("./authenticationcontroller").users;
const validator = require("validator");
let globalCount = require("../data/events").globalCount;
const { sendEmail } = require("../service/emailservice");
const jwt = require("jsonwebtoken");
const ROLE = require("../enums/Role");
require("dotenv").config();

const {
  DATE_REGEX,
  EMAIL_REGEX,
  ERROR_EMAIL_FORMAT,
  ERROR_INVALID_EMAIL_ORGANIZER,
  ERROR_DATE_MANDATORY,
  ERROR_DATE_FORMAT,
  ERROR_TIME_MANDATORY,
  ERROR_TITLE_MANDATORY,
  ERROR_TITLE_TOO_LONG,
  ERROR_TITLE_TOO_SHORT,
  ERROR_USER_WITH_EMAIL_NOT_FOUND,
} = require("../utilities/constants");

/**
 * Middleware to validate the request body for event creation/update.
 * Checks for the presence and format of title, date, time, and organizer.
 * Ensures the event date and time are not in the past.
 * Attaches the parsed event date and time to the request object.
 */
function validateRequestBodyForEvents(req, res, next) {
  const { title, date, time, organizer } = req.body;

  // Validate organizer email
  if (!organizer || !EMAIL_REGEX.test(organizer)) {
    return res.status(400).json({
      error: ERROR_EMAIL_FORMAT,
    });
  }

  // Check if the organizer exists in the users list
  let user = users.find((user) => user.email === organizer);
  if (!user) {
    return res.status(400).json({ error: ERROR_INVALID_EMAIL_ORGANIZER });
  }

  // Validate event title
  if (!title) {
    return res.status(400).json({ error: ERROR_TITLE_MANDATORY });
  }
  if (title.length > 100) {
    return res.status(400).json({ error: ERROR_TITLE_TOO_LONG });
  }
  if (title.length < 3) {
    return res.status(400).json({ error: ERROR_TITLE_TOO_SHORT });
  }

  // Validate event date
  if (!date) {
    return res.status(400).json({ error: ERROR_DATE_MANDATORY });
  }
  if (!DATE_REGEX.test(date)) {
    return res.status(400).send({ error: ERROR_DATE_FORMAT });
  }

  // Parse event date
  const [day, month, year] = date.split("-").map(Number);
  let eventDate = new Date(year, month - 1, day);

  // Validate event time
  if (!time) {
    return res.status(400).json({ error: ERROR_TIME_MANDATORY });
  }
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return res
      .status(400)
      .send({ error: "The event time must be in the format HH:MM." });
  }

  // Parse event time
  const [hours, minutes] = time.split(":").map(Number);
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return res
      .status(400)
      .send({ error: "The event time must be a valid time." });
  }

  // Combine date and time into a single Date object
  eventDate = new Date(year, month - 1, day, hours, minutes);

  // Check if the event date and time are not in the past
  if (eventDate < new Date()) {
    return res
      .status(400)
      .send({ error: "The event date and time cannot be in the past." });
  }

  // Attach the transformed date and time to the request object
  req.eventDateTime = eventDate;
  next();
}

/**
 * Middleware to validate the attendee's email for event registration.
 * Checks for the presence and format of the attendee email.
 * Ensures the attendee exists in the users list.
 */
function validateEmailForRegistration(req, res, next) {
  const { attendee } = req.body;

  // Validate attendee email format
  if (!attendee || !EMAIL_REGEX.test(attendee)) {
    return res.status(400).json({
      error: ERROR_EMAIL_FORMAT,
    });
  }

  // Check if the attendee exists in the users list
  let user = users.find((user) => user.email === attendee);
  if (!user) {
    return res.status(404).json({
      error: ERROR_USER_WITH_EMAIL_NOT_FOUND,
    });
  }

  // Proceed to the next middleware or route handler if validation passes
  next();
}

/**
 * Middleware to extract the user's role from the JWT token.
 * This function verifies the JWT token from the authorization header,
 * decodes it to extract the user's role, and attaches the role to the request object.
 * If the token is invalid or missing, it sends an appropriate error response.
 *
 * Steps:
 * 1. Retrieve the JWT token from the 'authorization' header.
 * 2. Remove the 'Bearer ' prefix from the token.
 * 3. Verify the token using the secret key from environment variables.
 * 4. If verification fails, respond with a 500 status and an error message.
 * 5. If verification succeeds, extract the role from the decoded token.
 * 6. Attach the role to the request object.
 * 7. Call the next middleware or route handler.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
function extractRole(req, res, next) {
  // Retrieve the JWT token from the 'authorization' header
  let token = req.headers["authorization"];

  // Remove the 'Bearer ' prefix from the token
  token = token.substring(7);

  // Verify the token using the secret key from environment variables
  jwt.verify(token, process.env.JWT_SIGNING_SECRET, (err, decoded) => {
    if (err) {
      // If verification fails, respond with a 500 status and an error message
      return res.status(500).send({ error: "Failed to authenticate token." });
    }
    // If verification succeeds, extract the role from the decoded token
    req.role = decoded.role;

    // Call the next middleware or route handler
    next();
  });
}

/*
  Retrieves the details of a specific event by its ID.
  
  Method: GET
  Route: "/events/:id"
  
  Parameters:
    - req: Express request object containing the event ID in params
    - res: Express response object to send the event details or error message
  
  Steps:
    1. Extract the event ID from the request parameters.
    2. Find the event in the 'events' array based on the provided ID.
    3. If no event is found, return a 404 status with a corresponding error message.
    4. If the event is found, return a 200 status with the event details in JSON format.
  
  Error Handling:
    - If an error occurs during execution, log the error and return a 500 status
      with an error message in JSON format.
*/
eventController.get("/events/:id", (req, res) => {
  try {
    let eventId = req.params.id;
    let event = events.find((event) => event.id === parseInt(req.params.id));
    if (!event) {
      return res.status(404).json({
        message: `No event found with event id ${eventId}`,
      });
    }
    res.status(200).json(event);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /events
 * Route to fetch all events.
 * This endpoint requires the user to be authenticated, as indicated by the use of the `extractRole` middleware.
 *
 * Steps:
 * 1. Apply `extractRole` middleware to ensure the user is authenticated and their role is extracted from the JWT token.
 * 2. Check if there are any events in the `events` array.
 *    - If no events are found, respond with a 200 status and an empty array.
 * 3. If events are found, respond with a 200 status and the list of events.
 * 4. Handle any potential errors by logging the error and responding with a 500 status and the error message.
 *
 * @param {string} path - The endpoint path
 * @param {function} middleware - The middleware function to extract user role
 * @param {function} handler - The route handler function
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
eventController.get("/events", (req, res) => {
  try {
    // Check if the events array is empty
    if (events.length == 0) {
      // If no events are found, respond with a 200 status and an empty array
      return res.status(200).json([]);
    }
    // If events are found, respond with a 200 status and the list of events
    res.status(200).json(events);
  } catch (err) {
    // Handle any potential errors
    console.log(err);
    // Respond with a 500 status and the error message
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /events
 * Route to create a new event.
 * This endpoint requires the user to be authenticated and have the role of 'ORGANIZER', as indicated by the use of
 * the `extractRole` and `validateRequestBodyForEvents` middleware functions.
 *
 * Steps:
 * 1. Apply `extractRole` middleware to ensure the user is authenticated and their role is extracted from the JWT token.
 * 2. Apply `validateRequestBodyForEvents` middleware to validate the request body for necessary event details.
 * 3. Check if the user's role is 'ORGANIZER'.
 *    - If not, respond with a 403 status and an error message indicating that access is denied.
 * 4. If the user has the correct role, proceed to create a new event:
 *    - Extract the event details from the request body.
 *    - Increment the global event count to generate a unique event ID.
 *    - Set the event ID and the parsed event date and time.
 *    - Add the new event to the `events` array.
 *    - Respond with a 200 status and the newly created event.
 * 5. Handle any potential errors by logging the error and responding with a 500 status and the error message.
 *
 * @param {string} path - The endpoint path
 * @param {function} middleware1 - Middleware function to extract user role
 * @param {function} middleware2 - Middleware function to validate event request body
 * @param {function} handler - The route handler function
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
eventController.post(
  "/events",
  extractRole,
  validateRequestBodyForEvents,
  (req, res) => {
    // Check if the user's role is 'ORGANIZER'
    if (req.role != ROLE.ORGANIZER) {
      // If not, respond with a 403 status and an error message indicating that access is denied
      return res.status(403).json({
        error:
          "Access Denied: You do not have the required permissions to access this resource.",
      });
    }

    try {
      // Extract the event details from the request body
      let event = req.body;
      // Increment the global event count to generate a unique event ID
      globalCount++;
      let eventId = globalCount;
      // Set the event ID and the parsed event date and time
      event.id = eventId;
      event.eventDateTime = req.eventDateTime;
      // Add the new event to the `events` array
      events.push(event);
      // Respond with a 200 status and the newly created event
      res.status(200).json(event);
    } catch (err) {
      // Handle any potential errors
      console.log(err);
      // Respond with a 500 status and the error message
      return res.status(500).json({ error: err.message });
    }
  }
);

/**
 * PUT /events/:id
 * Route to update an existing event.
 * This endpoint requires the user to be authenticated and have the role of 'ORGANIZER', as indicated by the use of
 * the `extractRole` and `validateRequestBodyForEvents` middleware functions.
 *
 * Steps:
 * 1. Apply `extractRole` middleware to ensure the user is authenticated and their role is extracted from the JWT token.
 * 2. Apply `validateRequestBodyForEvents` middleware to validate the request body for necessary event details.
 * 3. Check if the user's role is 'ORGANIZER'.
 *    - If not, respond with a 403 status and an error message indicating that access is denied.
 * 4. If the user has the correct role, proceed to update the existing event:
 *    - Extract the event ID from the request parameters.
 *    - Extract the updated event details from the request body.
 *    - Find the index of the event in the `events` array using the event ID.
 *    - If the event is not found, respond with a 404 status and an error message.
 *    - If the event is found, update the event details in the `events` array.
 *    - Respond with a 200 status and the updated event details.
 * 5. Handle any potential errors by logging the error and responding with a 500 status and the error message.
 *
 * @param {string} path - The endpoint path with an event ID as a route parameter
 * @param {function} middleware1 - Middleware function to extract user role
 * @param {function} middleware2 - Middleware function to validate event request body
 * @param {function} handler - The route handler function
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
eventController.put(
  "/events/:id",
  extractRole,
  validateRequestBodyForEvents,
  (req, res) => {
    // Check if the user's role is 'ORGANIZER'
    if (req.role !== ROLE.ORGANIZER) {
      // If not, respond with a 403 status and an error message indicating that access is denied
      return res.status(403).json({
        error:
          "Access Denied: You do not have the required permissions to access this resource.",
      });
    }

    try {
      // Extract the event ID from the request parameters
      let eventId = req.params.id;
      // Extract the updated event details from the request body
      let event = req.body;
      // Find the index of the event in the `events` array using the event ID
      let eventIndex = events.findIndex(
        (event) => event.id === parseInt(eventId)
      );
      // If the event is not found, respond with a 404 status and an error message
      if (eventIndex == -1) {
        return res.status(404).json({
          message: `No event found with event id ${eventId}`,
        });
      }
      // If the event is found, update the event details in the `events` array
      events[eventIndex] = event;
      // Respond with a 200 status and the updated event details
      res.status(200).send(event);
    } catch (err) {
      // Handle any potential errors
      console.log(err);
      // Respond with a 500 status and the error message
      return res.status(500).json({ error: err.message });
    }
  }
);

/**
 * DELETE /events/:id
 * Route to delete an existing event.
 * This endpoint requires the user to be authenticated and have the role of 'ORGANIZER', as indicated by the use of
 * the `extractRole` middleware function.
 *
 * Steps:
 * 1. Apply `extractRole` middleware to ensure the user is authenticated and their role is extracted from the JWT token.
 * 2. Check if the user's role is 'ORGANIZER'.
 *    - If not, respond with a 403 status and an error message indicating that access is denied.
 * 3. If the user has the correct role, proceed to delete the existing event:
 *    - Extract the event ID from the request parameters.
 *    - Find the index of the event in the `events` array using the event ID.
 *    - If the event is not found, respond with a 404 status and an error message.
 *    - If the event is found, remove the event from the `events` array.
 *    - Respond with a 200 status and the deleted event details.
 * 4. Handle any potential errors by logging the error and responding with a 500 status and the error message.
 *
 * @param {string} path - The endpoint path with an event ID as a route parameter
 * @param {function} middleware - Middleware function to extract user role
 * @param {function} handler - The route handler function
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
eventController.delete("/events/:id", extractRole, (req, res) => {
  // Check if the user's role is 'ORGANIZER'
  if (req.role !== ROLE.ORGANIZER) {
    // If not, respond with a 403 status and an error message indicating that access is denied
    return res.status(403).json({
      error:
        "Access Denied: You do not have the required permissions to access this resource.",
    });
  }

  try {
    // Extract the event ID from the request parameters
    let eventId = req.params.id;
    // Find the index of the event in the `events` array using the event ID
    let eventIndex = events.findIndex(
      (event) => event.id === parseInt(eventId)
    );
    // If the event is not found, respond with a 404 status and an error message
    if (eventIndex == -1) {
      return res.status(404).json({
        message: `No event found with event id ${eventId}`,
      });
    }
    // If the event is found, remove the event from the `events` array
    const deletedEvent = events.splice(eventIndex, 1);
    // Respond with a 200 status and the deleted event details
    return res.status(200).send(deletedEvent);
  } catch (err) {
    // Handle any potential errors
    console.log(err);
    // Respond with a 500 status and the error message
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /events/:id/register
 * Route to register an attendee for a specific event.
 * This endpoint requires the user to be authenticated, as indicated by the use of
 * the `extractRole` middleware function. Additionally, the `validateEmailForRegistration`
 * middleware ensures that the provided attendee email is valid and belongs to an existing user.
 *
 * Steps:
 * 1. Apply `extractRole` middleware to ensure the user is authenticated and their role is extracted from the JWT token.
 * 2. Apply `validateEmailForRegistration` middleware to validate the attendee email and check if it belongs to an existing user.
 * 3. In the route handler:
 *    - Extract the event ID from the request parameters.
 *    - Extract the attendee email from the request body.
 *    - Find the index of the event in the `events` array using the event ID.
 *    - If the event is not found, respond with a 500 status and an error message.
 *    - If the event is found, proceed to register the attendee:
 *      - Retrieve the list of participants for the event.
 *      - If the participants list does not exist, initialize it as an empty array.
 *      - Add the attendee email to the participants list.
 *      - Populate the email options for the attendee using `populateEmailForAttendee` function.
 *      - Send a registration confirmation email to the attendee using `sendEmail` function.
 *      - Update the event's participants list in the `events` array.
 *      - Respond with a 200 status and a success message.
 * 4. Handle any potential errors by logging the error and responding with a 500 status and the error message.
 *
 * @param {string} path - The endpoint path with an event ID as a route parameter
 * @param {function} middleware - Middleware functions to extract user role and validate attendee email
 * @param {function} handler - The route handler function
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
eventController.post(
  "/events/:id/register",
  extractRole,
  validateEmailForRegistration,
  (req, res) => {
    try {
      // Extract the event ID from the request parameters
      let eventId = req.params.id;
      // Extract the attendee email from the request body
      let attendeeEmail = req.body.attendee;
      // Find the index of the event in the `events` array using the event ID
      let eventIndex = events.findIndex(
        (event) => event.id === parseInt(eventId)
      );
      // If the event is not found, respond with a 500 status and an error message
      if (eventIndex == -1) {
        return res.status(500).json({ error: err.message });
      }
      // Retrieve the list of participants for the event
      let participants = events[eventIndex].participants;
      // If the participants list does not exist, initialize it as an empty array
      if (!participants) {
        participants = [];
      }
      // Add the attendee email to the participants list
      participants.push(attendeeEmail);
      // Populate the email options for the attendee using `populateEmailForAttendee` function
      let mailOptions = populateEmailForAttendee(
        events[eventIndex],
        attendeeEmail
      );
      // Log the email options (for debugging purposes)
      console.log(mailOptions);
      // Send a registration confirmation email to the attendee using `sendEmail` function
      sendEmail(mailOptions);
      // Update the event's participants list in the `events` array
      events[eventIndex].participants = participants;
      // Respond with a 200 status and a success message
      res
        .status(200)
        .json({ message: "You have been registered for the event." });
    } catch (err) {
      // Handle any potential errors
      console.log(err);
      // Respond with a 500 status and the error message
      return res.status(500).json({ error: err.message });
    }
  }
);

/**
 * Function to populate the email options for an attendee who has registered for an event.
 * This function creates an email message with event details formatted in a readable manner.
 *
 * @param {object} eventDetails - The details of the event, including title and eventDateTime
 * @param {string} attendeeEmailAddress - The email address of the attendee
 * @returns {object} mailOptions - The options object containing email details for sending the email
 *
 * Steps:
 * 1. Define formatting options for the event date and time using `toLocaleString` with `en-US` locale.
 * 2. Format the event date and time based on the specified options.
 * 3. Create the `mailOptions` object containing:
 *    - `from`: The sender's email address, retrieved from environment variables.
 *    - `to`: The attendee's email address.
 *    - `subject`: The subject line of the email, including the event title.
 *    - `text`: A plain text body (placeholder text in this case).
 *    - `html`: An HTML body with the event title and formatted date and time.
 * 4. Return the `mailOptions` object for use in sending the email.
 */
function populateEmailForAttendee(eventDetails, attendeeEmailAddress) {
  // Define formatting options for the event date and time
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };

  // Format the event date and time
  let formattedDateTime = eventDetails.eventDateTime.toLocaleString(
    "en-US",
    options
  );

  // Create the mailOptions object containing email details
  let mailOptions = {
    from: process.env.EMAIL_USER, // sender address
    to: `${attendeeEmailAddress}`, // list of receivers
    subject: `Registration for event : ${eventDetails.title}`, // Subject line
    text: "Hello world?", // plain text body (placeholder)
    html: `<p>You have been successfully registered to attend event <strong>${eventDetails.title}</strong>.</p>
           <p>Please be there on/by ${formattedDateTime}.</p>`, // html body
  };

  // Return the mailOptions object
  return mailOptions;
}

module.exports = eventController;
