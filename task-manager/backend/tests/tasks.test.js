const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

test("POST /tasks creates a task", async () => {
  const res = await request(app).post("/tasks").send({
    title: "Test Task",
    description: "Hello",
    status: "Pending",
    dueDate: new Date().toISOString()
  });
  expect(res.statusCode).toBe(201);
  expect(res.body.title).toBe("Test Task");
});

test("GET /tasks returns tasks", async () => {
  const res = await request(app).get("/tasks");
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});
