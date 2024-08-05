const express = require("express");
const taskController = require("express").Router();
const {
  HTTP_STATUS_CODES,
  RESPONSE_MESSAGES,
} = require("../helpers/constants");
const Task = require("../models/tasks");
const TaskStatus = require("../enums/taskstatus");
const User = require("../models/users");
const { sendEmail } = require("../service/emailservice");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

taskController.use(express.json());

/**
 * Middleware to validate task input data in HTTP request body.
 *
 * This function checks various properties of a task object to ensure
 * they meet specific criteria before allowing the request to proceed
 * to the next middleware or route handler. If any validation fails,
 * it sends a 400 Bad Request response with an appropriate error message.
 *
 * Validations performed:
 * - Title: Must not be empty and must have a length between 5 and 100 characters.
 * - Description: Must not be empty and must have a maximum length of 1000 characters.
 * - Status: Must not be empty and must be a valid task status (either "open" or "closed").
 * - Due Date: Must not be empty and must be in the "DD-MM-YYYY" format.
 *
 * @param {Object} req - Express request object, containing task data in req.body.
 * @param {Object} res - Express response object, used to send error responses.
 * @param {Function} next - Express next middleware function, called if validation passes.
 */
function validateTask(req, res, next) {
  const { title, description, status, dueDate, assignedTo } = req.body;

  // Check if title is not empty
  if (isEmpty(title)) {
    return res.status(400).send("Bad Request : Title cannot be blank");
  }

  // Check if title  has length between 5 and 100 characters
  if (title.length < 5 || title.length > 100) {
    return res
      .status(400)
      .send("Bad Request: Title must be between 5 and 100 characters long.");
  }

  // Check if description is not empty
  if (isEmpty(description)) {
    return res.status(400).send("Bad Request : Description cannot be blank");
  }

  // Check if description has a maximum length of 1000 characters
  if (description.length > 1000) {
    return res
      .status(400)
      .send("Bad Request: Description must not exceed 500 characters.");
  }

  if (!Object.values(TaskStatus).includes(status)) {
    return res
      .status(400)
      .send(
        'Bad Request : Invalid Task Status. Status must be either "open" or "closed"'
      );
  }

  if (isEmpty(status)) {
    return res.status(400).send("Bad Request : Status cannot be blank");
  }

  if (isEmpty(dueDate)) {
    return res.status(400).send("Bad Request : Due Date cannot be blank");
  }

  // Check if dueDate is in DD-MM-YYYY format
  if (dueDate) {
    const dateParts = dueDate.split("-");
    if (dateParts.length !== 3) {
      return res.status(400).send("Bad Request : Invalid due date format");
    }

    const [day, month, year] = dateParts.map(Number);
    if (
      isNaN(day) ||
      isNaN(month) ||
      isNaN(year) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return res.status(400).send("Bad Request : Invalid due date");
    }
  }

  next();
}

/**
 * Middleware to verify if a user exists based on the user ID provided in the request body.
 *
 * This function queries the database to check if a user with the specified ID exists.
 * If the user is found, it attaches the user object to the request object for use in subsequent middleware or route handlers.
 * If the user is not found, it sends a 400 Bad Request response with an error message.
 * If there is an error during the database query, it logs the error and sends a 500 Internal Server Error response.
 *
 * @async
 * @param {Object} req - Express request object, containing user ID in req.body.assignedTo.
 * @param {Object} res - Express response object, used to send error responses.
 * @param {Function} next - Express next middleware function, called if the user exists.
 */

async function userExists(req, res, next) {
  const userId = req.body.assignedTo;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).send({ error: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("Error logged: " + err);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.errmsg);
  }
}

/**
 * Middleware to verify if a task exists based on the task ID provided in the request parameters.
 *
 * This function queries the database to check if a task with the specified ID exists.
 * If the task is found, it attaches the task object to the request object for use in subsequent middleware or route handlers.
 * If the task is not found, it sends a 404 Not Found response with an error message.
 * If there is an error during the database query, it logs the error and sends a 500 Internal Server Error response.
 *
 * @async
 * @param {Object} req - Express request object, containing task ID in req.params.id.
 * @param {Object} res - Express response object, used to send error responses.
 * @param {Function} next - Express next middleware function, called if the task exists.
 */

