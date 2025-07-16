const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");


const stateModel = sequelize.define('state', {
    id : {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
});

(async () => {
    try {
      await stateModel.sync({
        alter: true
      }); // This will attempt to create the table if it doesn't exist
      console.log("State table created (if it didn't exist before)");
    } catch (err) {
      console.error("Error creating User table:", err);
    }
  }
)();

module.exports = stateModel;