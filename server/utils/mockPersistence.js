const { db } = require('./firebase');

// Bridge to Firebase Realtime Database
const getCollection = async (collectionName) => {
    const snapshot = await db.ref(collectionName).once('value');
    const data = snapshot.val();
    if (!data) return [];
    // Convert object to array if it's stored as an object (standard Firebase behavior)
    return Object.keys(data).map(key => ({
        ...data[key],
        id: data[key].id || key
    }));
};

const saveData = async (collectionName, data) => {
    // We overwrite the entire collection for compatibility with existing code flow
    // In a real optimized Firebase app, we would use push/update
    await db.ref(collectionName).set(data);
};

module.exports = {
    // Users
    getMockUsers: async () => await getCollection('users'),
    saveMockUsers: async (users) => await saveData('users', users),

    // Waste
    getMockWaste: async () => await getCollection('waste'),
    saveMockWaste: async (waste) => await saveData('waste', waste),

    // Menus
    getMockMenus: async () => await getCollection('menus'),
    saveMockMenus: async (menus) => await saveData('menus', menus),

    // Feedbacks
    getMockFeedbacks: async () => await getCollection('feedbacks'),
    saveMockFeedbacks: async (feedbacks) => await saveData('feedbacks', feedbacks),

    // Meals
    getMockMeals: async () => await getCollection('meals'),
    saveMockMeals: async (meals) => await saveData('meals', meals),

    // Notifications
    getMockNotifications: async () => await getCollection('notifications'),
    saveMockNotifications: async (notifications) => await saveData('notifications', notifications),

    // Complaints
    getMockComplaints: async () => await getCollection('complaints'),
    saveMockComplaints: async (complaints) => await saveData('complaints', complaints),

    // Events
    getMockEvents: async () => await getCollection('events'),
    saveMockEvents: async (events) => await saveData('events', events),

    // Attendance
    getMockAttendance: async () => await getCollection('attendance'),
    saveMockAttendance: async (attendance) => await saveData('attendance', attendance)
};
