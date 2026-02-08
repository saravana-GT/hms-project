const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { getNotifications, addNotification } = require('../controllers/notificationController');

router.get('/', auth, getNotifications);
router.post('/', auth, admin, addNotification);

module.exports = router;
