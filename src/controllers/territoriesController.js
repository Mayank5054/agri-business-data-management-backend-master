
const stateModel = require('../models/states');
const districtModel = require('../models/districts');
const talukaModel = require('../models/talukas');
const villageModel = require('../models/villages');
const { Op } = require('sequelize');


const getAllStates = async (req, res) => {
    try{

        let states = await stateModel.findAll({});

        return res.status(200).json({
            status: true,
            message: "States retrieved successfully",
            statusCode: 200,
            data: states,
            error: null
        });

    }catch(err) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            statusCode: 500,
            data: null,
            error: err
        });
    }
}

const getAllDistricts = async (req, res) => {
    try{
            let {stateIds} = req.query

            if(!stateIds){
                return res.status(400).json({
                    status: false,
                    message: "StateIds required",
                    statusCode: 400,
                    data: null,
                    error: null
                });
            }

            let stateId = stateIds.split(',') || []

            let districts = await districtModel.findAll({
                where: {
                    stateId: {
                        [Op.in]: stateId
                    }
                }
            });
    
            return res.status(200).json({
                status: true,
                message: "Districts retrieved successfully",
                statusCode: 200,
                data: districts,
                error: null
            });
    }catch(err) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            statusCode: 500,
            data: null,
            error: err
        });
    }
}

const getAllTalukas = async (req, res) => {
    try{

        let {stateIds, districtIds} = req.query

        if(!stateIds && !districtIds){
            return res.status(400).json({
                status: false,
                message: "StateId or DistrictId required",
                statusCode: 400,
                data: null,
                error: null
            });
        }

        let query = {}
        if(stateIds){
            stateIds = stateIds.split(',') || []
            query.stateId = {
                [Op.in]: stateIds
            }
        }
        if(districtIds){
            districtIds = districtIds.split(',') || []
            query.districtId = {
                [Op.in]: districtIds
            }
        }

        let talukas = await talukaModel.findAll({
            where: query
        });

        return res.status(200).json({
            status: true,
            message: "Talukas retrieved successfully",
            statusCode: 200,
            data: talukas,
            error: null
        });

    }catch(err) {
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            statusCode: 500,
            data: null,
            error: err
        });
    }
}

const getAllVillages = async (req, res) => {
    try{

        let {stateIds, districtIds, talukaIds} = req.query

        if(!stateIds && !districtIds && !talukaIds){
            return res.status(400).json({
                status: false,
                message: "StateId or DistrictId or TalukaId required",
                statusCode: 400,
                data: null,
                error: null
            });
        }

        let query = {}

        if(stateIds){
            stateIds = stateIds.split(',') || []
            query.stateId = {
                [Op.in]: stateIds
            }
        }
        if(districtIds){
            districtIds = districtIds.split(',') || []
            query.districtId = {
                [Op.in]: districtIds
            }
        }
        if(talukaIds){
            talukaIds = talukaIds.split(',') || []
            query.talukaId = {
                [Op.in]: talukaIds
            }
        }

        let villages = await villageModel.findAll({
            where: query
        });

        return res.status(200).json({
            status: true,
            message: "Villages retrieved successfully",
            statusCode: 200,
            data: villages,
            error: null
        });

    }catch(err) {
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
    getAllStates,
    getAllDistricts,
    getAllTalukas,
    getAllVillages
}