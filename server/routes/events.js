const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { getEvents, addEvent, voteEvent } = require('../controllers/eventController');

router.get('/', auth, getEvents);
router.post('/', auth, admin, addEvent);
router.post('/:id/vote', auth, voteEvent);

module.exports = router;
