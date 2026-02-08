const fs = require('fs');
const path = require('path');

const MOCK_FILE = path.join(__dirname, '../data/mock_db.json');

// Ensure data directory exists
const dataDir = path.dirname(MOCK_FILE);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initial structure if file doesn't exist
if (!fs.existsSync(MOCK_FILE)) {
    fs.writeFileSync(MOCK_FILE, JSON.stringify({
        users: [],
        waste: [],
        menus: [],
        feedbacks: [],
        meals: [],
        notifications: [],
        complaints: [],
        events: []
    }, null, 2));
}

const readData = () => {
    try {
        const content = fs.readFileSync(MOCK_FILE, 'utf-8');
        const data = JSON.parse(content);
        // Ensure all keys exist
        return {
            users: data.users || [],
            waste: data.waste || [],
            menus: data.menus || [],
            feedbacks: data.feedbacks || [],
            meals: data.meals || [],
            notifications: data.notifications || [],
            complaints: data.complaints || [],
            events: data.events || [],
            attendance: data.attendance || []
        };
    } catch (err) {
        console.error("Error reading mock DB:", err);
        return { users: [], waste: [], menus: [], feedbacks: [], meals: [], notifications: [], complaints: [], events: [], attendance: [] };
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(MOCK_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing mock DB:", err);
    }
};

module.exports = {
    getMockUsers: () => readData().users,
    saveMockUsers: (users) => {
        const data = readData();
        data.users = users;
        writeData(data);
    },
    getMockWaste: () => readData().waste,
    saveMockWaste: (waste) => {
        const data = readData();
        data.waste = waste;
        writeData(data);
    },
    getMockMenus: () => readData().menus,
    saveMockMenus: (menus) => {
        const data = readData();
        data.menus = menus;
        writeData(data);
    },
    getMockFeedbacks: () => readData().feedbacks,
    saveMockFeedbacks: (feedbacks) => {
        const data = readData();
        data.feedbacks = feedbacks;
        writeData(data);
    },
    getMockMeals: () => readData().meals,
    saveMockMeals: (meals) => {
        const data = readData();
        data.meals = meals;
        writeData(data);
    },
    getMockNotifications: () => readData().notifications,
    saveMockNotifications: (notifications) => {
        const data = readData();
        data.notifications = notifications;
        writeData(data);
    },
    getMockComplaints: () => readData().complaints,
    saveMockComplaints: (complaints) => {
        const data = readData();
        data.complaints = complaints;
        writeData(data);
    },
    getMockEvents: () => readData().events,
    saveMockEvents: (events) => {
        const data = readData();
        data.events = events;
        writeData(data);
    },
    getMockAttendance: () => readData().attendance,
    saveMockAttendance: (attendance) => {
        const data = readData();
        data.attendance = attendance;
        writeData(data);
    }
};
