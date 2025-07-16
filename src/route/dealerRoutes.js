const dealerController = require('../controllers/dealerController');
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const fileUpload = require('../handlers/fileUpload');

const router = express.Router();

router.post("/bulkUpload", authMiddleware, adminMiddleware, fileUpload, dealerController.bulkUploadDealers)
router.post("/", authMiddleware, dealerController.creatDealer)
router.put("/:id", authMiddleware, adminMiddleware, dealerController.updateDealer)
router.get("/export", authMiddleware, dealerController.exportDealers)
router.get("/:id", authMiddleware, dealerController.getDealer)
router.get("/", authMiddleware, dealerController.getDealers)
router.delete("/:id", authMiddleware, adminMiddleware, dealerController.deleteDealer)

module.exports = router;