async function taskExists(req, res, next) {
  const taskId = req.params.id;
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).send({ error: "Task not found" });
    }
    req.task = task; // Pass the task to the next middleware
    next();
  } catch (err) {
    console.log("Error logged: " + err);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.errmsg);
  }
}

/**
 * GET endpoint to retrieve tasks, optionally filtered by status.
 *
 * This route handler fetches tasks from the database based on an optional status query parameter.
 * If a status is provided, it validates that the status is one of the allowed values.
 * It constructs a query object to find tasks that match the provided status.
 * If no tasks are found, it sends a 404 Not Found response with an appropriate message.
 * If tasks are found, it returns them in a JSON format with a 200 OK status.
 * If there is an error during the database query, it logs the error and sends a 500 Internal Server Error response.
 *
 * @async
 * @param {Object} req - Express request object, containing query parameters in req.query.
 * @param {Object} res - Express response object, used to send the response or error messages.
 * @returns {Object} - JSON array of tasks if found, otherwise error messages.
 */

taskController.get("/tasks", async (req, res) => {
  try {
    const { status } = req.query;

    // Validate the status
    if (status && !Object.values(TaskStatus).includes(status)) {
      return res.status(400).send("Invalid task status");
    }

    // Build the query object
    const query = {};
    if (status) {
      query.status = status;
    }

    // Find tasks based on the query
    const tasks = await Task.find(query);

    if (tasks.length === 0) {
      return res.status(404).send("No tasks found");
    }

    // Return the filtered tasks
    res.status(200).json(tasks);
  } catch (err) {
    console.log("Error logged: " + err);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.errmsg);
  }
});

/**
 * GET endpoint to search for tasks based on a query string.
 *
 * This route handler performs a search for tasks where either the title or description matches
 * the provided query string. The query parameter 'query' is required and must be provided in
 * the request. If the query parameter is missing, a 400 Bad Request response is returned.
 * The search is case-insensitive due to the `$options: "i"` setting in the regex query.
 * If no tasks match the search criteria, a 404 Not Found response is returned with an appropriate message.
 * If tasks are found, they are returned in a JSON format with a 200 OK status.
 * In case of any errors during the database query, the error is logged and a 500 Internal Server Error
 * response is sent.
 *
 * @async
 * @param {Object} req - Express request object, containing the search query in req.query.query.
 * @param {Object} res - Express response object, used to send the response or error messages.
 * @returns {Object} - JSON array of tasks matching the search criteria if found, otherwise error messages.
 */

taskController.get("/tasks/search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .send("Bad Request: Query parameter 'query' is required.");
  }

  try {
    const tasks = await Task.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    if (tasks.length === 0) {
      return res
        .status(404)
        .send("No tasks found matching the search criteria.");
    }

    return res.status(200).json(tasks);
  } catch (err) {
    console.log("Error logged: " + err);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.errmsg);
  }
});

/**
 * GET endpoint to retrieve tasks assigned to the currently authenticated user.
 *
 * This route handler finds and returns all tasks where the `assignedTo` field matches the
 * ObjectId of the currently authenticated user, which is obtained from the `req.user` object.
 * If no tasks are found for the user, a 404 Not Found response is returned with an appropriate message.
 * If tasks are found, they are returned in a JSON format with a 200 OK status.
 * In case of any errors during the database query, the error is logged and a 500 Internal Server Error
 * response is sent.
 *
 * @async
 * @param {Object} req - Express request object, with `req.user.id` representing the ID of the currently authenticated user.
 * @param {Object} res - Express response object, used to send the response or error messages.
 * @returns {Object} - JSON array of tasks assigned to the user if found, otherwise an error message.
 */

taskController.get("/tasks/assigned-to-me", async (req, res) => {
  try {
    // Convert the userId string to an ObjectId
    console.log(req.user);
    console.log("user id" + req.user.id);
    console.log("assigned to me");
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const tasks = await Task.find({ assignedTo: userObjectId });
    console.log("237");
    if (tasks.length === 0) {
      return res.status(404).send("No tasks found.");
    }
    return res.status(200).json(tasks);
  } catch (err) {
    console.log("Error logged: " + err);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.errmsg);
  }
});

