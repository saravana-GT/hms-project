const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

// Connect to DB
mongoose.connect('mongodb://127.0.0.1:27017/hms_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => {
        console.error('DB Connection Error:', err);
        process.exit(1);
    });

const seedUsers = async () => {
    try {
        // Clear existing users to avoid duplicates
        await User.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const users = [
            {
                name: 'Admin User',
                email: 'admin@hms.com',
                password: hashedPassword,
                role: 'admin'
            },
            {
                name: 'Student User',
                email: 'student@hms.com',
                password: hashedPassword,
                role: 'student',
                rollNumber: 'CS101'
            }
        ];

        await User.insertMany(users);
        console.log('Users Seeded Successfully!');
        console.log('Admin: admin@hms.com / 123456');
        console.log('Student: student@hms.com / 123456');
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedUsers();
