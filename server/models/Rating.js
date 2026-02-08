const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, default: '' },
    imageUrl: { type: String, default: '' }, // For photo feedback
    foodWaste: { type: Boolean, default: false }, // Did they waste food?
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Rating', RatingSchema);
