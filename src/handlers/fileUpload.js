const multer = require('multer');

const fileUpload = async (req, res, next) => {

    // check the file uploaded from the field name media

    const upload = multer({
        dest: 'uploads/',
        limits: {
            fileSize: 10000000
        },
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'uploads/')
            },
            filename: function (req, file, cb) {
                cb(null, file.fieldname + '-' + Date.now()+'.'+file.originalname.split('.').pop())
            }
        }),
    }).single('media');

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                status: false,
                message: "Invalid file",
                statusCode: 400,
                data: null,
                error: err
            });
        } else if (err) {
            return res.status(500).json({
                status: false,
                message: "Internal server error",
                statusCode: 500,
                data: null,
                error: err
            });
        }
        next();
    });
}

module.exports = fileUpload;