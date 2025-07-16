const productController = require('../controllers/productController');
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, productController.createProduct)
router.get("/", authMiddleware, adminMiddleware, productController.getProducts)
router.get("/:id", authMiddleware, productController.getProduct)
router.put("/:id", authMiddleware, productController.updateProduct)
router.delete("/:id", authMiddleware, adminMiddleware, productController.deleteProduct)

module.exports = router;