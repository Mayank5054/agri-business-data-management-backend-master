const jwt = require('jsonwebtoken');

const goatMiddleware = (req, res, next) => {
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
        let goat = jwt.verify(token, process.env.JWT_SECRET);

        if (!goat.isGoat) {
            return res.status(403).json({
                status: false,
                message: "Access denied",
                statusCode: 403,
                data: null,
                error: null
            });
        }

        req.user = goat;
        next();
    }catch(err){
        console.log(err);
        return res.status(401).json({
            status: false,
            message: "Unauthorized",
            statusCode: 401,
            data: null,
            error: err
        });
    }
}

module.exports = goatMiddleware;