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

usercontroller.get("/users", (req, res) => {
  const users = authcontroller.users;
  if (users.length == 0) {
    return res.status(200).json([]);
  }
  const usersWithoutPasswords = users.map((user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  res.status(200).json(usersWithoutPasswords);
});

module.exports = usercontroller;
