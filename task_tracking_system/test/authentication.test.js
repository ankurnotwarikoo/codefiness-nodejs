const tap = require("tap");
const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticationController = require("../controller/authenticationcontroller");
const User = require("../models/users");

const app = express();
app.use(express.json());
app.use("/auth", authenticationController);

async function setup() {
  try {
    await mongoose.connect(process.env.TEST_MONGO_URI);
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

tap.test("Authentication Controller", async (t) => {
  await t.test("POST /auth/register", async (t) => {
    await t.test("should register a new user successfully", async (t) => {
      const res = await request(app).post("/auth/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
      });

      t.equal(res.statusCode, 201);
      t.same(res.body, { body: "User Registered Successfully", status: 201 });

      const user = await User.findOne({ email: "john@example.com" });
      t.ok(user);
      t.equal(user.firstName, "John");
      t.equal(user.lastName, "Doe");
    });

    // Add other registration tests here...
  });

  await t.test("POST /auth/login", async (t) => {
    await t.beforeEach(async () => {
      await User.create({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: bcrypt.hashSync("password123", 8),
      });
    });

    await t.test(
      "should login successfully with correct credentials",
      async (t) => {
        const res = await request(app).post("/auth/login").send({
          email: "john@example.com",
          password: "password123",
        });

        t.equal(res.statusCode, 200);
        t.equal(res.body.email, "john@example.com");
        t.equal(res.body.message, "Login Successful.");
        t.ok(res.body.token);

        const decodedToken = jwt.verify(
          res.body.token,
          process.env.JWT_SIGNING_SECRET
        );
        t.equal(decodedToken.email, "john@example.com");
      }
    );

    // Add other login tests here...
  });
});
