const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { getMockUsers, saveMockUsers } = require('../utils/mockPersistence');

// @desc    Get all students
exports.getAllStudents = async (req, res) => {
    try {
        if (process.env.MOCK_DB === 'true') {
            const users = getMockUsers().filter(u => u.role === 'student');
            return res.json(users);
        }

        const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
        res.json(students);
    } catch (err) {
        console.error("Get All Students Error:", err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new student
exports.createStudent = async (req, res) => {
    try {
        const { name, email, password, rollNumber, hostelBlock, roomNumber, department, year } = req.body;

        if (process.env.MOCK_DB === 'true') {
            const users = getMockUsers();
            const exists = users.find(s => s.email === email);
            if (exists) return res.status(400).json({ msg: 'Student already exists' });

            const salt = await bcrypt.genSalt(10);
            // Ensure password is a string
            const passStr = (password || '123456').toString();
            const hashedPassword = await bcrypt.hash(passStr, salt);

            const newStudent = {
                _id: Date.now().toString(),
                name,
                email,
                password: hashedPassword,
                role: 'student',
                rollNumber,
                hostelBlock,
                roomNumber,
                department,
                year,
                createdAt: new Date()
            };
            users.unshift(newStudent);
            saveMockUsers(users);
            return res.json(newStudent);
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Student already exists with this email' });
        }

        user = new User({
            name,
            email,
            password,
            role: 'student',
            rollNumber,
            hostelBlock,
            roomNumber,
            department,
            year
        });

        const salt = await bcrypt.genSalt(10);
        // Ensure password is a string
        const passStr = (password || '123456').toString();
        user.password = await bcrypt.hash(passStr, salt);

        await user.save();
        res.json(user);
    } catch (err) {
        console.error("Create Student Error:", err.message);
        res.status(500).send('Server Error');
    }
};

// Bulk Insert Students
exports.bulkCreateStudents = async (req, res) => {
    try {
        const { students } = req.body;
        if (!students || !Array.isArray(students)) {
            return res.status(400).json({ msg: "Invalid student data provided" });
        }

        if (process.env.MOCK_DB === 'true') {
            const existingUsers = getMockUsers();

            const newStudents = await Promise.all(students.map(async s => {
                const salt = await bcrypt.genSalt(10);
                // CRITICAL: Ensure password is a string (Excel might send it as a number)
                const passStr = (s.password || '123456').toString();
                const hashedPassword = await bcrypt.hash(passStr, salt);
                return {
                    _id: Math.random().toString(36).substr(2, 9),
                    ...s,
                    password: hashedPassword,
                    role: 'student',
                    createdAt: new Date()
                };
            }));

            const updatedUsers = [...newStudents, ...existingUsers];
            saveMockUsers(updatedUsers);
            console.log(`[Bulk] Imported ${newStudents.length} students in Mock Mode`);
            return res.json({ msg: `${newStudents.length} students imported successfully` });
        }

        // Real MongoDB Bulk Insert logic
        const hashedStudents = await Promise.all(students.map(async s => {
            const salt = await bcrypt.genSalt(10);
            const passStr = (s.password || '123456').toString();
            const hashedPassword = await bcrypt.hash(passStr, salt);
            return { ...s, password: hashedPassword, role: 'student' };
        }));

        await User.insertMany(hashedStudents);
        res.json({ msg: 'Bulk import successful' });
    } catch (err) {
        console.error("Bulk Import Error:", err.message);
        res.status(500).json({ msg: 'Bulk import failed: ' + err.message });
    }
}

// @desc    Update student
exports.updateStudent = async (req, res) => {
    try {
        const { name, email, rollNumber, hostelBlock, roomNumber, password, department, year } = req.body;

        if (process.env.MOCK_DB === 'true') {
            const users = getMockUsers();
            const index = users.findIndex(s => s._id === req.params.id);
            if (index === -1) return res.status(404).json({ msg: 'Student not found' });

            users[index] = {
                ...users[index],
                name: name || users[index].name,
                email: email || users[index].email,
                rollNumber: rollNumber || users[index].rollNumber,
                hostelBlock: hostelBlock || users[index].hostelBlock,
                roomNumber: roomNumber || users[index].roomNumber,
                department: department || users[index].department,
                year: year || users[index].year
            };

            if (password) {
                const salt = await bcrypt.genSalt(10);
                users[index].password = await bcrypt.hash(password.toString(), salt);
            }

            saveMockUsers(users);
            return res.json(users[index]);
        }

        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'Student not found' });

        const userFields = { name, email, rollNumber, hostelBlock, roomNumber, department, year };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            userFields.password = await bcrypt.hash(password.toString(), salt);
        }

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: userFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error("Update Student Error:", err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete student
exports.deleteStudent = async (req, res) => {
    try {
        if (process.env.MOCK_DB === 'true') {
            const users = getMockUsers();
            const updatedUsers = users.filter(s => s._id !== req.params.id);
            saveMockUsers(updatedUsers);
            return res.json({ msg: 'Student removed' });
        }

        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'Student not found' });

        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Student removed' });
    } catch (err) {
        console.error("Delete Student Error:", err.message);
        res.status(500).send('Server Error');
    }
};
