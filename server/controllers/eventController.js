const { getMockEvents, saveMockEvents } = require('../utils/mockPersistence');

// @desc    Get current events for voting
exports.getEvents = async (req, res) => {
    try {
        const events = await getMockEvents();
        res.json(events);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

// @desc    Add an event (Admin)
exports.addEvent = async (req, res) => {
    try {
        const { title, description } = req.body;
        const events = await getMockEvents();
        const newEvent = {
            id: Date.now().toString(),
            title,
            description,
            votes: [],
            status: 'open', // open, closed
            createdAt: new Date().toISOString()
        };
        events.unshift(newEvent);
        await saveMockEvents(events);
        return res.json(newEvent);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

// @desc    Vote for an event (Student)
exports.voteEvent = async (req, res) => {
    try {
        const events = await getMockEvents();
        const index = events.findIndex(e => e.id === req.params.id);
        if (index !== -1) {
            if (events[index].votes.includes(req.user.id)) {
                return res.status(400).json({ msg: "Already voted" });
            }
            events[index].votes.push(req.user.id);
            await saveMockEvents(events);
            return res.json(events[index]);
        }
        return res.status(404).json({ msg: "Event not found" });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};