/**
 * GET endpoint to retrieve tasks assigned to a specific user by their user ID.
 *
 * This route handler finds and returns all tasks where the `assignedTo` field matches the
 * user ID provided in the route parameters. It first validates the user ID to ensure it is a
 * valid MongoDB ObjectId. If the ID is invalid, a 400 Bad Request response is returned.
 * If no tasks are found for the specified user, a 404 Not Found response is sent with an
 * appropriate message. If tasks are found, they are returned in a JSON format with a 200 OK status.
 * In case of any errors during the database query, the error is logged and a 500 Internal Server Error
 * response is sent.
 *
 * @async
 * @param {Object} req - Express request object, with `req.params.userId` representing the ID of the user.
 * @param {Object} res - Express response object, used to send the response or error messages.
 * @returns {Object} - JSON array of tasks assigned to the specified user if found, otherwise an error message.
 */

taskController.get("/tasks/assigned-to/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    // Fetch tasks assigned to the user
    const tasks = await Task.find({ assignedTo: userId });

    if (tasks.length === 0) {
      return res.status(404).send("No tasks assigned to this user");
    }

    // Return the tasks
    res.status(200).json(tasks);
  } catch (err) {
    console.log("Error logged: " + err);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.errmsg);
  }
});

/**
 * GET endpoint to retrieve all tasks from the database.
 *
 * This route handler fetches all tasks stored in the database using the Task model.
 * If no tasks are found, it responds with a 404 Not Found status and an appropriate message.
 * If tasks are found, they are returned as a JSON array with a 200 OK status.
 * In case of any errors during the database query, the error is logged and a 500 Internal Server Error
 * response is sent with the error message.
 *
 * @async
 * @param {Object} req - Express request object, which does not require any parameters for this request.
 * @param {Object} res - Express response object, used to send the response or error messages.
 * @returns {Object} - JSON array of all tasks if found, otherwise an error message.
 */

taskController.get("/tasks", async (req, res) => {
  try {
    // Fetch all tasks from the database
    const tasks = await Task.find();

    if (tasks.length === 0) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .send(RESPONSE_MESSAGES.NO_TASKS_FOUND);
    }

    return res.status(HTTP_STATUS_CODES.SUCCESS).json(tasks);
  } catch (err) {
    console.log("Error logged: " + err);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.errmsg);
  }
});

/**
 * GET endpoint to retrieve a specific task by its ID.
 *
 * This route handler fetches a single task from the database using its ID provided in the route parameters.
 * If the task is not found, it responds with a 404 Not Found status and a message indicating that the task
 * with the specified ID was not found.
 * If the task is found, it is returned as a JSON object with a 200 OK status.
 * In case of any errors during the database query, the error is logged and a 500 Internal Server Error
 * response is sent with the error message.
 *
 * @async
 * @param {Object} req - Express request object containing the task ID in req.params.id.
 * @param {Object} res - Express response object, used to send the response or error messages.
 * @returns {Object} - JSON object of the task if found, otherwise an error message.
 */

taskController.get("/tasks/:id", async (req, res) => {
  const idToFetch = req.params.id;

  try {
    // Fetch the task from the database by ID
    const task = await Task.findById(idToFetch);

    if (!task) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .send(RESPONSE_MESSAGES.TASK_NOT_FOUND(idToFetch));
    }

    return res.status(HTTP_STATUS_CODES.SUCCESS).json(task);
  } catch (err) {
    console.log("Error logged: " + err);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.errmsg);
  }
});

/**
 * POST endpoint to create a new task.
 *
 * This route handler is responsible for creating a new task with the provided details from the request body.
 * It first validates the task data using the `validateTask` middleware.
 *
 * - `title`: The title of the task (must be between 5 and 100 characters).
 * - `description`: The description of the task (must not exceed 1000 characters).
 * - `status`: The status of the task (must be a valid status defined in TaskStatus).
 * - `dueDate`: The due date of the task (must be in DD-MM-YYYY format, if provided).
 *
 * The due date string is parsed into a Date object using `parseDate` before being saved.
 * If the task is successfully created, it is saved to the database and returned in the response with a 201 Created status.
 * In case of errors during the task creation or saving process, the error is logged and a 500 Internal Server Error
 * response is sent with the error message.
 *
 * @async
 * @param {Object} req - Express request object containing task details in req.body.
 * @param {Object} res - Express response object, used to send the response or error messages.
 * @returns {Object} - JSON object of the newly created task with a 201 Created status, or an error message.
 */

