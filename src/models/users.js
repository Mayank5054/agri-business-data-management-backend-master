const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const userModel = sequelize.define('user', {
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
        allowNull: false
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    assignedStates: {
        type: DataTypes.ARRAY(Sequelize.INTEGER),
        allowNull: true,
    },
    assignedDistricts: {
        type: DataTypes.ARRAY(Sequelize.INTEGER),
        allowNull: true
    },
    assignedTalukas: {
        type: DataTypes.ARRAY(Sequelize.INTEGER),
        allowNull: true
    },
    assignedVillages: {
        type: DataTypes.ARRAY(Sequelize.INTEGER),
        allowNull: true
    },
    organisationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'organisation',
            key: 'id'
        }
    },
    userType: {
        type: Sequelize.ENUM,
        values: ['admin', 'user'],
        defaultValue: 'user'
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
      await userModel.sync(); // This will attempt to create the table if it doesn't exist
      console.log("User table created (if it didn't exist before)");
    } catch (err) {
      console.error("Error creating User table:", err);
    }
  }
)();

module.exports = userModel;