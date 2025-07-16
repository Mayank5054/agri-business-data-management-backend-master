const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.use('/goat', require('./goatRoutes'));
router.use('/user', require('./userRoutes'));
router.use('/farmer', require('./farmerRoutes'));
router.use('/dealer', require('./dealerRoutes'));
router.use('/product', require('./productRoutes'));
router.use('/crop', require('./cropRoutes'));
router.use("/territories", require("./territoriesRoutes"));
router.use('/organisation', require('./organisationRoutes'));
router.use('/analysis', require('./analysisRoutes'));

router.post("/login", authController.login)

module.exports = router;