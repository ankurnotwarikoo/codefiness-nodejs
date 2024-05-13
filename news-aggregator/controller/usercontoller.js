const express = require("express");
const usercontroller = express.Router();
const authcontroller = require("./authenticationcontroller");
const { NOT_FOUND_ERROR } = require("../utilities/constants");
require("dotenv").config();

usercontroller.use(express.json());

function checkUserIdExists(req, res, next) {
  const { userId } = req.params;
  const users = authcontroller.users;
  const userExists = users.find((user) => user.id === parseInt(userId));
  if (!userExists) {
    return res.status(404).json({ error: NOT_FOUND_ERROR });
  }

  next();
}

usercontroller.put("/:userId/preferences", checkUserIdExists, (req, res) => {
  const users = authcontroller.users;
  const userIndex = users.findIndex(
    (user) => user.id === parseInt(req.params.userId)
  );
  let preferences_passed = req.body.preferences;
  users[userIndex].preferences = preferences_passed;
  return res.status(200).send(users[userIndex].preferences);
});

usercontroller.get("/:userId/preferences", checkUserIdExists, (req, res) => {
  const users = authcontroller.users;
  const userIndex = users.findIndex(
    (user) => user.id === parseInt(req.params.userId)
  );
  return res.status(200).json({ preferences: users[userIndex].preferences });
});

module.exports = usercontroller;
