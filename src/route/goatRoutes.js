
const express = require('express');
const goatController = require('../controllers/goatController');
const goatMiddleware = require('../middlewares/goatMiddleware');


const router = express.Router();



 
router.post("/register", goatMiddleware, goatController.register)
router.post("/login", goatController.login)

router.post("/organisation", goatMiddleware, goatController.registerOrganisation)

module.exports = router;