const organisationModel = require("../models/organisation");


const getOrganisation = async (req, res) => {
    try {

        let query = {
            id: req.user.organisationId,
        }

        let organisation = await organisationModel.findOne({
            where: query
        });

        return res.status(200).json({
            status: true,
            message: "Organisation fetched successfully",
            statusCode: 200,
            data: organisation,
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

const updateOrganisation = async (req, res) => {
    try {
        let query = {
            id: req.user.organisationId,
        }

        let organisation = await organisationModel.findOne({
            where: query
        });

        if (!organisation) {
            return res.status(404).json({
                status: false,
                message: "Organisation not found",
                statusCode: 404,
                data: null,
                error: null
            });
        }

        organisation.name = req.body.name || organisation.name;
        organisation.phone = req.body.phone || organisation.phone;
        organisation.address = req.body.address || organisation.address;
        organisation.contactPersonName = req.body.contactPersonName || organisation.contactPersonName;
        organisation.gstNumber = req.body.gstNumber || organisation.gstNumber;
        organisation.website = req.body.website || organisation.website;

        organisation.updatedAt = new Date();


        if(req.file !== undefined && req.file !== null){
            organisation.logo = req.file.filename;
        }

        await organisation.save();

        return res.status(200).json({
            status: true,
            message: "Organisation updated successfully",
            statusCode: 200,
            data: organisation,
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
    getOrganisation,
    updateOrganisation
}
