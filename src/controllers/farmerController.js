const { Op } = require('sequelize');
const farmerModel = require('../models/farmers');
const stateModel = require('../models/states');
const districtModel = require('../models/districts');
const talukaModel = require('../models/talukas');
const villageModel = require('../models/villages');
const readXlsxFile = require('read-excel-file/node');
const sequelize = require('../config/database');
const fs = require('fs');
const Excel = require('exceljs');
const productModel = require('../models/products');
const cropModel = require('../models/crops');

const creatFarmer = async (req, res) => {
    try {

        let farmer = req.body;

        farmer.organisationId = req.user.organisationId;
        farmer.userId = req.user.id;

        if (!farmer.phone || isNaN(farmer.phone) || farmer.phone?.toString()?.length != 10) {
            return res.status(400).json({
                status: false,
                message: "Phone number required",
                statusCode: 400,
                data: null,
                error: null
            });
        }

        if (!farmer.name) {
            return res.status(400).json({
                status: false,
                message: "Name required",
                statusCode: 400,
                data: null,
                error: null
            });
        }

        let stateId = farmer.stateId;
        let districtId = farmer.districtId;
        let talukaId = farmer.talukaId;
        let villageId = farmer.villageId;

        if (!stateId || !districtId || !talukaId || !villageId) {
            return res.status(400).json({
                status: false,
                message: "StateId, DistrictId, TalukaId, and VillageId required",
                statusCode: 400,
                data: null,
                error: null
            });
        }

        if (req?.user?.assignedStates && req?.user?.assignedStates?.length > 0) {
            if (!req.user?.assignedStates.includes(stateId)) {
                return res.status(403).json({
                    status: false,
                    message: "You are not allowed to create farmer in this state",
                    statusCode: 403,
                    data: null,
                    error: null
                });
            }
        }

        if (req?.user?.assignedDistricts && req?.user?.assignedDistricts?.length > 0) {
            if (!req.user?.assignedDistricts.includes(districtId)) {
                return res.status(403).json({
                    status: false,
                    message: "You are not allowed to create farmer in this district",
                    statusCode: 403,
                    data: null,
                    error: null
                });
            }
        }

        if (req?.user?.assignedTalukas && req?.user?.assignedTalukas?.length > 0) {
            if (!req.user?.assignedTalukas.includes(talukaId)) {
                return res.status(403).json({
                    status: false,
                    message: "You are not allowed to create farmer in this taluka",
                    statusCode: 403,
                    data: null,
                    error: null
                });
            }
        }

        if (req?.user?.assignedVillages && req?.user?.assignedVillages?.length > 0) {
            if (!req.user?.assignedVillages.includes(villageId)) {
                return res.status(403).json({
                    status: false,
                    message: "You are not allowed to create farmer in this village",
                    statusCode: 403,
                    data: null,
                    error: null
                });
            }
        }

        let hexCode = `${stateId?.toString()?.padStart(2, '0')}${districtId?.toString()?.padStart(3, '0')}${talukaId?.toString()?.padStart(4, '0')}${villageId?.toString()?.padStart(6, '0')}`;

        farmer.hexCode = hexCode;

        let newFamer = await farmerModel.create(farmer);

        return res.status(200).json({
            status: true,
            message: "Farmer created successfully",
            statusCode: 200,
            data: newFamer,
            error: null
        });
    } catch (err) {
        // check if error is due to unique constraint
        if (err?.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                status: false,
                message: "Phone number already exists",
                statusCode: 400,
                data: null,
                error: null
            });
        }

        return res.status(500).json({
            status: false,
            message: "Internal server error",
            statusCode: 500,
            data: null,
            error: err
        });
    }
}

