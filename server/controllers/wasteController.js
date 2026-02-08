const { getMockWaste, saveMockWaste } = require('../utils/mockPersistence');

// @desc    Get all waste data
// @route   GET api/waste
exports.getWaste = async (req, res) => {
    try {
        if (process.env.MOCK_DB === 'true') {
            return res.json(getMockWaste());
        }
        res.json([]);
    } catch (err) {
        console.error("Error in getWaste:", err.message);
        res.status(500).json({ msg: "Server Error" });
    }
};

// @desc    Add waste entry
// @route   POST api/waste
exports.addWaste = async (req, res) => {
    try {
        const { date, amount } = req.body;

        if (!amount) {
            return res.status(400).json({ msg: "Amount is required" });
        }

        if (process.env.MOCK_DB === 'true') {
            const waste = getMockWaste();
            const newEntry = {
                id: Date.now().toString(),
                date: date || new Date().toISOString().split('T')[0],
                amount: parseFloat(amount)
            };

            if (isNaN(newEntry.amount)) {
                return res.status(400).json({ msg: "Amount must be a number" });
            }

            waste.push(newEntry);
            saveMockWaste(waste);
            console.log(`[Waste] New entry saved: ${newEntry.amount} kg on ${newEntry.date}`);
            return res.json(newEntry);
        }

        res.status(200).json({ msg: 'Waste recorded' });
    } catch (err) {
        console.error("Error in addWaste:", err.message);
        res.status(500).json({ msg: "Server Error" });
    }
};
