// messages.js
const HTTP_STATUS_CODES = {
  NOT_FOUND: 404,
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
};

const RESPONSE_MESSAGES = {
  NO_TASKS_FOUND: "No tasks found",
  TASK_NOT_FOUND: (id) => `The task with id ${id} not found !`,
  RESOURCE_NOT_FOUND:
    "The requested resource with the specified ID was not found.",
  VALIDATION_FAILED_CREATE:
    "Validation failed: Missing or invalid properties in the JSON object to persist.",
  VALIDATION_FAILED_UPDATE:
    "Validation failed: Missing or invalid properties in the JSON object to update.",
  INTERNAL_SERVER_ERROR: "Internal server error",
  UNAUTHORIZED_ERROR: "Unauthorized: No token provided",
  INVALID_TOKEN_ERROR: "Unauthorized: Invalid token",
  UNAUTHORIZED_STATUS: 401,
  FORBIDDEN_STATUS: 403,
  SERVER_LISTENING_MESSAGE: "Server is listening on",
  SERVER_ERROR_MESSAGE: "Something bad happened",
  EMAIL_REGEX: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
  ERROR_EMAIL_FORMAT:
    "The email address provided is invalid. Please provide a valid email address.",
  ERROR_EMAIL_EXISTS:
    "This email address is already in use. Please choose another one.",
  ERROR_PASSWORD_MANDATORY: "Password is required.",
  ERROR_TITLE_MANDATORY: "The event title is required.",
  ERROR_TITLE_TOO_LONG:
    "The event title must be less than 100 characters long.",
  ERROR_TITLE_TOO_SHORT: "The event title must be at least 3 characters long.",
  ERROR_ROLE_MANDATORY: "Role is required.",
  ERROR_DATE_MANDATORY: "The event date is required.",
  ERROR_TIME_MANDATORY: "The event time is required.",
  ERROR_EMAIL_NOT_FOUND: "Email address not found.",
  ERROR_INVALID_PASSWORD: "Invalid password.",
  ERROR_INVALID_ROLE: "Invalid role.",
  ERROR_INVALID_EMAIL_ORGANIZER: "Invalid email address for organizer.",
  LOGIN_SUCCESSFUL: "Login Successful.",
  NOT_FOUND_ERROR: "User not found.",
  UNAUTHORIZED: "UNAUTHORIZED",
  ERROR_USER_WITH_EMAIL_NOT_FOUND: "User not found with email address: ",
  DATE_REGEX: /^\d{2}-\d{2}-\d{4}$/,
  ERROR_DATE_FORMAT: "The event date must be in the format DD-MM-YYYY.",
  LOGIN_SUCCESSFUL: "Login Successful.",
};

module.exports = { HTTP_STATUS_CODES, RESPONSE_MESSAGES };
