const express = require("express");
const validator = require("./helpers/validator.js");
const routes = require("express").Router();
const taskcontroller = require("./controller/taskcontroller");
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(routes);

routes.use("/task-management", taskcontroller);

app.listen(port, (err) => {
  if (err) {
    return console.log("Something bad happened", err);
  }
  console.log(`Server is listening on ${port}`);
});

module.exports = app;
