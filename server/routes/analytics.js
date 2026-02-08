const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { getMockFeedbacks, getMockWaste, getMockAttendance, getMockUsers } = require('../utils/mockPersistence');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/predict', auth, admin, async (req, res) => {
    try {
        const feedbacks = await getMockFeedbacks();
        const waste = await getMockWaste();
        const attendance = await getMockAttendance();
        const users = await getMockUsers();

        const data = {
            feedbacks,
            waste,
            attendance,
            student_count: users.filter(u => u.role === 'student').length || 200
        };

        // Create a temporary file for the Python script to read
        const tempFilePath = path.join(__dirname, '../data/temp_input.json');
        fs.writeFileSync(tempFilePath, JSON.stringify(data));

        const pythonScriptPath = path.join(__dirname, '../../ai_engine/predictor.py');

        // Spawn Python process
        const pythonProcess = spawn('python', [pythonScriptPath, tempFilePath]);

        let resultData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            // Clean up temp file
            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

            if (code !== 0) {
                console.error(`Python script error (code ${code}):`, errorData);
                return res.status(500).json({ msg: "Prediction Engine Error", error: errorData });
            }

            try {
                const prediction = JSON.parse(resultData);
                res.json(prediction);
            } catch (err) {
                console.error("Failed to parse Python output:", resultData);
                res.status(500).json({ msg: "Failed to parse prediction result" });
            }
        });

    } catch (err) {
        console.error("Analytics Error:", err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;
