const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");


const goatModel = sequelize.define('goat', {
    id : {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

(async () => {
    try {
      await goatModel.sync(); // This will attempt to create the table if it doesn't exist
      console.log("Goat table created (if it didn't exist before)");
    } catch (err) {
      console.error("Error creating Goat table:", err);
    }
  })();

module.exports = goatModel;