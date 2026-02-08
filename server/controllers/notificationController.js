const { getMockNotifications, saveMockNotifications } = require('../utils/mockPersistence');

// @desc    Get all notifications
exports.getNotifications = async (req, res) => {
    try {
        if (process.env.MOCK_DB === 'true') {
            return res.json(getMockNotifications());
        }
        res.json([]);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

// @desc    Add notification (Admin)
exports.addNotification = async (req, res) => {
    try {
        const { message, type } = req.body;
        if (process.env.MOCK_DB === 'true') {
            const notifications = getMockNotifications();
            const newNotif = {
                id: Date.now().toString(),
                message,
                type: type || 'info', // info, success, warning, danger
                createdAt: new Date().toISOString()
            };
            notifications.unshift(newNotif);
            saveMockNotifications(notifications.slice(0, 50)); // Keep last 50
            return res.json(newNotif);
        }
        res.json({ msg: "Not available in production mode yet" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};
