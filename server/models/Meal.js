const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['Main Course', 'Side Dish', 'Starter', 'Beverage'], required: true },
    type: { type: String, enum: ['Veg', 'Non-Veg', 'Egg'], required: true },
    imageUrl: { type: String, default: '' },
    nutritionalInfo: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 }
    },
    // For admin to determine when ratings are allowed
    ratingWindow: {
        startTime: { type: String, default: '12:00' }, // e.g. "12:00"
        endTime: { type: String, default: '14:00' }    // e.g. "14:00"
    },
    avgRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    wastePercentage: { type: Number, default: 0 } // Mock stat for now
});

module.exports = mongoose.model('Meal', MealSchema);
