/* eslint-disable no-undef */
const request = require("supertest");
const db = require("../models/index");
const app = require("../app");

let server, agent;
let todoId; // To store the ID of a created todo

describe("Todo Test Suite", () => {
  beforeAll(async () => {
    // Sync the database and force drop existing tables
    await db.sequelize.sync({ force: true });

    // Start the server
    server = app.listen(3000, () => {
      console.log("Test server running on port 3000");
    });

    // Create a Supertest agent
    agent = request.agent(server);
  });

  afterAll(async () => {
    // Close the server and disconnect from the database
    await server.close();
    await db.sequelize.close();
  });

  test("POST /todos - create a new todo", async () => {
    const response = await agent.post("/todos").send({
      title: "buy milk",  // Correct field name as per model definition
      dueDate: "2024-12-31",  // Correct date format as per model definition
      completed: false,
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );

    const parsedResponse = response.body;
    expect(parsedResponse.id).toBeDefined();
    expect(parsedResponse.title).toBe("buy milk"); // Change from 'name' to 'title'
    expect(parsedResponse.completed).toBe(false);

    todoId = parsedResponse.id; // Store the created todo ID for later use
  });

  test("GET /todos - retrieve all todos", async () => {
    const response = await agent.get("/todos");

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );

    const parsedResponse = response.body;
    expect(Array.isArray(parsedResponse)).toBe(true); // The response should be an array
    expect(parsedResponse.length).toBeGreaterThan(0); // There should be at least one todo
  });

  test("DELETE /todos/:id - delete a todo by ID", async () => {
    const response = await agent.delete(`/todos/${todoId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(true); // Response should be true if deleted

    // Verify the Todo was deleted from the database
    const deletedTodo = await db.Todo.findByPk(todoId);
    expect(deletedTodo).toBeNull(); // The deleted todo should not exist in the database
  });

  test("DELETE /todos/:id - attempt to delete a non-existent todo", async () => {
    const response = await agent.delete("/todos/9999"); // Non-existent ID

    expect(response.statusCode).toBe(404);
    expect(response.body).toBe(false); // Response should be false if the todo doesn't exist
  });
});
