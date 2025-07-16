

const adminMiddleware = async (req, res, next) => { 

    try{
        let user = req.user;
        if (user?.userType !== 'admin') {
            return res.status(403).json({
                status: false,
                message: "Access denied",
                statusCode: 403,
                data: null,
                error: null
            });
        }
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

module.exports = adminMiddleware;