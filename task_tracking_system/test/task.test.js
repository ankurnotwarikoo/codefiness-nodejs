const tap = require("tap");
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const taskController = require("../controller/taskcontroller");
const Task = require("../models/tasks");
const User = require("../models/users");

const app = express();
app.use(express.json());
app.use("/api/task-management", taskController);

// Increase the timeout for all tests
tap.setTimeout(30000);

async function setup() {
  try {
    await mongoose.connect(process.env.TEST_MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

async function teardown() {
  await mongoose.connection.close();
  console.log("Disconnected from MongoDB");
}

async function cleanup() {
  if (mongoose.connection.readyState !== 1) {
    console.log("Not connected to database. Skipping cleanup.");
    return;
  }
  await Task.deleteMany({});
  await User.deleteMany({});
}

// Run setup before any tests
tap.before(setup);

// Cleanup after each test
tap.afterEach(cleanup);

// Use tap.teardown for cleanup after all tests
tap.teardown(async () => {
  await teardown();
});

// Helper function to create a user
async function createUser() {
  return await User.create({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "password123",
  });
}

// Helper function to create a task
async function createTask(userId) {
  return await Task.create({
    title: "Test Task",
    description: "This is a test task",
    status: "open",
    dueDate: new Date(),
    assignedTo: userId,
  });
}

tap.test("GET /api/task-management/tasks", async (t) => {
  await createTask();
  const res = await request(app).get("/api/task-management/tasks");
  t.equal(res.statusCode, 200);
  t.ok(Array.isArray(res.body));
  t.equal(res.body.length, 1);
});

tap.test("GET /api/task-management/tasks/:id", async (t) => {
  const task = await createTask();
  const res = await request(app).get(`/api/task-management/tasks/${task._id}`);
  t.equal(res.statusCode, 200);
  t.equal(res.body.title, "Test Task");
});

tap.test("GET /api/task-management/tasks/assigned-to/:userId", async (t) => {
  const user = await createUser();
  await createTask(user._id);
  const res = await request(app).get(
    `/api/task-management/tasks/assigned-to/${user._id}`
  );
  t.equal(res.statusCode, 200);
  t.ok(Array.isArray(res.body));
  t.equal(res.body.length, 1);
});

tap.test("GET /api/task-management/tasks/assigned-to-me", async (t) => {
  const user = await createUser();
  await createTask(user._id);

  // Create a new app instance for this test to isolate middleware
  const appWithAuth = express();
  appWithAuth.use(express.json());

  // Mock authentication middleware for the specific test route
  appWithAuth.use((req, res, next) => {
    req.user = user; // Set the mock user
    next();
  });

  // Apply the task controller
  appWithAuth.use("/api/task-management", taskController);

  const res = await request(appWithAuth).get(
    "/api/task-management/tasks/assigned-to-me"
  );

  t.equal(res.statusCode, 200);
  t.ok(Array.isArray(res.body));
  t.equal(res.body.length, 1);
});

tap.test("POST /api/task-management/tasks", async (t) => {
  const newTask = {
    title: "New Task",
    description: "This is a new task",
    status: "open",
    dueDate: "01-01-2025",
  };

  const res = await request(app)
    .post("/api/task-management/tasks")
    .send(newTask);
  t.equal(res.statusCode, 201);
  t.equal(res.body.title, "New Task");
});

tap.test("PUT /api/task-management/tasks/:id", async (t) => {
  const task = await createTask();
  const updatedTask = {
    title: "Updated Task",
    description: "This is an updated task",
    status: "closed",
    dueDate: "02-02-2025",
  };

  const res = await request(app)
    .put(`/api/task-management/tasks/${task._id}`)
    .send(updatedTask);
  t.equal(res.statusCode, 200);
  t.equal(res.body.title, "Updated Task");
});

tap.test("DELETE /api/task-management/tasks/:id", async (t) => {
  const task = await createTask();
  const res = await request(app).delete(
    `/api/task-management/tasks/${task._id}`
  );
  t.equal(res.statusCode, 200);

  const deletedTask = await Task.findById(task._id);
  t.notOk(deletedTask);
});

tap.test("PUT /api/task-management/tasks/:id/assign", async (t) => {
  const user = await createUser();
  const task = await createTask();

  const res = await request(app)
    .put(`/api/task-management/tasks/${task._id}/assign`)
    .send({ assignedTo: user._id });
  t.equal(res.statusCode, 200);
  t.equal(res.body.assignedTo, user._id.toString());
});

tap.test("PATCH /api/task-management/tasks/:id/complete", async (t) => {
  const task = await createTask();
  const res = await request(app).patch(
    `/api/task-management/tasks/${task._id}/complete`
  );
  t.equal(res.statusCode, 200);
  t.equal(res.body.status, "closed");
});

tap.test("GET /api/task-management/tasks (with status filter)", async (t) => {
  await createTask();
  await Task.create({
    title: "Closed Task",
    description: "This is a closed task",
    status: "closed",
    dueDate: new Date(),
  });

  const res = await request(app).get("/api/task-management/tasks?status=open");
  t.equal(res.statusCode, 200);
  t.equal(res.body.length, 1);
  t.equal(res.body[0].status, "open");
});

tap.test("GET /api/task-management/tasks/search", async (t) => {
  await createTask();
  await Task.create({
    title: "Another Task",
    description: "This is another task",
    status: "open",
    dueDate: new Date(),
  });

  const res = await request(app).get(
    "/api/task-management/tasks/search?query=Another"
  );
  t.equal(res.statusCode, 200);
  t.equal(res.body.length, 1);
  t.equal(res.body[0].title, "Another Task");
});

tap.test("POST /api/task-management/tasks/:taskId/comments", async (t) => {
  const user = await createUser();
  const task = await createTask();

  // Mock authentication middleware
  app.use((req, res, next) => {
    req.user = user;
    next();
  });

  const comment = { text: "This is a test comment" };

  // Create a new app instance for this test to isolate middleware
  const appWithAuth = express();
  appWithAuth.use(express.json());

  // Mock authentication middleware for the specific test route
  appWithAuth.use((req, res, next) => {
    req.user = user; // Set the mock user
    next();
  });

  // Apply the task controller
  appWithAuth.use("/api/task-management", taskController);

  const res = await request(appWithAuth)
    .post(`/api/task-management/tasks/${task._id}/comments`)
    .send(comment);
  t.equal(res.statusCode, 201);
  t.ok(res.body.comments);
  t.equal(res.body.comments[0].text, "This is a test comment");
  t.equal(res.body.comments[0].user.toString(), user._id.toString());
});
