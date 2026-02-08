require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Enabled for Real Mode

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize MOCK_DB state
process.env.MOCK_DB = 'true';

// Connect Database
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hms_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // 5 seconds timeout
})
    .then(() => {
        console.log('✅ MongoDB Connected');
        process.env.MOCK_DB = 'false';
    })
    .catch(err => {
        console.log('❌ MongoDB Connection Error:', err.message);
        console.log('⚠️  SWITCHING TO MOCK MODE (IN-MEMORY STORAGE) ⚠️');
        process.env.MOCK_DB = 'true';
    });

// Middleware
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// console.log('⚠️  RUNNING IN MOCK MODE (NO DATABASE) ⚠️');

// Routes
app.use('/api/auth', require('./routes/auth')); // Might break if auth uses DB, but we are testing menu
app.use('/api/meals', require('./routes/meals'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/students', require('./routes/students'));
app.use('/api/waste', require('./routes/waste'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/events', require('./routes/events'));
app.use('/api/analytics', require('./routes/analytics'));

// Mark Meal as Eaten
app.post('/api/attendance', require('./middleware/auth'), (req, res) => {
    const { mealType, dateStr } = req.body;
    const { getMockAttendance, saveMockAttendance } = require('./utils/mockPersistence');

    let attendance = getMockAttendance();
    const existing = attendance.find(a => a.studentId === req.user.id && a.dateStr === dateStr && a.mealType === mealType);

    if (existing) {
        return res.status(400).json({ msg: "Already marked as eaten" });
    }

    const newEntry = {
        id: Date.now().toString(),
        studentId: req.user.id,
        mealType,
        dateStr,
        createdAt: new Date().toISOString()
    };

    attendance.unshift(newEntry);
    saveMockAttendance(attendance);
    res.json(newEntry);
});

// Mock Stats and Gamification endpoint
app.get('/api/student-stats', require('./middleware/auth'), (req, res) => {
    const { getMockFeedbacks, getMockAttendance, getMockEvents } = require('./utils/mockPersistence');
    const allFeedbacks = getMockFeedbacks();
    const studentFeedbacks = allFeedbacks.filter(f => f.studentId === req.user.id);
    const feedbackCount = studentFeedbacks.length;

    const allAttendance = getMockAttendance();
    const studentAttendance = allAttendance.filter(a => a.studentId === req.user.id);
    const eatenCount = studentAttendance.length;

    const allEvents = getMockEvents();
    const voteCount = allEvents.filter(e => e.votes.includes(req.user.id)).length;

    // Calculate REAL average for this student
    const totalRating = studentFeedbacks.reduce((sum, f) => sum + f.rating, 0);
    const avgRating = feedbackCount > 0 ? (totalRating / feedbackCount).toFixed(1) : 0;

    // Calculate Skipped Meals
    // Logic: If it's Sunday (day 0 of week), and we've had say 20 meals available so far this week
    const dayOfWeek = new Date().getDay(); // 0-6
    const potentialMealsSoFar = (dayOfWeek + 1) * 3; // roughly 3 meals per day
    const missedMeals = Math.max(0, potentialMealsSoFar - eatenCount);

    // Logic for Gamification badges
    const badges = [];
    if (feedbackCount >= 1) badges.push({ name: 'Active Voter', icon: '🗳️', desc: 'First feedback submitted' });
    if (feedbackCount >= 5) badges.push({ name: 'Food Critic', icon: '🥇', desc: '5+ reviews submitted' });
    if (feedbackCount >= 10) badges.push({ name: 'Pro Reviewer', icon: '🏆', desc: '10+ reviews submitted' });

    // Points System: 20 per feedback, 10 per vote, 50 bonus for first feedback
    const points = (feedbackCount * 20) + (voteCount * 10) + (feedbackCount > 0 ? 50 : 0);

    res.json({
        userId: req.user.id,
        username: req.user.name || 'Student',
        mealsEaten: eatenCount,
        missedMeals: missedMeals,
        avgRating: avgRating,
        calories: (eatenCount * 650) + ' kcal', // Based on eaten meals
        points: points,
        badges: badges,
        eatenToday: studentAttendance.filter(a => a.dateStr === new Date().toISOString().split('T')[0]).map(a => a.mealType)
    });
});

// Simple Test Route
app.get('/', (req, res) => {
    res.send('HMS Backend is running (MOCK MODE)...');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
