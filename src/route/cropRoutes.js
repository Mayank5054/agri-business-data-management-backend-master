const cropController = require('../controllers/cropController');
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router()

router.post("/", authMiddleware, adminMiddleware, cropController.createCrop)
router.get("/", authMiddleware, cropController.getCrops)
router.get("/:id", authMiddleware, cropController.getCrop)
router.put("/:id", authMiddleware, cropController.updateCrop)
router.delete("/:id", authMiddleware, adminMiddleware, cropController.deleteCrop)

module.exports = router;