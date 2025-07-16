const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");
const stateModel = require("./states");
const districtModel = require("./districts");


const talukaModel = sequelize.define('taluka', {
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
    districtId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'district',
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

      await talukaModel.sync({
        alter: true
      }); // This will attempt to create the table if it doesn't exist
      console.log("Taluka table created (if it didn't exist before)");

        await talukaModel.belongsTo(stateModel, {foreignKey: 'stateId'});

        await talukaModel.belongsTo(districtModel, {foreignKey: 'districtId'});
    } catch (err) {
      console.error("Error creating User table:", err);
    }
  }
)();

module.exports = talukaModel;