taskController.post("/tasks", validateTask, async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    // Parse dueDate from DD-MM-YYYY to Date object
    const parsedDueDate = dueDate ? parseDate(dueDate) : null;

    const newTask = new Task({
      title,
      description,
      status,
      dueDate: parsedDueDate,
    });
    const persistedTask = await newTask.save();
    return res.status(HTTP_STATUS_CODES.CREATED).json(persistedTask);
  } catch (err) {
    console.log("Error logged: " + err);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.errmsg);
  }
});

/**
 * PUT endpoint to update an existing task.
 *
 * This route handler updates the details of a task identified by the ID provided in the URL parameters.
 * It first validates the updated task data using the `validateTask` middleware.
 *
 * - `title`: The new title of the task (updated if provided).
 * - `description`: The new description of the task (updated if provided).
 * - `status`: The new status of the task (updated if provided).
 * - `dueDate`: The new due date of the task (updated if provided, parsed from DD-MM-YYYY format to Date object).
 *
 * The task is fetched from the database using the provided task ID.
 * If the task is not found, a 404 Not Found response is sent with an appropriate message.
 * Otherwise, the task fields are updated with the new data, and the task is saved back to the database.
 *
 * If the task has an `assignedTo` field populated, an email notification is prepared and sent to the assigned user
 * using the `populateEmailForAssignee` and `sendEmail` functions.
 *
 * The updated task object is returned in the response with a 200 OK status.
 * In case of errors during the update process, the error is logged and a 500 Internal Server Error response is sent
 * with the error message.
 *
 * @async
 * @param {Object} req - Express request object containing updated task details in req.body and task ID in req.params.
 * @param {Object} res - Express response object, used to send the response or error messages.
 * @returns {Object} - JSON object of the updated task with a 200 OK status, or an error message.
 */

taskController.put("/tasks/:id", validateTask, async (req, res) => {
  try {
    const taskIdToUpdate = req.params.id;
    const updatedTaskData = req.body;
    const parsedDueDate = req.body.dueDate ? parseDate(req.body.dueDate) : null;

    const taskfromDB = await Task.findById(taskIdToUpdate);
    if (!taskfromDB) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .send(RESPONSE_MESSAGES.TASK_NOT_FOUND);
    }

    // Update the task fields with the new data
    taskfromDB.title = updatedTaskData.title || task.title;
    taskfromDB.description = updatedTaskData.description || task.description;
    taskfromDB.status = updatedTaskData.status || task.status;
    taskfromDB.dueDate = parsedDueDate || task.dueDate;

    // Save the updated task back to the database
    const updatedTask = await taskfromDB.save();

    // Check if `assignedTo` is populated
    if (updatedTask.assignedTo) {
      // Populate the email options for the attendee using `populateEmailForAssignee` function
      let mailOptions = populateEmailForAssignee(
        updatedTask,
        updatedTask.assignedTo,
        true
      );
      // Log the email options (for debugging purposes)
      console.log(mailOptions);
      // Send a registration confirmation email to the attendee using `sendEmail` function
      sendEmail(mailOptions);
    }

    // Return the updated task object
    return res.status(HTTP_STATUS_CODES.SUCCESS).json(updatedTask);
  } catch (err) {
    console.log("Error logged: " + err);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.errmsg);
  }
});

/**
 * DELETE endpoint to remove a task by its ID.
 *
 * This route handler deletes a task identified by the ID provided in the URL parameters.
 *
 * - The handler first checks if the task exists in the database using `Task.findById`.
 *   If the task is not found, a 404 Not Found response is sent with a message indicating the task was not found.
 *
 * - If the task exists, it is deleted using `Task.findByIdAndDelete`.
 *
 * - The deleted task is returned in the response with a 200 OK status.
 *
 * In case of errors during the deletion process, the error is logged and a 500 Internal Server Error response is sent
 * with the error message.
 *
 * @async
 * @param {Object} req - Express request object containing the task ID in req.params.
 * @param {Object} res - Express response object, used to send the response or error messages.
 * @returns {Object} - JSON object of the deleted task with a 200 OK status, or an error message.
 */

taskController.delete("/tasks/:id", async (req, res) => {
  const taskId = req.params.id;

  try {
    // First, check if the task exists
    const task = await Task.findById(taskId);

    if (!task) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .send(RESPONSE_MESSAGES.TASK_NOT_FOUND(taskId));
    }

    // If the task exists, proceed to delete it
    const deletedTask = await Task.findByIdAndDelete(taskId);

    // Return the deleted task as a JSON response
    return res.status(HTTP_STATUS_CODES.SUCCESS).json(deletedTask);
  } catch (err) {
    console.log("Error logged: " + err);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.errmsg);
  }
});

