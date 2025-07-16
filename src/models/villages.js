const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");
const stateModel = require("./states");
const districtModel = require("./districts");
const talukaModel = require("./talukas");


const villageModel = sequelize.define('village', {
    id: {
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
    talukaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'taluka',
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


        await villageModel.sync({
            alter: true
        }); // This will attempt to create the table if it doesn't exist
        console.log("Village table created (if it didn't exist before)");

        await villageModel.belongsTo(stateModel, { foreignKey: 'stateId' });

        await villageModel.belongsTo(districtModel, { foreignKey: 'districtId' });

        await villageModel.belongsTo(talukaModel, { foreignKey: 'talukaId' });
    } catch (err) {
        console.error("Error creating User table:", err);
    }
}
)();

module.exports = villageModel;