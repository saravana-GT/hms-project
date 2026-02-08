const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
    rollNumber: { type: String, required: function () { return this.role === 'student'; } }, // Only for students
    department: { type: String },
    year: { type: String },
    hostelBlock: { type: String },
    roomNumber: { type: String },
    profilePic: { type: String, default: '' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
