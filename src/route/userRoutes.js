const userController = require('../controllers/userController');
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

router.post("/",authMiddleware,userController.createUser)
router.get("/",authMiddleware, userController.getUsers)
router.get("/:id", authMiddleware, adminMiddleware, userController.getUser)
router.put("/:id", authMiddleware, userController.update)
router.delete("/:id", authMiddleware, adminMiddleware, userController.deleteUser)

module.exports = router;