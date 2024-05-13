const tap = require("tap");
const supertest = require("supertest");
const app = require("../app");
const server = supertest(app);

const mockUser = {
  name: "Clark Kent",
  email: "clark@superman.com",
  password: "Krypt()n8",
  preferences: ["entertainment"],
};

let token = "";

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

// Preferences tests

tap.test("GET /api/users/1/preferences", async (t) => {
  const response = await server
    .get("/api/users/1/preferences")
    .set("authorization", `Bearer ${token}`);
  console.log("**********");
  console.log(response);
  t.equal(response.status, 200);
  t.hasOwnProp(response.body, "preferences");
  t.same(response.body.preferences, mockUser.preferences);
  t.end();
});

tap.test("GET /api/users/1/preferences without token", async (t) => {
  const response = await server.get("/api/users/1/preferences");
  t.equal(response.status, 401);
  t.end();
});

tap.test("PUT /api/users/1/preferences", async (t) => {
  const response = await server
    .put("/api/users/1/preferences")
    .set("authorization", `Bearer ${token}`)
    .send({
      preferences: ["entertainment", "sports"],
    });
  t.equal(response.status, 200);
});

tap.test("Check /PUT /api/users/1/preferences", async (t) => {
  const response = await server
    .get("/api/users/1/preferences")
    .set("authorization", `Bearer ${token}`);
  t.equal(response.status, 200);
  t.same(response.body.preferences, ["entertainment", "sports"]);
  t.end();
});

// News tests

tap.test("GET /api/users/1/news", async (t) => {
  const response = await server
    .get("/api/users/1/news")
    .set("authorization", `Bearer ${token}`);
  t.equal(response.status, 200);
  t.hasOwnProp(response.body, "news");
  t.end();
});

tap.test("GET /api/users/1/news without token", async (t) => {
  const response = await server.get("/api/users/1/news");
  t.equal(response.status, 401);
  t.end();
});

tap.teardown(() => {
  process.exit(0);
});
