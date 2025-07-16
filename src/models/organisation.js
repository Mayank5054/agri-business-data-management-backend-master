const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");


const organisationModel = sequelize.define('organisation', {
    id : {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    address: {
        type: Sequelize.STRING,
        allowNull: false
    },
    contactPersonName: {
        type: Sequelize.STRING,
        allowNull: true
    },
    logo: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: ""
    },
    gstNumber: {
        type: Sequelize.STRING,
        allowNull: true
    },
    website: {
        type: Sequelize.STRING,
        allowNull: true
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
      await organisationModel.sync(); // This will attempt to create the table if it doesn't exist
      console.log("Organisation table created (if it didn't exist before)");
    } catch (err) {
      console.error("Error creating Organisation table:", err);
    }
  }
)();

module.exports = organisationModel;