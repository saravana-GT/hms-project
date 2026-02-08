const express = require('express');
const router = express.Router();
const { getMockFeedbacks, saveMockFeedbacks } = require('../utils/mockPersistence');

const auth = require('../middleware/auth');

// @route   GET api/feedback
// @desc    Get all feedback
router.get('/', async (req, res) => {
    res.json(await getMockFeedbacks());
});

// @route   POST api/feedback
// @desc    Submit feedback
router.post('/', auth, async (req, res) => {
    const { mealType, rating, comment, photo, mealName } = req.body;

    const feedbacks = await getMockFeedbacks();
    const newFeedback = {
        id: Date.now(),
        studentId: req.user.id, // Store who gave the feedback
        dateStr: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        mealType,
        rating: Number(rating),
        comment,
        photo,
        mealName,
        timestamp: new Date().toISOString()
    };

    feedbacks.unshift(newFeedback);
    await saveMockFeedbacks(feedbacks);
    res.status(201).json(newFeedback);
});

module.exports = router;
