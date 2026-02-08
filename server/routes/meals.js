const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// In-Memory Storage (Mock Database)
let meals = [
    {
        _id: '1',
        name: 'Idli & Sambar',
        category: 'Breakfast',
        type: 'Veg',
        imageUrl: '',
        nutritionalInfo: { calories: 150, protein: 4 },
        ratingWindow: { startTime: '07:00', endTime: '10:00' }
    },
    {
        _id: '2',
        name: 'Chicken Biryani',
        category: 'Lunch',
        type: 'Non-Veg',
        imageUrl: '',
        nutritionalInfo: { calories: 450, protein: 25 },
        ratingWindow: { startTime: '12:00', endTime: '14:00' }
    }
];

// @route   GET api/meals
// @desc    Get all meals
router.get('/', (req, res) => {
    res.json(meals);
});

// @route   POST api/meals
// @desc    Create a meal
router.post('/', upload.single('image'), (req, res) => {
    const { name, category, type, calories, protein, startTime, endTime } = req.body;

    const newMeal = {
        _id: Date.now().toString(),
        name,
        category,
        type,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
        nutritionalInfo: {
            calories: Number(calories) || 0,
            protein: Number(protein) || 0
        },
        ratingWindow: {
            startTime: startTime || '12:00',
            endTime: endTime || '14:00'
        }
    };

    meals.push(newMeal);
    res.json(newMeal);
});

// @route   PUT api/meals/:id
// @desc    Update a meal
router.put('/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, category, type, calories, protein, startTime, endTime } = req.body;

    const index = meals.findIndex(m => m._id === id);
    if (index === -1) return res.status(404).json({ msg: 'Meal not found' });

    const updatedMeal = {
        ...meals[index],
        name: name || meals[index].name,
        category: category || meals[index].category,
        type: type || meals[index].type,
        nutritionalInfo: {
            calories: calories ? Number(calories) : meals[index].nutritionalInfo.calories,
            protein: protein ? Number(protein) : meals[index].nutritionalInfo.protein
        },
        ratingWindow: {
            startTime: startTime || meals[index].ratingWindow.startTime,
            endTime: endTime || meals[index].ratingWindow.endTime
        }
    };

    if (req.file) {
        updatedMeal.imageUrl = `/uploads/${req.file.filename}`;
    }

    meals[index] = updatedMeal;
    res.json(updatedMeal);
});

// @route   DELETE api/meals/:id
// @desc    Delete a meal
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    meals = meals.filter(m => m._id !== id);
    res.json({ msg: 'Meal removed' });
});

module.exports = router;
