const analysisController = require('../controllers/analysisController');
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

router.get("/totalStats", authMiddleware, adminMiddleware, analysisController.totalStats)
router.get("/dealerAndFarmerGraph", authMiddleware, analysisController.dealerAndFarmerGraph)
router.get("/dealerAndFarmerStates", authMiddleware, adminMiddleware, analysisController.dealerAndFarmerFromStates)

module.exports = router;