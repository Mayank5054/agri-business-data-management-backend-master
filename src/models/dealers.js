const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const stateModel = require("./states");
const districtModel = require("./districts");
const talukaModel = require("./talukas");
const villageModel = require("./villages");


const dealerModel = sequelize.define('dealer', {
    id: {
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
        allowNull: false,
        unique: true
    },
    stateId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'state',
            key: 'id'
        }
    },
    districtId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'district',
            key: 'id'
        }
    },
    talukaId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'taluka',
            key: 'id'
        }
    },
    villageId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'village',
            key: 'id'
        }
    },
    organisationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'organisation',
            key: 'id'
        }
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id'
        }
    },
    refBy: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    productUses: {
        type: DataTypes.ARRAY(Sequelize.INTEGER),
        allowNull: true,
    },
    cropUses: {
        type: DataTypes.ARRAY(Sequelize.INTEGER),
        allowNull: true,
    },
    potentialScope: {
        type: Sequelize.STRING,
        allowNull: false
    },
    behaviour: {
        type: Sequelize.STRING,
        allowNull: false
    },
    address: {
        type: Sequelize.STRING,
        allowNull: false
    },
    hexCode: {
        type: Sequelize.STRING,
        allowNull: false
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
        await dealerModel.sync({alter: true}); // This will attempt to create the table if it doesn't exist

        await dealerModel.belongsTo(stateModel, { foreignKey: 'stateId' });

        await dealerModel.belongsTo(districtModel, { foreignKey: 'districtId' });

        await dealerModel.belongsTo(talukaModel, { foreignKey: 'talukaId' });

        await dealerModel.belongsTo(villageModel, { foreignKey: 'villageId' });

        console.log("Dealer table created (if it didn't exist before)");
    } catch (err) {
        console.error("Error creating Dealer table:", err);
    }
}
)();

module.exports = dealerModel;