/**
 * PUT endpoint to assign a user to a task by updating the task's `assignedTo` field.
 *
 * This route handler updates the `assignedTo` field of a task identified by the ID provided in the URL parameters.
 * It requires the `userExists` and `taskExists` middleware to ensure both the user and task exist before proceeding.
 *
 * - The handler first updates the `assignedTo` field of the task using `Task.findByIdAndUpdate`.
 *   The `{ new: true }` option ensures the updated task document is returned.
 *
 * - If the task is not found, a 404 Not Found response is sent with an error message.
 *
 * - If the task update is successful, an email is populated for the new assignee using `populateEmailForAssignee`.
 *   The email options are logged for debugging, and an email is sent using the `sendEmail` function.
 *
 * - The updated task is returned in the response with a 200 OK status.
 *
 * In case of errors during the update process, the error is logged, and a 500 Internal Server Error response is sent
 * with the error message.
 *
 * @async
 * @param {Object} req - Express request object containing the task ID in req.params and the `assignedTo` user ID in req.body.
 * @param {Object} res - Express response object, used to send the response or error messages.
 * @returns {Object} - JSON object of the updated task with a 200 OK status, or an error message.
 */

taskController.put(
  "/tasks/:id/assign",
  userExists,
  taskExists,
  async (req, res) => {
    const taskId = req.params.id;
    const { assignedTo } = req.body;

    try {
      // Update the task's assignedTo field
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { assignedTo },
        { new: true } // Return the updated document
      );

      if (!updatedTask) {
        return res.status(404).send({ error: "Task not found" });
      }

      // Populate the email options for the attendee using `populateEmailForAssignee` function
      let mailOptions = populateEmailForAssignee(updatedTask, req.user, false);
      // Log the email options (for debugging purposes)
      console.log(mailOptions);
      // Send a registration confirmation email to the attendee using `sendEmail` function
      sendEmail(mailOptions);

      return res.status(200).json(updatedTask);
    } catch (err) {
      console.log("Error logged: " + err);
      return res
        .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .send(err.errmsg);
    }
  }
);

/**
 * PATCH endpoint to mark a task as completed by updating its status to 'closed'.
 *
 * This route handler updates the status of a task identified by the ID provided in the URL parameters to 'closed'.
 * It performs the following actions:
 *
 * - Validates the provided task ID to ensure it is a valid ObjectId.
 * - Finds the task by its ID and updates the `status` field to 'closed'.
 *   The `{ new: true, runValidators: true }` options ensure that the updated document is returned and validators are run.
 * - If the task is not found, a 404 Not Found response is sent with an error message.
 * - If the task update is successful, the updated task is returned in the response with a 200 OK status.
 *
 * In case of errors during the update process, the error is logged, and a 500 Internal Server Error response is sent
 * with the error message.
 *
 * @async
 * @param {Object} req - Express request object containing the task ID in req.params.
 * @param {Object} res - Express response object, used to send the response or error messages.
 * @returns {Object} - JSON object of the updated task with a 200 OK status, or an error message.
 */

taskController.patch("/tasks/:id/complete", async (req, res) => {
  try {
    const taskId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).send("Invalid task ID");
    }

    // Find the task by ID and update its status to 'closed'
    const task = await Task.findByIdAndUpdate(
      taskId,
      { status: "closed" }, // Update the status to 'closed'
      { new: true, runValidators: true } // Return the updated task and run validators
    );

    if (!task) {
      return res.status(404).send("Task not found");
    }

    // Return the updated task
    res.status(200).json(task);
  } catch (err) {
    console.log("Error logged: " + err);
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).send(err.errmsg);
  }
});

/**
 * POST endpoint to add a comment to a specific task.
 *
 * This route handler adds a new comment to the task identified by the `taskId` parameter in the URL. It performs the following actions:
 *
 * - Retrieves the task by its ID from the database.
 * - If the task is not found, returns a 404 Not Found response with an error message.
 * - If the task is found, adds a new comment object to the task's `comments` array. The comment includes the ID of the user making the comment (assumed to be available in `req.user`) and the text of the comment provided in the request body.
 * - Saves the updated task with the new comment to the database.
 * - Returns the updated task with a 201 Created status if the comment is successfully added.
 *
 * In case of any errors during this process, the error message is returned with a 500 Internal Server Error status.
 *
 * @async
 * @param {Object} req - Express request object containing the task ID in `req.params`, the comment text in `req.body`, and the user ID in `req.user`.
 * @param {Object} res - Express response object used to send the response or error messages.
 * @returns {Object} - JSON object of the updated task with a 201 Created status, or an error message.
 */

