const express = require('express');
const router = express.Router();
const { getWaste, addWaste } = require('../controllers/wasteController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', auth, admin, getWaste);
router.post('/', auth, admin, addWaste);

module.exports = router;
