const { getMockComplaints, saveMockComplaints } = require('../utils/mockPersistence');

// @desc    Get all complaints (Admin)
exports.getComplaints = async (req, res) => {
    try {
        const complaints = await getMockComplaints();
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

// @desc    Submit complaint (Student)
exports.addComplaint = async (req, res) => {
    try {
        const { type, description } = req.body;
        const complaints = await getMockComplaints();
        const newComplaint = {
            id: Date.now().toString(),
            studentId: req.user.id,
            studentName: req.user.name || 'Student',
            type, // Cold Food, Not Cooked, Hygiene, Delay, etc.
            description,
            status: 'pending', // pending, resolved
            createdAt: new Date().toISOString()
        };
        complaints.unshift(newComplaint);
        await saveMockComplaints(complaints);
        return res.json(newComplaint);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

// @desc    Update complaint status (Admin)
exports.resolveComplaint = async (req, res) => {
    try {
        const complaints = await getMockComplaints();
        const index = complaints.findIndex(c => c.id === req.params.id);
        if (index !== -1) {
            complaints[index].status = 'resolved';
            await saveMockComplaints(complaints);
            return res.json(complaints[index]);
        }
        return res.status(404).json({ msg: "Complaint not found" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};