taskController.post("/tasks/:taskId/comments", async (req, res) => {
  const { taskId } = req.params;
  const { text } = req.body;
  const userId = req.user.id; // Assuming req.user contains the logged-in user's info

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).send("Task not found");
    }

    task.comments.push({
      user: userId,
      text,
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

/**
 * Checks if a given value is considered empty.
 *
 * The function evaluates whether the provided value is empty based on several criteria:
 *
 * - Returns `true` if the value is `null` or `undefined`.
 * - Returns `true` if the value is a string that, when trimmed, is empty.
 * - Returns `true` if the value is an array that has a length of 0.
 * - Returns `true` if the value is an object that is neither `null` nor contains any enumerable properties.
 *
 * Otherwise, the function returns `false`.
 *
 * @param {*} value - The value to be checked.
 * @returns {boolean} - `true` if the value is empty based on the criteria above, otherwise `false`.
 */

function isEmpty(value) {
  return (
    value == null || // Check for null or undefined
    (typeof value === "string" && value.trim() === "") || // Check for empty string
    (Array.isArray(value) && value.length === 0) || // Check for empty array
    (typeof value === "object" &&
      value !== null &&
      Object.keys(value).length === 0) // Check for empty object
  );
}

/**
 * Parses a date string in DD-MM-YYYY format and returns a JavaScript Date object.
 *
 * The function splits the input string by the dash (`-`) character to extract the day, month, and year components.
 * It then creates a new `Date` object using these components, where the month is zero-based (i.e., January is 0).
 *
 * For example, the input "05-08-2024" would be parsed as August 5, 2024.
 *
 * @param {string} dateString - The date string to be parsed, formatted as "DD-MM-YYYY".
 * @returns {Date} - A JavaScript `Date` object representing the parsed date.
 */

function parseDate(dateString) {
  const [day, month, year] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day); // Month is zero-based
}

/**
 * Generates email options for notifying a user about task assignments or updates.
 *
 * This function formats an email with details about a task, either when it is assigned to the user
 * or when it is updated. The email options include the recipient's email, subject line, and both
 * plain text and HTML versions of the email body.
 *
 * - If the task is being updated, the subject line will indicate an update notification.
 * - If the task is newly assigned, the subject line will indicate an assignment notification.
 *
 * The `formattedDateTime` provides a human-readable format for the due date of the task.
 *
 * @param {Object} task - The task object containing details about the task.
 * @param {Object} user - The user object containing details about the recipient, including email and name.
 * @param {boolean} isUpdate - A flag indicating whether the task is being updated (`true`) or newly assigned (`false`).
 * @returns {Object} - An object containing email details, including `from`, `to`, `subject`, `text`, and `html` fields.
 */

function populateEmailForAssignee(task, user, isUpdate) {
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
  let formattedDateTime = task.dueDate.toLocaleString("en-US", options);

  // Create the mailOptions object containing email details
  let mailOptions = {
    from: process.env.EMAIL_USER, // sender address
    to: user.email, // receiver's email address
    subject: isUpdate
      ? `Task Update Notification`
      : `Task Assignment Notification`, // Subject line
    text: isUpdate
      ? `Hello ${user.firstName} ${user.lastName},
  
  Your task titled "${task.title}" has been updated. Please review the latest changes to ensure you are up-to-date.`
      : `Hello ${user.firstName} ${user.lastName},
  
  You have been assigned a new task titled "${task.title}". Please complete it by ${formattedDateTime}.`, // plain text body
    html: isUpdate
      ? `<p>Hello ${user.firstName} ${user.lastName},</p>
         <p>Your task titled <strong>${task.title}</strong> has been updated.</p>
         <p>Please review the latest changes to ensure you are up-to-date.</p>`
      : `<p>Hello ${user.firstName} ${user.lastName},</p>
         <p>You have been assigned a new task.</p>
         <p>Task Title: <strong>${task.title}</strong>.</p>
         <p>Please complete it by ${formattedDateTime}.</p>`, // html body
  };

  // Return the mailOptions object
  return mailOptions;
}

module.exports = taskController;
