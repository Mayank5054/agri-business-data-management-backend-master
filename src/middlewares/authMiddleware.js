const jwt = require('jsonwebtoken');
const userModel = require('../models/users');

const authMiddleware = async (req, res, next) => {
    let token = req.headers.authorization;
    if(!token){
        return res.status(401).json({
            status: false,
            message: "Unauthorized",
            statusCode: 401,
            data: null,
            error: null
        });
    }
    token = token.split(" ")[1];

    try{
        let user = jwt.verify(token, process.env.JWT_SECRET);

        user = await userModel.findOne({
            where: {
                id: user.id
            }
        });

        req.user = user;
        next();
    }catch(err){
        return res.status(401).json({
            status: false,
            message: "Unauthorized",
            statusCode: 401,
            data: null,
            error: err
        });
    }
}

module.exports = authMiddleware;