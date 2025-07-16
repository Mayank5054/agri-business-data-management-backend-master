const goatModel = require('../models/goat');

const jwt = require('jsonwebtoken');
const organisationModel = require('../models/organisation');
const userModel = require('../models/users');

/**
* @apiDefine GoatHeader 
* @apiHeader {String} Authorization="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwibmFtZSI6InRlc3QgZ29hdCAyIiwiY3JlYXRlZEF0IjoiMjAyNC0wNy0xOFQyMDowODo0MC40MjRaIiwidXBkYXRlZEF0IjoiMjAyNC0wNy0xOFQyMDowODo0MC40MjZaIiwiaXNEZWxldGVkIjpmYWxzZSwiaXNHb2F0Ijp0cnVlLCJpYXQiOjE3MjEzMzM1NjJ9.8ThB7TpEn1lvb12UapkxJjhXJMF3coSMxvKo9SkhWe0" Bearer token
*/


/**
 * 
 * @api {post} /api/goat/register Register a goat
 * @apiName RegisterGoat
 * @apiGroup Goat
 * 
 * @apiBody {String} name="test goat 2" Name of the goat
 * @apiBody {String} password="12345678" Password of the goat
 * 
 * 
 * @apiUse GoatHeader
 * 
 * @apiSuccessExample {json} Success-Response:
 * {
 *   "status": true,
 *   "message": "Goat registered successfully",
 *   "statusCode": 201,
 *   "data": {
 *       "createdAt": "2024-07-18T20:02:16.175Z",
 *       "updatedAt": "2024-07-18T20:02:16.178Z",
 *       "isDeleted": false,
 *       "id": 3,
 *       "name": "new goat 2",
 *       "password": "12345678"
 *   },
 *   "error": null
 *   }   
 * 
 * 
 * 
 * @apiErrorExample {json} Error-Response:
 *  {
 *      "status": false,
 *      "message": "Internal server error",
 *      "statusCode": 500,
 *      "data": null,
 *      "error": "Error message"
 * }
 * 
 * @apiSampleRequest /api/goat/register
 * 
 */
const register = async (req, res) => {
    try{
        const {name, password} = req.body;
        const goat = await goatModel.create({
            name,
            password
        });

        return res.status(201).json({
            status: true,
            message: "Goat registered successfully",
            statusCode: 201,
            data: goat,
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

// write a login api such that it is unhackable such that no one can login without the correct password, and then login with jet token


/**
 * @api {post} /api/goat/login Login a goat
 * @apiName LoginGoat
 * @apiGroup Goat
 * 
 * @apiBody {String} name="test goat 2" Name of the goat
 * @apiBody {String} password="12345678" Password of the goat
 * 
 * @apiSuccessExample {json} Success-Response:
 * {
    "status": true,
    "message": "Goat logged in successfully",
    "statusCode": 200,
    "data": {
        "data": {
            "id": 4,
            "name": "test goat 2",
            "createdAt": "2024-07-18T20:08:40.424Z",
            "updatedAt": "2024-07-18T20:08:40.426Z",
            "isDeleted": false
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwibmFtZSI6InRlc3QgZ29hdCAyIiwiY3JlYXRlZEF0IjoiMjAyNC0wNy0xOFQyMDowODo0MC40MjRaIiwidXBkYXRlZEF0IjoiMjAyNC0wNy0xOFQyMDowODo0MC40MjZaIiwiaXNEZWxldGVkIjpmYWxzZSwiaXNHb2F0Ijp0cnVlLCJpYXQiOjE3MjEzMzM1NjJ9.8ThB7TpEn1lvb12UapkxJjhXJMF3coSMxvKo9SkhWe0"
    },
    "error": null
}
 * 
 */

const login = async (req, res) => {
    try{
        const {name, password} = req.body;
        const goat = await goatModel.findOne({
            where: {
                name,
                password
            }
        });

        if(!goat){
            return res.status(401).json({
                status: false,
                message: "Invalid credentials",
                statusCode: 401,
                data: null,
                error: null
            });
        }

        if(goat.password !== password){
            return res.status(401).json({
                status: false,
                message: "Invalid credentials",
                statusCode: 401,
                data: null,
                error: null
            });
        }

        delete goat.dataValues.password;

        let token = await jwt.sign({...goat.dataValues, isGoat: true}, process.env.JWT_SECRET);


        return res.status(200).json({
            status: true,
            message: "Goat logged in successfully",
            statusCode: 200,
            data: {
                data: goat,
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

/**
 * @api {post} /api/goat/organisation Register an organisation
 * 
 * @apiName Create organisation
 * @apiGroup Goat
 * 
 * @apiBody {String} name="test organisation" Name of the organisation
 * @apiBody {String} phone="9876543210" Phone of the organisation
 * @apiBody {String} contactPersonName="test person" Contact person name
 * @apiBody {String} address="Ahemedabad" Address of the organisation
 * @apiBody {String} [website] Website of the organisation
 * 
 * @apiErrorExample {json} Error-Response:
 * Error 401: Unauthorized
{
    "status": false,
    "message": "Unauthorized",
    "statusCode": 401,
    "data": null,
    "error": null
}
 *
* @apiUse GoatHeader 
* @apiSuccessExample {json} Success-Response:
{
    "status": true,
    "message": "Organisation registered successfully",
    "statusCode": 201,
    "data": {
        "organisation": {
            "createdAt": "2024-07-18T20:30:15.626Z",
            "updatedAt": "2024-07-18T20:30:15.628Z",
            "logo": "",
            "isActive": true,
            "isDeleted": false,
            "id": 1,
            "name": "test goat 2",
            "phone": "9876543210",
            "contactPersonName": "test person",
            "address": "Ahemedabad",
            "website": "",
            "gstNumber": null
        },
        "user": {
            "createdAt": "2024-07-18T20:30:15.665Z",
            "updatedAt": "2024-07-18T20:30:15.665Z",
            "isActive": true,
            "isDeleted": false,
            "id": 1,
            "name": "test person",
            "password": "tes46",
            "phone": "9876543210",
            "organisationId": 1,
            "userType": "admin"
        }
    },
    "error": null
}


 */

const registerOrganisation = async (req, res) => {
    try{

        const organisation = await organisationModel.create({
            ...req.body
        });

        let user = await userModel.create({
            name: req.body?.contactPersonName,
            password: req.body?.name.slice(0, 3) + Math.floor(Math.random() * 1000),
            phone: req.body?.phone,
            organisationId: organisation.id,
            userType: "admin"
        });

        return res.status(201).json({
            status: true,
            message: "Organisation registered successfully",
            statusCode: 201,
            data: {
                organisation,
                user
            },
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
    register,
    login,
    registerOrganisation
}