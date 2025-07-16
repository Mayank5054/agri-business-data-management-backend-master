const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const cropModel = sequelize.define('crop', {
    id : {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    organisationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'organisation',
            key: 'id'
        }
    },
    category: {
        type: Sequelize.STRING,
        allowNull: true
    },
    medias: {
        type: DataTypes.ARRAY(Sequelize.STRING),
        allowNull: true
    },
    isVisible: {
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
      await cropModel.sync(); // This will attempt to create the table if it doesn't exist
      console.log("Crop table created (if it didn't exist before)");
    } catch (err) {
      console.error("Error creating Crop table:", err);
    }
  }
)();

module.exports = cropModel;