const bulkUploadFarmers = async (req, res) => {
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

        // read the excel file in req.file
        readXlsxFile("uploads/" + req.file.filename, { sheet: 1 }).then(async (rows) => {

            if (rows.length < 2) {
                return res.status(400).json({
                    status: false,
                    message: "No data found in the file",
                    statusCode: 400,
                    data: null,
                    error: null
                });
            }

            let duplicateNumbersCnt = 0
            let invalidRowsCnt = 0

            let workbook = new Excel.Workbook();

            let duplicateSheet = workbook.addWorksheet('Duplicates');
            let invalidSheet = workbook.addWorksheet('Invalid Rows');

            let columns = [
                { header: 'Name', key: 'name', width: 20 },
                { header: 'Phone', key: 'phone', width: 20 },
                { header: 'State', key: 'state', width: 20 },
                { header: 'District', key: 'district', width: 20 },
                { header: 'Taluka', key: 'taluka', width: 20 },
                { header: 'Village', key: 'village', width: 20 },
                { header: 'Potential Scope', key: 'potentialScope', width: 20 },
                { header: 'Behaviour', key: 'behaviour', width: 20 },
                { header: 'Address', key: 'address', width: 20 }
            ];

            duplicateSheet.columns = columns;
            invalidSheet.columns = columns;

            let duplicateMap = {}
            let stateMap = {}
            let districtMap = {}
            let talukaMap = {}
            let villageMap = {}

            let transaction = await sequelize.transaction();

            for (let i = 1; i < rows.length; i++) {

                try {

                    let row = rows[i];
                    let phone = row[1];
                    let name = row[0];
                    let state = row[2];
                    let district = row[3];
                    let taluka = row[4];
                    let village = row[5];
                    let potentialScope = row[6] || '';
                    let behaviour = row[7] || '';
                    let address = row[8] || '';

                    if (!phone || phone?.toString()?.length != 10) {
                        invalidRowsCnt++
                        console.log('phone issue ', phone);
                        invalidSheet.addRow(row)
                        continue;
                    }

                    if (!name) {
                        invalidRowsCnt++
                        console.log('name issue ', name);
                        invalidSheet.addRow(row)
                        continue;
                    }

                    if (duplicateMap[phone?.toString()]) {
                        duplicateNumbersCnt++;
                        console.log('duplicate issue ', phone);
                        duplicateSheet.addRow(row);
                        continue;
                    }

                    let query = { stateId: 64, districtId: 735, talukaId: 6572, villageId: 495498 };

                    let stateName = state;

                    if (stateName && stateName !== '') {
                        // replace '-' with ' ' and convert to UPPERCASE
                        stateName = stateName.replace(/-/g, ' ').toUpperCase();
                        // remove any more than one space
                        stateName = stateName.replace(/\s+/g, ' ');
                        // replace AND with &
                        stateName = stateName.replace('AND', '&');

                        if (stateMap[stateName]) {
                            query.stateId = stateMap[stateName];
                        } else {

                            let stateId = await stateModel.findOne({
                                where: {
                                    name: {
                                        [Op.iLike]: `%${stateName}%`
                                    }
                                }
                            }, { transaction });

                            if (!stateId) {
                                invalidRowsCnt++;
                                console.log('state issue ', state);
                                invalidSheet.addRow(row);
                                continue;
                            }

                            query.stateId = stateId.id
                        }
                    }

                    let districtName = district;
                    if (districtName && districtName !== '') {
                        // replace '-' with ' ' and convert to UPPERCASE
                        districtName = districtName.replace(/-/g, ' ').toUpperCase();
                        // remove any more than one space
                        districtName = districtName.replace(/\s+/g, ' ');
                        // replace AND with &
                        districtName = districtName.replace('AND', '&');


                        if (districtMap[districtName]) {
                            query.districtId = districtMap[districtName];
                        } else {


                            let districtQuery = {}
                            if (query.stateId !== 64) {
                                districtQuery.stateId = query.stateId
                            }
                            districtQuery.name = {
                                [Op.iLike]: `%${districtName}%`
                            }
                            // match the nearest district from districtModel
                            let districtId = await districtModel.findOne({
                                where: districtQuery
                            }, { transaction });

                            if (!districtId) {
                                invalidRowsCnt++;
                                console.log('district issue ', district);
                                invalidSheet.addRow(row);
                                continue;
                            }

                            query.districtId = districtId.id;
                        }
                    }

                    let talukaName = taluka;
                    if (talukaName && talukaName !== '') {
                        // replace '-' with ' ' and convert to UPPERCASE
                        talukaName = talukaName.replace(/-/g, ' ').toUpperCase();
                        // remove any more than one space
                        talukaName = talukaName.replace(/\s+/g, ' ');
                        // replace AND with &
                        talukaName = talukaName.replace('AND', '&');


                        if (talukaMap[talukaName]) {
                            query.talukaId = talukaMap[talukaName];
                        } else {

                            let talukaQuery = {}
                            if (query.stateId !== 64) {
                                talukaQuery.stateId = query.stateId
                            }
                            if (query.districtId !== 735) {
                                talukaQuery.districtId = query.districtId
                            }
                            talukaQuery.name = {
                                [Op.iLike]: `%${talukaName}%`
                            }
                            // match the nearest taluka from talukaModel
                            let talukaId = await talukaModel.findOne({
                                where: talukaQuery
                            }, { transaction });

                            if (!talukaId) {
                                invalidRowsCnt++;
                                console.log('taluka issue ', taluka);
                                invalidSheet.addRow(row);
                                continue;
                            }

                            query.talukaId = talukaId.id;
                        }
                    }

                    let villageName = village;
                    if (villageName && villageName !== '') {
                        // replace '-' with ' ' and convert to UPPERCASE
                        villageName = villageName.replace(/-/g, ' ').toUpperCase();
                        // remove any more than one space
                        villageName = villageName.replace(/\s+/g, ' ');
                        // replace AND with &
                        villageName = villageName.replace('AND', '&');

                        if (villageMap[villageName]) {
                            query.villageId = villageMap[villageName];
                        } else {


                            let villageQuery = {}
                            if (query.stateId !== 64) {
                                villageQuery.stateId = query.stateId
                            }
                            if (query.districtId !== 735) {
                                villageQuery.districtId = query.districtId
                            }
                            if (query.talukaId !== 6572) {
                                villageQuery.talukaId = query.talukaId
                            }
                            villageQuery.name = {
                                [Op.iLike]: `%${villageName}%`
                            }
                            // match the nearest village from villageModel
                            let villageId = await villageModel.findOne({
                                where: villageQuery
                            }, { transaction });

                            if (!villageId) {
                                invalidRowsCnt++;
                                console.log('village issue ', village);
                                invalidSheet.addRow(row);
                                continue;
                            }

                            query.villageId = villageId.id;
                        }
                    }

                    let hexCode = `NA`;

                    let farmer = await farmerModel.findOne({
                        where: {
                            phone: phone.toString(),
                            organisationId: req.user.organisationId
                        }
                    }, { transaction });

                    if (farmer) {
                        duplicateMap[phone?.toString()] = true;
                        duplicateNumbersCnt++;
                        console.log('duplicate issue ', phone);
                        duplicateSheet.addRow(row);
                        continue;
                    }

                    let newFamerDetails = {
                        name,
                        phone: phone.toString(),
                        organisationId: req.user.organisationId,
                        userId: req.user.id,
                        hexCode,
                        potentialScope,
                        behaviour,
                        address
                    }

                    if (query.stateId) {
                        newFamerDetails.stateId = query.stateId
                    }
                    if (query.districtId) {
                        newFamerDetails.districtId = query.districtId
                    }
                    if (query.talukaId) {
                        newFamerDetails.talukaId = query.talukaId
                    }
                    if (query.villageId) {
                        newFamerDetails.villageId = query.villageId
                    }

                    let newFarmer = await farmerModel.create(newFamerDetails);

                    if (!newFarmer) {
                        invalidRowsCnt++;
                        console.log('new farmer issue ', row);
                        invalidSheet.addRow(row);
                    }

                    duplicateMap[phone?.toString()] = true;

                } catch (err) {
                    console.log(err);

                    // check if error is due to duplicate phone number
                    if (err?.name === 'SequelizeUniqueConstraintError' && err?.fields?.phone) {
                        duplicateNumbersCnt++;
                        console.log('duplicate issue ', rows[i]);
                        duplicateSheet.addRow(rows[i]);
                        continue;
                    }

                    invalidRowsCnt++;
                    console.log('error issue ', rows[i]);
                    invalidSheet.addRow(rows[i]);
                }

            }

            // await transaction.commit();

            await fs.unlinkSync("uploads/" + req.file.filename);

            // send the file back to the user with response
            let fileName = `Bulk-upload-farmers-report-${new Date().getTime()}.xlsx`;

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

            await workbook.xlsx.write(res)

            return res.end();

        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                status: false,
                message: "Internal server error",
                statusCode: 500,
                data: null,
                error: err
            });
        });

    } catch (err) {
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

const updateFarmer = async (req, res) => {
    try {

        let farmer = req.body;

        let id = req.params.id;

        id = parseInt(id);

        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                status: false,
                message: "Access denied",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        if (farmer.phone) {
            if (isNaN(farmer.phone) || farmer.phone?.toString()?.length != 10) {
                return res.status(400).json({
                    status: false,
                    message: "Phone number required",
                    statusCode: 400,
                    data: null,
                    error: null
                });
            }
        }

        let updatedFarmer = await farmerModel.findOne({
            where: {
                id,
                organisationId: req.user.organisationId,
            }
        });

        if (!updatedFarmer) {
            return res.status(404).json({
                status: false,
                message: "Farmer not found",
                statusCode: 404,
                data: null,
                error: null
            });
        }

        // console.log(farmer, updatedFarmer.dataValues);
        // updatedFarmer = updatedFarmer.dataValues;

        updatedFarmer.name = farmer.name || updatedFarmer.name;
        updatedFarmer.phone = farmer.phone || updatedFarmer.phone;
        updatedFarmer.stateId = farmer.stateId || updatedFarmer.stateId;
        updatedFarmer.districtId = farmer.districtId || updatedFarmer.districtId;
        updatedFarmer.talukaId = farmer.talukaId || updatedFarmer.talukaId;
        updatedFarmer.villageId = farmer.villageId || updatedFarmer.villageId;
        updatedFarmer.isUser = farmer.isUser || updatedFarmer.isUser;
        updatedFarmer.productUses = farmer.productUses || updatedFarmer.productUses;
        updatedFarmer.cropUses = farmer.cropUses || updatedFarmer.cropUses;
        updatedFarmer.potentialScope = farmer.potentialScope || updatedFarmer.potentialScope;
        updatedFarmer.behaviour = farmer.behaviour || updatedFarmer.behaviour;
        updatedFarmer.address = farmer.address || updatedFarmer.address;
        updatedFarmer.refBy = farmer.refBy || updatedFarmer.refBy

        let stateId = updatedFarmer.stateId;
        let districtId = updatedFarmer.districtId;
        let talukaId = updatedFarmer.talukaId;
        let villageId = updatedFarmer.villageId;

        if (!stateId || !districtId || !talukaId || !villageId) {
            return res.status(400).json({
                status: false,
                message: "StateId, DistrictId, TalukaId, and VillageId required",
                statusCode: 400,
                data: null,
                error: null
            });
        }

        let hexCode = `${stateId?.toString()?.padStart(2, '0')}${districtId?.toString()?.padStart(3, '0')}${talukaId?.toString()?.padStart(4, '0')}${villageId?.toString()?.padStart(6, '0')}`;

        updatedFarmer.hexCode = hexCode;

        await updatedFarmer.save();

        return res.status(200).json({
            status: true,
            message: "Farmer updated successfully",
            statusCode: 200,
            data: updatedFarmer,
            error: null
        });
    } catch (err) {

        if (err?.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                status: false,
                message: "Phone number already exists",
                statusCode: 400,
                data: null,
                error: null
            });
        }

        return res.status(500).json({
            status: false,
            message: "Internal server error",
            statusCode: 500,
            data: null,
            error: err
        });
    }
}


