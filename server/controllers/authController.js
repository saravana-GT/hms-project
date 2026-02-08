const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getMockUsers, saveMockUsers } = require('../utils/mockPersistence');

// Register User
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (process.env.MOCK_DB === 'true' || true) { // Force use of Firebase bridge
            const users = await getMockUsers();
            const exists = users.find(u => u.email === email);
            if (exists) return res.status(400).json({ msg: 'User already exists' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = {
                _id: Date.now().toString(),
                name,
                email,
                password: hashedPassword,
                role: role || 'student',
                createdAt: new Date()
            };
            users.push(newUser);
            await saveMockUsers(users);
            return res.status(201).json({ msg: 'User registered successfully (Firebase)' });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            rollNumber: req.body.rollNumber // Optional if student
        });

        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Login User
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // --- DEMO MODE BYPASS (For when DB is not connected) ---
        if (email === 'admin@hms.com' && password === '123456') {
            const payload = { user: { id: 'demo_admin_id', role: 'admin' } };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 });
            console.log(`[Auth] Admin logged in: ${email}`);
            return res.json({ token, user: { id: 'demo_admin_id', name: 'Demo Admin', role: 'admin' } });
        }
        if (email === 'student@hms.com' && password === '123456') {
            const payload = { user: { id: 'demo_student_id', role: 'student' } };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 });
            return res.json({ token, user: { id: 'demo_student_id', name: 'Demo Student', role: 'student' } });
        }

        // Support login for students in Firebase
        if (process.env.MOCK_DB === 'true' || true) {
            const users = await getMockUsers();
            const user = users.find(u => u.email === email);

            if (user) {
                // If password exists in mock, verify it
                if (user.password) {
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });
                }

                const payload = { user: { id: user._id, role: user.role } };
                const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 });
                return res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
            }
        }
        // -------------------------------------------------------

        if (process.env.MOCK_DB === 'true') {
            return res.status(400).json({ msg: 'Invalid Credentials (Mock Mode: Use provided demo accounts or any email with password)' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
