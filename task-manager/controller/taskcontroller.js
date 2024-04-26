const express = require("express");
const taskController = require("express").Router();
const { validateObjectTypeAndProperties } = require("../helpers/validator");
const { HTTP_STATUS_CODES, RESPONSE_MESSAGES } = require("../helpers/constants");

taskController.use(express.json());

const tasks = [];

taskController.get("/v1/tasks", (req, res) => {
  if (tasks.length === 0) {
    return res
      .status(HTTP_STATUS_CODES.NOT_FOUND)
      .send(RESPONSE_MESSAGES.NO_TASKS_FOUND);
  } else {
    return res.status(HTTP_STATUS_CODES.SUCCESS).send(tasks);
  }
});

taskController.get("/v1/tasks/:id", (req, res) => {
  const idToFetch = req.params.id;
  const task = tasks.find((task) => task.id === parseInt(idToFetch));
  if (!task) {
    return res
      .status(HTTP_STATUS_CODES.NOT_FOUND)
      .send(RESPONSE_MESSAGES.TASK_NOT_FOUND(idToFetch));
  } else {
    return res.status(HTTP_STATUS_CODES.SUCCESS).send(task);
  }
});

taskController.post("/v1/tasks", (req, res) => {
  try {
    const task = req.body;
    if (validateObjectTypeAndProperties(task, req.method)) {
      task.id =
        tasks.length === 0 ? 1 : getLargestId(tasks.map((task) => task.id));
      tasks.push(task);
      return res.status(HTTP_STATUS_CODES.CREATED).send(task);
    } else {
      return res
        .status(HTTP_STATUS_CODES.BAD_REQUEST)
        .send(RESPONSE_MESSAGES.VALIDATION_FAILED_CREATE);
    }
  } catch (err) {
    console.log("Error logged " + err);
    return res
      .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

taskController.put("/v1/tasks/:id", (req, res) => {
  try {
    const taskId = req.params.id;
    const task = req.body;
    const taskToUpdateIndex = tasks.findIndex(
      (task) => task.id === parseInt(taskId)
    );
    if (taskToUpdateIndex === -1) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .send(RESPONSE_MESSAGES.RESOURCE_NOT_FOUND);
    } else if (validateObjectTypeAndProperties(task, req.method)) {
      task.id = parseInt(taskId);
      tasks[taskToUpdateIndex] = task;
      return res.status(HTTP_STATUS_CODES.SUCCESS).send(task);
    } else {
      return res
        .status(HTTP_STATUS_CODES.BAD_REQUEST)
        .send(RESPONSE_MESSAGES.VALIDATION_FAILED_UPDATE);
    }
  } catch (err) {
    console.log("Error logged " + err);
    return res
      .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

taskController.delete("/v1/tasks/:id", (req, res) => {
  try {
    const taskId = req.params.id;
    const taskIndexToDelete = tasks.findIndex(
      (task) => task.id === parseInt(taskId)
    );
    if (taskIndexToDelete === -1) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND)
        .send(RESPONSE_MESSAGES.RESOURCE_NOT_FOUND);
    } else {
      const deletedTask = tasks.splice(taskIndexToDelete, 1);
      return res.status(HTTP_STATUS_CODES.SUCCESS).send(deletedTask);
    }
  } catch (err) {
    console.log("Error logged " + err);
    return res
      .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .send(RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR);
  }
});

function getLargestId(taskIds) {
  taskIds.sort((a, b) => b - a);
  return taskIds[0] + 1;
}

module.exports = taskController;
