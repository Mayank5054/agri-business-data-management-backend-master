const productModel = require("../models/products");


const createProduct = async (req, res) => {
    try {

        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                status: false,
                message: "You do not have the permission to create a product",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        const { name, description, category, medias } = req.body;

        const product = await productModel.create({
            name,
            description,
            organisationId: req.user.organisationId,
            category,
            medias: medias ? medias : [],
            isVisible: true,
        });

        return res.status(201).json({
            status: true,
            message: "Product created successfully",
            statusCode: 201,
            data: product,
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

const updateProduct = async (req, res) => {
    try {

        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                status: false,
                message: "You do not have the permission to update a product",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        const { name, description, category, medias, isVisible } = req.body;

        const product = await productModel.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!product) {
            return res.status(404).json({
                status: false,
                message: "Product not found",
                statusCode: 404,
                data: null,
                error: null
            });
        }

        product.name = name ? name : product?.name;
        product.description = description ? description : product.description
        product.category = category ? category : product.category;
        product.medias = medias ? medias : product.medias;
        if(isVisible !== undefined) {
            product.isVisible = isVisible;
        }

        await product.save();

        return res.status(200).json({
            status: true,
            message: "Product updated successfully",
            statusCode: 200,
            data: product,
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

const deleteProduct = async (req, res) => {
    try {

        if (req.user.userType !== 'admin') {
            return res.status(403).json({
                status: false,
                message: "You do not have the permission to delete a product",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        const product = await productModel.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!product) {
            return res.status(404).json({
                status: false,
                message: "Product not found",
                statusCode: 404,
                data: null,
                error: null
            });
        }

        product.isDeleted = true;

        await product.save();

        return res.status(200).json({
            status: true,
            message: "Product deleted successfully",
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

const getProducts = async (req, res) => {
    try {

        let isVisible = req.query.isVisible;

        let where = {
            isDeleted: false,
            organisationId: req.user.organisationId
        }

        if (isVisible) {
            where.isVisible = true
        }

        const products = await productModel.findAll({
            where: where
        });

        return res.status(200).json({
            status: true,
            message: "Products fetched successfully",
            statusCode: 200,
            data: products,
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

const getProduct = async (req, res) => {
    try {

        let id = parseInt(req.params.id);

        const product = await productModel.findOne({
            where: {
                id: req.params.id,
                isDeleted: false,
                organisationId: req.user.organisationId
            }
        });

        if (!product) {
            return res.status(404).json({
                status: false,
                message: "Product not found",
                statusCode: 404,
                data: null,
                error: null
            });
        }

        return res.status(200).json({
            status: true,
            message: "Product fetched successfully",
            statusCode: 200,
            data: product,
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
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getProduct
}