const Meal = require('../models/Meal');
const { getMockMeals, saveMockMeals, getMockMenus, saveMockMenus } = require('../utils/mockPersistence');

// Get all meals
exports.getAllMeals = async (req, res) => {
    if (process.env.MOCK_DB === 'true') {
        return res.json(getMockMeals());
    }

    try {
        const meals = await Meal.find();
        res.json(meals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Add new meal (Admin only)
exports.addMeal = async (req, res) => {
    const { name, category, type, imageUrl, nutritionalInfo } = req.body;

    if (process.env.MOCK_DB === 'true') {
        const meals = getMockMeals();
        const newMeal = {
            _id: Date.now().toString(),
            name,
            category,
            type,
            imageUrl,
            nutritionalInfo,
            createdAt: new Date()
        };
        meals.push(newMeal);
        saveMockMeals(meals);
        return res.json(newMeal);
    }

    try {
        const newMeal = new Meal({
            name,
            category,
            type,
            imageUrl,
            nutritionalInfo
        });
        const meal = await newMeal.save();
        res.json(meal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Create a Menu (Admin only)
exports.createMenu = async (req, res) => {
    const { date, dayOfWeek, meals } = req.body;

    if (process.env.MOCK_DB === 'true') {
        const menus = getMockMenus();
        const index = menus.findIndex(m => m.date === date);
        const newMenu = {
            _id: Date.now().toString(),
            date,
            dayOfWeek,
            meals
        };
        if (index !== -1) menus[index] = newMenu;
        else menus.push(newMenu);

        saveMockMenus(menus);
        return res.json(newMenu);
    }

    try {
        const newMenu = new Menu({
            date,
            dayOfWeek,
            meals
        });
        const menu = await newMenu.save();
        res.json(menu);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
