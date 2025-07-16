
const express =  require('express');
const organisationController = require('../controllers/organisationController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

router.get("/", authMiddleware,organisationController.getOrganisation);
router.post("/", authMiddleware, adminMiddleware, organisationController.updateOrganisation);

module.exports = router;