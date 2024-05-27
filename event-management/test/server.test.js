const tap = require("tap");
const supertest = require("supertest");
const app = require("../app");
const server = supertest(app);

const mockUser = {
  name: "Clark Kent",
  email: "clark@superman.com",
  password: "Krypt()n8",
  role: "organizer",
};

let token = "";
let eventId = "";

// Auth tests

tap.test("POST /auth/register", async (t) => {
  const response = await server.post("/api/auth/register").send(mockUser);
  t.equal(response.status, 200);
  t.end();
});

tap.test("POST /auth/register with missing email", async (t) => {
  const response = await server.post("/api/auth/register").send({
    name: mockUser.name,
    password: mockUser.password,
  });
  t.equal(response.status, 400);
  t.end();
});

tap.test("POST /auth/login", async (t) => {
  const response = await server.post("/api/auth/login").send({
    email: mockUser.email,
    password: mockUser.password,
  });
  t.equal(response.status, 200);
  t.hasOwnProp(response.body, "token");
  token = response.body.token;
  t.end();
});

tap.test("POST /auth/login with wrong password", async (t) => {
  const response = await server.post("/api/auth/login").send({
    email: mockUser.email,
    password: "wrongpassword",
  });
  t.equal(response.status, 401);
  t.end();
});

// Event tests

const mockEvent = {
  title: "Metropolis Charity Gala",
  date: "12-12-2024",
  time: "18:00",
  organizer: mockUser.email,
};

tap.test("POST /api/events - Valid Event Creation", async (t) => {
  console.log(`Token is ${token}`);
  const response = await server
    .post("/api/events")
    .set("authorization", `Bearer ${token}`)
    .send(mockEvent);
  t.equal(response.status, 200);
  t.hasOwnProp(response.body, "id");
  eventId = response.body.id;
  t.end();
});

tap.test("POST /api/events - Missing Token", async (t) => {
  const response = await server.post("/api/events").send(mockEvent);
  t.equal(response.status, 401);
  t.equal(response.body.error, "Unauthorized: No token provided");
  t.end();
});

tap.test("GET /api/events - Fetch All Events", async (t) => {
  const response = await server
    .get("/api/events")
    .set("authorization", `Bearer ${token}`);
  t.equal(response.status, 200);
  t.ok(Array.isArray(response.body));
  t.end();
});

tap.test("GET /api/events/:id - Fetch Single Event", async (t) => {
  const response = await server
    .get(`/api/events/${eventId}`)
    .set("authorization", `Bearer ${token}`);
  t.equal(response.status, 200);
  t.equal(response.body.title, mockEvent.title);
  t.end();
});

// Test registering an attendee for the event
tap.test("POST /api/events/:id/register - Register Attendee", async (t) => {
  // Define a mock attendee for testing
  const mockAttendee = {
    attendee: "clark@superman.com",
  };
  const response = await server
    .post(`/api/events/${eventId}/register`)
    .set("authorization", `Bearer ${token}`)
    .send(mockAttendee);
  t.equal(response.status, 200);
  t.equal(response.body.message, "You have been registered for the event.");
  t.end();
});

tap.test("DELETE /api/events/:id - Delete Event", async (t) => {
  const response = await server
    .delete(`/api/events/${eventId}`)
    .set("authorization", `Bearer ${token}`);
  t.equal(response.status, 200);
  t.end();
});

tap.teardown(() => {
  process.exit(0);
});
