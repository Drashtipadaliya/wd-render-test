 /* eslint-disable no-undef */
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      // Define associations here if needed, e.g. if you have other models to associate with
    }

    // Static method to add a new Todo
    static addTodo({ title, dueDate }) {
      return this.create({ title, dueDate, completed: false });
    }
    static getTodos(){
      return this.findAll();
    }
    // Instance method to mark Todo as completed
    markAsCompleted() {
      return this.update({ completed: true });
    }
  }

  // Initialize Todo model with the required fields
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false, // Ensure title is not null
      },
      dueDate: {
        type: DataTypes.DATEONLY, // Using DATEONLY to store only the date without time
        allowNull: false, // Ensure dueDate is not null
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default completed status is false
      },
    },
    {
      sequelize,
      modelName: "Todo", // Model name should match your table name
    }
  );

  return Todo;
};
