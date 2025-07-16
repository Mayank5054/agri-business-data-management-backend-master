const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");
const dealerModel = require("../models/dealers");
const farmerModel = require("../models/farmers");
const productModel = require("../models/products");
const userModel = require("../models/users");
const stateModel = require("../models/states");


const totalStats = async (req, res) => {
    try {

        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                status: false,
                message: "Access denied",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        let promises = [];

        promises.push(dealerModel.count({
            organisationId: req.user.organisationId,
            isDeleted: false
        }));
        promises.push(farmerModel.count({
            organisationId: req.user.organisationId,
            isDeleted: false
        }));
        promises.push(
            userModel.count({
                organisationId: req.user.organisationId,
                isDeleted: false
            })
        )
        promises.push(
            productModel.count({
                organisationId: req.user.organisationId,
                isDeleted: false
            })
        )

        let [dealers, farmers, users, products] = await Promise.all(promises);

        return res.status(200).json({
            status: true,
            message: "Data fetched successfully",
            statusCode: 200,
            data: {
                dealers,
                farmers,
                users,
                products
            },
            error: null
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            statusCode: 500,
            data: null,
            error: err
        });
    }
}

const dealerAndFarmerGraph = async (req, res) => {
    try {

        if (!req.query.startDate || !req.query.endDate) {
            return res.status(400).json({
                status: false,
                message: "startDate and endDate are required",
                statusCode: 400,
                data: null,
                error: null
            });
        }

        let startDate = req.query.startDate;
        let endDate = req.query.endDate;

        let query = {
            organisationId: req.user.organisationId,
            isDeleted: false,
            createdAt: {
                [Sequelize.Op.gte]: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                [Sequelize.Op.lte]: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            }
        }

        if (req.user.userType !== 'admin') {
            query["userId"] = req.user.id;
        }

        let promises = [];

        promises.push(
            dealerModel.findAll({
                attributes: [
                    // month wise count of dealers
                    [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: query,
                group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            })
        );

        promises.push(
            farmerModel.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: query,
                group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            })
        );

        let [dealers, farmers] = await Promise.all(promises);

        return res.status(200).json({
            status: true,
            message: "Data fetched successfully",
            statusCode: 200,
            data: {
                dealers,
                farmers
            },
            error: null
        });

    }catch(err) {
        console.log(err);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            statusCode: 500,
            data: null,
            error: err
        });
    }
}

const dealerAndFarmerFromStates = async (req, res) => {
    try{

        let query = {
            organisationId: req.user.organisationId,
            isDeleted: false
        }

        let promises = []

        promises.push(
            dealerModel.findAll({
                attributes: [
                    'stateId',
                    [sequelize.fn('COUNT', sequelize.col('dealer.id')), 'count'] // Specify the table for the 'id' column
                ],
                where: query,
                group: ['dealer.stateId', 'state.id', 'state.name'],
                include: [
                    {
                        model: stateModel,
                        attributes: ['id', 'name']
                    }
                ]
            })
        )

        promises.push(
            farmerModel.findAll({
                attributes: [
                    'stateId',
                    [sequelize.fn('COUNT', sequelize.col('farmer.id')), 'count'] // Specify the table for the 'id' column
                ],
                where: query,
                group: ['farmer.stateId', 'state.id', 'state.name'],
                include: [
                    {
                        model: stateModel,
                        attributes: ['id', 'name']
                    }
                ]
            })
        )

        let [dealers, farmers] = await Promise.all(promises);

        return res.status(200).json({
            status: true,
            message: "Data fetched successfully",
            statusCode: 200,
            data: {
                dealers,
                farmers
            },
            error: null
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            statusCode: 500,
            data: null,
            error: err
        });
    }
}

module.exports = {
    totalStats,
    dealerAndFarmerGraph,
    dealerAndFarmerFromStates
}