const getFarmers = async (req, res) => {
    try {

        let query = {
            organisationId: req.user.organisationId,
            isDeleted: false
        }

        let stateIds = req.query.stateIds;
        stateIds = stateIds?.split(',') || [];
        let districtIds = req.query.districtIds;
        districtIds = districtIds?.split(',') || [];
        let talukaIds = req.query.talukaIds;
        talukaIds = talukaIds?.split(',') || [];
        let villageIds = req.query.villageIds;
        villageIds = villageIds?.split(',') || [];

        let page = req.query.page || 1;
        let limit = req.query.limit || 10;

        page = parseInt(page);
        limit = parseInt(limit);

        if (req.query.phone) {
            query.phone = req.query.phone;
        }

        if (req.query.productUses) {
            query.productUses = {
                [Op.contains]: req.query.productUses.split(',')
            }
        }
        if (req.query.cropUses) {
            query.cropUses = {
                [Op.contains]: req.query.cropUses.split(',')
            }
        }
        let stateHexCode = '[0-9]{2}'

        if (stateIds.length > 0) {
            if (req?.user?.userType !== 'admin' && req?.user?.assignedStates && req?.user?.assignedStates?.length > 0) {
                let temp = stateIds.filter(stateId => !req.user.assignedStates.includes(stateId));
                if (temp.length > 0) {
                    return res.status(403).json({
                        status: false,
                        message: "You are not allowed to view farmers in these states",
                        statusCode: 403,
                        data: null,
                        error: null
                    });
                }
            }
            // stateHexCode = `(${stateIds.map(stateId => `${stateId?.toString()?.padStart(2, '0')}`).join('|')})`;

            query.stateId = {
                [Op.in]: stateIds
            }
        } else {
            if (req?.user?.assignedStates && req?.user?.assignedStates?.length > 0) {
                stateIds = req.user.assignedStates;

                // stateHexCode = `(${stateIds.map(stateId => `${stateId?.toString()?.padStart(2, '0')}`).join('|')})`;
                query.stateId = {
                    [Op.in]: stateIds
                }
            }
        }

        let districtHexCode = '[0-9]{3}'
        if (districtIds?.length > 0) {
            if (req?.user?.userType !== 'admin' && req?.user?.assignedDistricts && req?.user?.assignedDistricts?.length > 0) {
                let temp = districtIds.filter(districtId => !req.user.assignedDistricts.includes(districtId));
                if (temp.length > 0) {
                    return res.status(403).json({
                        status: false,
                        message: "You are not allowed to view farmers in these districts",
                        statusCode: 403,
                        data: null,
                        error: null
                    });
                }
            }


            // districtHexCode = `(${districtIds.map(districtId => `${districtId?.toString()?.padStart(3, '0')}`).join('|')})`
            query.districtId = {
                [Op.in]: districtIds
            }
        } else {
            if (req?.user?.assignedDistricts && req?.user?.assignedDistricts?.length > 0) {
                districtIds = req.user.assignedDistricts;

                // districtHexCode = `(${districtIds.map(districtId => `${districtId?.toString()?.padStart(3, '0')}`).join('|')})`
                query.districtId = {
                    [Op.in]: districtIds
                }
            }
        }

        let talukaHexCode = '[0-9]{4}'
        if (talukaIds?.length > 0) {
            if (req?.user?.userType !== 'admin' && req?.user?.assignedTalukas && req?.user?.assignedTalukas?.length > 0) {
                let temp = talukaIds.filter(talukaId => !req.user.assignedTalukas.includes(talukaId));
                if (temp.length > 0) {
                    return res.status(403).json({
                        status: false,
                        message: "You are not allowed to view farmers in these talukas",
                        statusCode: 403,
                        data: null,
                        error: null
                    });
                }
            }

            // talukaHexCode = `(${talukaIds.map(talukaId => `${talukaId?.toString()?.padStart(4, '0')}`).join('|')})`;
            query.talukaId = {
                [Op.in]: talukaIds
            }
        } else {
            if (req?.user?.assignedTalukas && req?.user?.assignedTalukas?.length > 0) {
                talukaIds = req.user.assignedTalukas;

                // talukaHexCode = `(${talukaIds.map(talukaId => `${talukaId?.toString()?.padStart(4, '0')}`).join('|')})`;
                query.talukaId = {
                    [Op.in]: talukaIds
                }
            }
        }

        let villageHexCode = '[0-9]{6}'
        if (villageIds?.length > 0) {
            if (req?.user?.userType !== 'admin' && req?.user?.assignedVillages && req?.user?.assignedVillages?.length > 0) {
                let temp = villageIds.filter(villageId => !req.user.assignedVillages.includes(villageId));
                if (temp.length > 0) {
                    return res.status(403).json({
                        status: false,
                        message: "You are not allowed to view farmers in these villages",
                        statusCode: 403,
                        data: null,
                        error: null
                    });
                }
            }


            // villageHexCode = `(${villageIds.map(villageId => `${villageId?.toString()?.padStart(6, '0')}`).join('|')})`;
            query.villageId = {
                [Op.in]: villageIds
            }
        } else {
            if (req?.user?.assignedVillages && req?.user?.assignedVillages?.length > 0) {
                villageIds = req.user.assignedVillages;

                // villageHexCode = `(${villageIds.map(villageId => `${villageId?.toString()?.padStart(6, '0')}`).join('|')})`;
                query.villageId = {
                    [Op.in]: villageIds
                }
            }
        }

        // make regex to match with famrer hexCode
        // let regexPattern = `^${stateHexCode}${districtHexCode}${talukaHexCode}${villageHexCode}$`;
        // let regex = new RegExp(regexPattern)


        // query.hexCode = {
        //     [Op.regexp]: regex.source
        // }

        if (req.query.isUser) {
            query.isUser = req.query.isUser;
        }
        if (req.query.name) {
            query.name = {
                [Op.like]: `%${req.query.name}%`
            }
        }
        if (req.query.address) {
            query.address = {
                [Op.like]: `%${req.query.address}%`
            }
        }
        if (req.query.productUses) {
            // productUses is an array and req.query.productUses is also a array
            query.productUses = {
                [Op.contains]: req.query.productUses.split(',')
            }
        }
        if (req.query.cropUses) {
            // cropUses is an array and req.query.cropUses is also a array
            query.cropUses = {
                [Op.contains]: req.query.cropUses.split(',')
            }
        }
        if (req.query.potentialScope) {
            query.potentialScope = {
                [Op.in]: req.query.potentialScope.split(',')
            }
        }
        if (req.query.behaviour) {
            query.behaviour = {
                [Op.in]: req.query.behaviour.split(',')
            }
        }


        let promises = [];
        promises.push(farmerModel.count({
            where: query
        }));
        promises.push(farmerModel.findAll({
            where: query,
            include: [
                {
                    model: stateModel,
                },
                {
                    model: districtModel,
                },
                {
                    model: talukaModel,
                },
                {
                    model: villageModel,
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: (page - 1) * limit
        }));
        promises.push(productModel.findAll({
            where: {
                organisationId: req.user.organisationId,
            }
        }))

        promises.push(cropModel.findAll({
            where: {
                organisationId: req.user.organisationId,
            }
        }))

        let [totalRecords, records, products, crops] = await Promise.all(promises);

        let productMap = {}
        if (products && products.length) {
            products.map(product => {
                productMap[product?.dataValues?.id] = product?.dataValues
            })
            for(let k=0; k<records.length;k++) {
                let record = records[k]
                if (!record?.productUses || !record?.productUses?.length) {
                    continue
                }
                let temp = []
                for (let i = 0; i < record?.productUses?.length; i++) {
                    console.log(record?.productUses[i])
                    temp.push(productMap[record?.productUses[i]])
                }
                record.productUses = temp
            }
            
        }


        let cropMap = {}
        if (crops && crops.length) {
            crops.map(crop => {
                cropMap[crop?.dataValues?.id] = crop?.dataValues
            })
            for(let k=0; k<records.length;k++) {
                let record = records[k]
                if (!record?.cropUses || !record?.cropUses?.length) {
                    continue
                }
                let temp = []
                for (let i = 0; i < record?.cropUses?.length; i++) {
                    console.log(record?.cropUses[i])
                    temp.push(productMap[record?.cropUses[i]])
                }
                record.cropUses = temp
            }
            
        }


        return res.status(200).json({
            status: true,
            message: "Farmers retrieved successfully",
            statusCode: 200,
            data: {
                records,
                page,
                limit,
                totalRecords
            },
            error: null
        });

    } catch (err) {
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

const exportFarmers = async (req, res) => {
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

        let query = {
            organisationId: req.user.organisationId,
            isDeleted: false
        }

        let stateIds = req.query.stateIds;
        stateIds = stateIds?.split(',') || [];
        let districtIds = req.query.districtIds;
        districtIds = districtIds?.split(',') || [];
        let talukaIds = req.query.talukaIds;
        talukaIds = talukaIds?.split(',') || [];
        let villageIds = req.query.villageIds;
        villageIds = villageIds?.split(',') || [];

        if (req.query.phone) {
            query.phone = req.query.phone;
        }

        if (req.query.productUses) {
            query.productUses = {
                [Op.contains]: req.query.productUses.split(',')
            }
        }
        if (req.query.cropUses) {
            query.cropUses = {
                [Op.contains]: req.query.cropUses.split(',')
            }
        }
        let stateHexCode = '[0-9]{2}'

        if (stateIds.length > 0) {
            if (req?.user?.userType !== 'admin' && req?.user?.assignedStates && req?.user?.assignedStates?.length > 0) {
                let temp = stateIds.filter(stateId => !req.user.assignedStates.includes(stateId));
                if (temp.length > 0) {
                    return res.status(403).json({
                        status: false,
                        message: "You are not allowed to view farmers in these states",
                        statusCode: 403,
                        data: null,
                        error: null
                    });
                }
            }
            // stateHexCode = `(${stateIds.map(stateId => `${stateId?.toString()?.padStart(2, '0')}`).join('|')})`;

            query.stateId = {
                [Op.in]: stateIds
            }
        } else {
            if (req?.user?.assignedStates && req?.user?.assignedStates?.length > 0) {
                stateIds = req.user.assignedStates;

                // stateHexCode = `(${stateIds.map(stateId => `${stateId?.toString()?.padStart(2, '0')}`).join('|')})`;
                query.stateId = {
                    [Op.in]: stateIds
                }
            }
        }

        let districtHexCode = '[0-9]{3}'
        if (districtIds?.length > 0) {
            if (req?.user?.userType !== 'admin' && req?.user?.assignedDistricts && req?.user?.assignedDistricts?.length > 0) {
                let temp = districtIds.filter(districtId => !req.user.assignedDistricts.includes(districtId));
                if (temp.length > 0) {
                    return res.status(403).json({
                        status: false,
                        message: "You are not allowed to view farmers in these districts",
                        statusCode: 403,
                        data: null,
                        error: null
                    });
                }
            }


            // districtHexCode = `(${districtIds.map(districtId => `${districtId?.toString()?.padStart(3, '0')}`).join('|')})`
            query.districtId = {
                [Op.in]: districtIds
            }
        } else {
            if (req?.user?.assignedDistricts && req?.user?.assignedDistricts?.length > 0) {
                districtIds = req.user.assignedDistricts;

                // districtHexCode = `(${districtIds.map(districtId => `${districtId?.toString()?.padStart(3, '0')}`).join('|')})`
                query.districtId = {
                    [Op.in]: districtIds
                }
            }
        }

        let talukaHexCode = '[0-9]{4}'
        if (talukaIds?.length > 0) {
            if (req?.user?.userType !== 'admin' && req?.user?.assignedTalukas && req?.user?.assignedTalukas?.length > 0) {
                let temp = talukaIds.filter(talukaId => !req.user.assignedTalukas.includes(talukaId));
                if (temp.length > 0) {
                    return res.status(403).json({
                        status: false,
                        message: "You are not allowed to view farmers in these talukas",
                        statusCode: 403,
                        data: null,
                        error: null
                    });
                }
            }

            // talukaHexCode = `(${talukaIds.map(talukaId => `${talukaId?.toString()?.padStart(4, '0')}`).join('|')})`;
            query.talukaId = {
                [Op.in]: talukaIds
            }
        } else {
            if (req?.user?.assignedTalukas && req?.user?.assignedTalukas?.length > 0) {
                talukaIds = req.user.assignedTalukas;

                // talukaHexCode = `(${talukaIds.map(talukaId => `${talukaId?.toString()?.padStart(4, '0')}`).join('|')})`;
                query.talukaId = {
                    [Op.in]: talukaIds
                }
            }
        }

        let villageHexCode = '[0-9]{6}'
        if (villageIds?.length > 0) {
            if (req?.user?.userType !== 'admin' && req?.user?.assignedVillages && req?.user?.assignedVillages?.length > 0) {
                let temp = villageIds.filter(villageId => !req.user.assignedVillages.includes(villageId));
                if (temp.length > 0) {
                    return res.status(403).json({
                        status: false,
                        message: "You are not allowed to view farmers in these villages",
                        statusCode: 403,
                        data: null,
                        error: null
                    });
                }
            }


            // villageHexCode = `(${villageIds.map(villageId => `${villageId?.toString()?.padStart(6, '0')}`).join('|')})`;
            query.villageId = {
                [Op.in]: villageIds
            }
        } else {
            if (req?.user?.assignedVillages && req?.user?.assignedVillages?.length > 0) {
                villageIds = req.user.assignedVillages;

                // villageHexCode = `(${villageIds.map(villageId => `${villageId?.toString()?.padStart(6, '0')}`).join('|')})`;
                query.villageId = {
                    [Op.in]: villageIds
                }
            }
        }

        // make regex to match with famrer hexCode
        // let regexPattern = `^${stateHexCode}${districtHexCode}${talukaHexCode}${villageHexCode}$`;
        // let regex = new RegExp(regexPattern)


        // query.hexCode = {
        //     [Op.regexp]: regex.source
        // }

        if (req.query.isUser) {
            query.isUser = req.query.isUser;
        }
        if (req.query.name) {
            query.name = {
                [Op.like]: `%${req.query.name}%`
            }
        }
        if (req.query.address) {
            query.address = {
                [Op.like]: `%${req.query.address}%`
            }
        }
        if (req.query.productUses) {
            // productUses is an array and req.query.productUses is also a array
            query.productUses = {
                [Op.contains]: req.query.productUses.split(',')
            }
        }
        if (req.query.cropUses) {
            // cropUses is an array and req.query.cropUses is also a array
            query.cropUses = {
                [Op.contains]: req.query.cropUses.split(',')
            }
        }
        if (req.query.potentialScope) {
            query.potentialScope = {
                [Op.in]: req.query.potentialScope.split(',')
            }
        }
        if (req.query.behaviour) {
            query.behaviour = {
                [Op.in]: req.query.behaviour.split(',')
            }
        }


        let promises = [];
        promises.push(farmerModel.findAll({
            where: query,
            include: [
                {
                    model: stateModel,
                },
                {
                    model: districtModel,
                },
                {
                    model: talukaModel,
                },
                {
                    model: villageModel,
                }
            ],
            order: [['createdAt', 'DESC']],
        }));

        let [records] = await Promise.all(promises);

        let workbook = new Excel.Workbook();

        let worksheet = workbook.addWorksheet('Farmers');

        worksheet.columns = [
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Phone', key: 'phone', width: 20 },
            { header: 'Phone with Country Code', key: 'phoneWithCountryCode', width: 20 },
            { header: 'State', key: 'state', width: 20 },
            { header: 'District', key: 'district', width: 20 },
            { header: 'Taluka', key: 'taluka', width: 20 },
            { header: 'Village', key: 'village', width: 20 },
            { header: 'Potential Scope', key: 'potentialScope', width: 20 },
            { header: 'Behaviour', key: 'behaviour', width: 20 },
            { header: 'Address', key: 'address', width: 20 }
        ]

        records.forEach(record => {
            worksheet.addRow({
                name: record?.name,
                phone: record?.phone,
                phoneWithCountryCode: `+91${record?.phone}`,
                state: record?.state?.name,
                district: record?.district?.name,
                taluka: record?.taluka?.name,
                village: record?.village?.name,
                potentialScope: record?.potentialScope,
                behaviour: record?.behaviour,
                address: record?.address
            })
        });

        let fileName = `Farmers-${new Date().getTime()}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + fileName);

        await workbook.xlsx.write(res)

        return res.end();

    } catch (err) {
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

const getFarmer = async (req, res) => {
    try {
        let id = req.params.id;
        id = parseInt(id);

        let farmer = await farmerModel.findOne({
            where: {
                id,
                organisationId: req.user.organisationId,
                isDeleted: false
            },
            include: [
                {
                    model: stateModel,
                },
                {
                    model: districtModel,
                },
                {
                    model: talukaModel,
                },
                {
                    model: villageModel,
                }
            ]
        });

        if (!farmer) {
            return res.status(404).json({
                status: false,
                message: "Farmer not found",
                statusCode: 404,
                data: null,
                error: null
            });
        }

        if(farmer?.productUses && farmer?.productUses?.length) {
            let products = await productModel.findAll({
                where: {
                    organisationId: req.user.organisationId,
                    id: {
                        [Op.in]: farmer.productUses
                    }
                }
            })

            if(products && products.length) {
                farmer.productUses = products
            }
        }

        if(farmer?.cropUses && farmer?.cropUses?.length) {
            let crops = await cropModel.findAll({
                where: {
                    organisationId: req.user.organisationId,
                    id: {
                        [Op.in]: farmer.cropUses
                    }
                }
            })

            if(crops && crops.length) {
                farmer.cropUses = crops
            }
        }

        let states = req.user.assignedStates || [];
        let districts = req.user.assignedDistricts || [];
        let talukas = req.user.assignedTalukas || [];
        let villages = req.user.assignedVillages || [];

        if (states?.length > 0 && !states.includes(farmer.stateId)) {
            return res.status(403).json({
                status: false,
                message: "You are not allowed to view this farmer",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        if (districts?.length > 0 && !districts.includes(farmer.districtId)) {
            return res.status(403).json({
                status: false,
                message: "You are not allowed to view this farmer",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        if (talukas?.length > 0 && !talukas.includes(farmer.talukaId)) {
            return res.status(403).json({
                status: false,
                message: "You are not allowed to view this farmer",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        if (villages?.length > 0 && !villages.includes(farmer.villageId)) {
            return res.status(403).json({
                status: false,
                message: "You are not allowed to view this farmer",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        return res.status(200).json({
            status: true,
            message: "Farmer fetched successfully",
            statusCode: 200,
            data: farmer,
            error: null
        });


    } catch (err) {
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

const deleteFarmer = async (req, res) => {
    try {
        let id = req.params.id;
        id = parseInt(id);

        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                status: false,
                message: "Access denied",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        let farmer = await farmerModel.findOne({
            where: {
                id,
                organisationId: req.user.organisationId,
                isDeleted: false
            }
        });

        if (!farmer) {
            return res.status(404).json({
                status: false,
                message: "Farmer not found",
                statusCode: 404,
                data: null,
                error: null
            });
        }

        let states = req.user.assignedStates || [];
        let districts = req.user.assignedDistricts || [];
        let talukas = req.user.assignedTalukas || [];
        let villages = req.user.assignedVillages || [];

        if (states?.length > 0 && !states.includes(farmer.stateId)) {
            return res.status(403).json({
                status: false,
                message: "You are not allowed to delete this farmer",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        if (districts?.length > 0 && !districts.includes(farmer.districtId)) {
            return res.status(403).json({
                status: false,
                message: "You are not allowed to delete this farmer",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        if (talukas?.length > 0 && !talukas.includes(farmer.talukaId)) {

            return res.status(403).json({
                status: false,
                message: "You are not allowed to delete this farmer",
                statusCode: 403,
                data: null,
                error: null
            });

        }

        if (villages?.length > 0 && !villages.includes(farmer.villageId)) {
            return res.status(403).json({
                status: false,
                message: "You are not allowed to delete this farmer",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        await farmerModel.destroy({
            where: {
                id,
                organisationId: req.user.organisationId
            }
        });

        return res.status(200).json({
            status: true,
            message: "Farmer deleted successfully",
            statusCode: 200,
            data: null,
            error: null
        });

    } catch (err) {
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
    creatFarmer,
    bulkUploadFarmers,
    updateFarmer,
    getFarmers,
    getFarmer,
    deleteFarmer,
    exportFarmers
}