const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");
const stateModel = require("./states");


const districtModel = sequelize.define('district', {
    id : {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    stateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'state',
            key: 'id'
        }
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


      await districtModel.sync({
        alter: true
      }); // This will attempt to create the table if it doesn't exist
      console.log("District table created (if it didn't exist before)");

      await districtModel.belongsTo(stateModel, {foreignKey: 'stateId'});

    } catch (err) {
      console.error("Error creating User table:", err);
    }
  }
)();

module.exports = districtModel;