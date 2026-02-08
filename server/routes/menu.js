const express = require('express');
const router = express.Router();
const { getMockMenus, saveMockMenus } = require('../utils/mockPersistence');

// @route   GET api/menu
// @desc    Get menu
router.get('/', async (req, res) => {
    res.json(await getMockMenus());
});

// @route   POST api/menu
// @desc    Create or Update a menu
router.post('/', async (req, res) => {
    const { date, dayOfWeek, meals } = req.body;
    const menus = await getMockMenus();

    // Find if menu for this date already exists
    const index = menus.findIndex(m => m.date === date);

    const newMenu = {
        _id: Date.now().toString(),
        date,
        dayOfWeek,
        meals // Contains { breakfast: [...], lunch: [...] } with IDs or objects
    };

    if (index !== -1) {
        menus[index] = newMenu;
    } else {
        menus.push(newMenu);
    }

    await saveMockMenus(menus);
    res.json(newMenu);
});

module.exports = router;
