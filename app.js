/* eslint-disable no-undef */
const express = require("express");
const { Sequelize } = require("sequelize");
const { Todo } = require("./models"); // Ensure this path is correct
const config = require("./config/config.json");
const path = require("path");

const app = express();
const environment = process.env.NODE_ENV || "development";
const dbConfig = config[environment];
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: console.log, // Logs all SQL queries
  }
);

// Test the database connection and sync models
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully.");
    // Sync the models to ensure the database is up to date with the models
    sequelize
      .sync()
      .then(() => console.log("Models synchronized with database"))
      .catch((err) => console.error("Error syncing models:", err));
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

app.get("/", async (request, response) => {
  try {
    // Hardcoded todos for testing frontend
    const allTodos = [
      { title: "Test Todo 1", completed: false },
      { title: "Test Todo 2", completed: true },
    ];
    response.render("index", { allTodos });
  } catch (error) {
    console.log("Error fetching todos:", error);
    response.status(500).json({ error: "Failed to load todos" });
  }
});

app.get("/todos", async (request, response) => {
  try {
    // Fetch todos from the database
    const todos = await Todo.findAll();
    response.json(todos); // Return todos as JSON for API calls
  } catch (error) {
    console.log("Error fetching todos:", error);
    response.status(500).json({ error: "Failed to fetch todos" });
  }
});

app.post("/todos", async (request, response) => {
  try {
    const { title, dueDate } = request.body;
    const todo = await Todo.create({
      title,
      dueDate,
      completed: false, // Set default completed as false
    });
    response.json(todo);
  } catch (error) {
    console.log("Error creating todo:", error);
    response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async (request, response) => {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }
    todo.completed = true;
    await todo.save();
    response.json(todo);
  } catch (error) {
    console.log("Error updating todo:", error);
    response.status(500).json({ error: "Failed to update todo" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const deleted = await Todo.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json(true);
    } else {
      res.status(404).json(false);
    }
  } catch (error) {
    console.log("Error deleting todo:", error);
    res.status(500).json({ message: "Error deleting todo", error });
  }
});

// Start the server
app.listen(3000, () => {
  console.log(`Server is running on port ${3000}`);
});

module.exports = app;
