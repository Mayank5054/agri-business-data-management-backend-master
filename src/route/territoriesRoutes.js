const territoriesController = require('../controllers/territoriesController');
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get("/states", territoriesController.getAllStates)
router.get("/districts", territoriesController.getAllDistricts)
router.get("/talukas", territoriesController.getAllTalukas)
router.get("/villages", territoriesController.getAllVillages)

module.exports = router;