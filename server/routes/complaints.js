const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { getComplaints, addComplaint, resolveComplaint } = require('../controllers/complaintController');

router.get('/', auth, admin, getComplaints);
router.post('/', auth, addComplaint);
router.put('/:id/resolve', auth, admin, resolveComplaint);

module.exports = router;
