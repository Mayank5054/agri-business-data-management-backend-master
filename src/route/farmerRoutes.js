const farmerController = require('../controllers/farmerController');
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const fileUpload = require('../handlers/fileUpload');

const router = express.Router();

router.post("/bulkUpload", authMiddleware, adminMiddleware, fileUpload, farmerController.bulkUploadFarmers)
router.post("/", authMiddleware, farmerController.creatFarmer)
router.put("/:id", authMiddleware, adminMiddleware, farmerController.updateFarmer)
router.get("/export", authMiddleware, farmerController.exportFarmers)
router.get("/", authMiddleware, farmerController.getFarmers)
router.get("/:id", authMiddleware, farmerController.getFarmer)
router.delete("/:id", authMiddleware, adminMiddleware, farmerController.deleteFarmer)

module.exports = router;