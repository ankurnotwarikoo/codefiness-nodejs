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
  TASK_NOT_FOUND: (id) => `The task with id ${id} not found!`,
  RESOURCE_NOT_FOUND:
    "The requested resource with the specified ID was not found.",
  VALIDATION_FAILED_CREATE:
    "Validation failed: Missing or invalid properties in the JSON object to persist.",
  VALIDATION_FAILED_UPDATE:
    "Validation failed: Missing or invalid properties in the JSON object to update.",
  INTERNAL_SERVER_ERROR: "Internal server error",
};

module.exports = { HTTP_STATUS_CODES, RESPONSE_MESSAGES };
