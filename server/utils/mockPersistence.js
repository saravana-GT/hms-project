const fs = require('fs');
const path = require('path');
const { db, isInitialized } = require('./firebase');

const MOCK_FILE = path.join(__dirname, '../data/mock_db.json');

const readLocal = () => {
    try {
        if (!fs.existsSync(MOCK_FILE)) return {};
        return JSON.parse(fs.readFileSync(MOCK_FILE, 'utf-8'));
    } catch (e) { return {}; }
};

const writeLocal = (data) => {
    try {
        const fullPath = path.dirname(MOCK_FILE);
        if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
        fs.writeFileSync(MOCK_FILE, JSON.stringify(data, null, 2));
    } catch (e) { console.error("Local save failed", e); }
};

const getCollection = async (collectionName) => {
    if (isInitialized && db) {
        try {
            const snapshot = await db.ref(collectionName).once('value');
            const data = snapshot.val();
            if (!data) return [];
            return Array.isArray(data) ? data : Object.keys(data).map(key => ({ ...data[key], id: data[key].id || key }));
        } catch (e) {
            console.log(`[Firebase] Fetch error for ${collectionName}: ${e.message}`);
        }
    }

    return readLocal()[collectionName] || [];
};

const saveData = async (collectionName, data) => {
    if (isInitialized && db) {
        try {
            await db.ref(collectionName).set(data);
            return;
        } catch (e) {
            console.log(`[Firebase] Save error for ${collectionName}: ${e.message}`);
        }
    }

    const fullData = readLocal();
    fullData[collectionName] = data;
    writeLocal(fullData);
};

module.exports = {
    getMockUsers: async () => await getCollection('users'),
    saveMockUsers: async (users) => await saveData('users', users),
    getMockWaste: async () => await getCollection('waste'),
    saveMockWaste: async (waste) => await saveData('waste', waste),
    getMockMenus: async () => await getCollection('menus'),
    saveMockMenus: async (menus) => await saveData('menus', menus),
    getMockFeedbacks: async () => await getCollection('feedbacks'),
    saveMockFeedbacks: async (feedbacks) => await saveData('feedbacks', feedbacks),
    getMockMeals: async () => await getCollection('meals'),
    saveMockMeals: async (meals) => await saveData('meals', meals),
    getMockNotifications: async () => await getCollection('notifications'),
    saveMockNotifications: async (notifications) => await saveData('notifications', notifications),
    getMockComplaints: async () => await getCollection('complaints'),
    saveMockComplaints: async (complaints) => await saveData('complaints', complaints),
    getMockEvents: async () => await getCollection('events'),
    saveMockEvents: async (events) => await saveData('events', events),
    getMockAttendance: async () => await getCollection('attendance'),
    saveMockAttendance: async (attendance) => await saveData('attendance', attendance)
};
