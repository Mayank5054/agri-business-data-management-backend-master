const jwt = require('jsonwebtoken');
const userModel = require('../models/users');

const login = async (req, res) => {
    try{
        console.log(req);
        const {phone, password} = req.body;
        const user = await userModel.findOne({
            where: {
                phone,
                password,
                isDeleted: false
            }
        });

        if(!user){
            return res.status(404).json({
                status: false,
                message: "User not found",
                statusCode: 404,
                data: null,
                error: null
            });
        }

        if(user.password !== password){
            return res.status(401).json({
                status: false,
                message: "Invalid credentials",
                statusCode: 401,
                data: null,
                error: null
            });
        }

        delete user.dataValues.password;

        const token = jwt.sign(user.dataValues, process.env.JWT_SECRET);

        return res.status(200).json({
            status: true,
            message: "User logged in successfully",
            statusCode: 200,
            data: {
                user,
                token
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

module.exports = {
    login
}