const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
    meals: {
        breakfast: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }],
        lunch: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }],
        snacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }],
        dinner: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }]
    }
});

module.exports = mongoose.model('Menu', MenuSchema);
