const cropModel = require("../models/crops");


const createCrop = async (req, res) => {
    try {

        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                status: false,
                message: "You do not have the permission to create a crop",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        const { name, description, category, medias } = req.body;

        const crop = await cropModel.create({
            name,
            description,
            organisationId: req.user.organisationId,
            category,
            medias: medias ? medias : [],
            isVisible: true,
        });

        return res.status(201).json({
            status: true,
            message: "Crop created successfully",
            statusCode: 201,
            data: crop,
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

const updateCrop = async (req, res) => {
    try {

        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                status: false,
                message: "You do not have the permission to update a crop",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        const { name, description, category, medias, isVisible } = req.body;

        const crop = await cropModel.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!crop) {
            return res.status(404).json({
                status: false,
                message: "Crop not found",
                statusCode: 404,
                data: null,
                error: null
            });
        }

        crop.name = name ? name : crop?.name;
        crop.description = description ? description : crop.description
        crop.category = category ? category : crop.category;
        crop.medias = medias ? medias : crop.medias;
        if(isVisible !== undefined) {
            crop.isVisible = isVisible;
        }

        await crop.save();

        return res.status(200).json({
            status: true,
            message: "Crop updated successfully",
            statusCode: 200,
            data: crop,
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

const deleteCrop = async (req, res) => {
    try {

        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                status: false,
                message: "You do not have the permission to delete a crop",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        const crop = await cropModel.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!crop) {
            return res.status(404).json({
                status: false,
                message: "Crop not found",
                statusCode: 404,
                data: null,
                error: null
            });
        }

        crop.isDeleted = true;

        await crop.save();

        return res.status(200).json({
            status: true,
            message: "Crop deleted successfully",
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

const getCrops = async (req, res) => {
    try {

        let isVisible = req.query.isVisible;

        let where = {
            isDeleted: false,
            organisationId: req.user.organisationId
        }

        if (isVisible) {
            where.isVisible = true
        }

        const crops = await cropModel.findAll({
            where: where
        });

        return res.status(200).json({
            status: true,
            message: "Crops fetched successfully",
            statusCode: 200,
            data: crops,
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

const getCrop = async (req, res) => {
    try {

        let id = parseInt(req.params.id);

        const crop = await cropModel.findOne({
            where: {
                id: req.params.id,
                isDeleted: false,
                organisationId: req.user.organisationId
            }
        });

        if (!crop) {
            return res.status(404).json({
                status: false,
                message: "Crop not found",
                statusCode: 404,
                data: null,
                error: null
            });
        }

        return res.status(200).json({
            status: true,
            message: "Crop fetched successfully",
            statusCode: 200,
            data: crop,
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
    createCrop,
    updateCrop,
    deleteCrop,
    getCrops,
    getCrop
}