const { getMockNotifications, saveMockNotifications } = require('../utils/mockPersistence');

// @desc    Get all notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await getMockNotifications();
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

// @desc    Add notification (Admin)
exports.addNotification = async (req, res) => {
    try {
        const { message, type } = req.body;
        const notifications = await getMockNotifications();
        const newNotif = {
            id: Date.now().toString(),
            message,
            type: type || 'info', // info, success, warning, danger
            createdAt: new Date().toISOString()
        };
        notifications.unshift(newNotif);
        await saveMockNotifications(notifications.slice(0, 50)); // Keep last 50
        return res.json(newNotif);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};
