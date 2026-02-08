import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, Save, User, Mail, Lock, Hash, Building, MapPin, Plus } from 'lucide-react';

export default function StudentModal({ isOpen, onClose, onSave, student }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        rollNumber: '',
        hostelBlock: '',
        roomNumber: '',
        department: '',
        year: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name || '',
                email: student.email || '',
                password: '', // Don't show password
                rollNumber: student.rollNumber || '',
                hostelBlock: student.hostelBlock || '',
                roomNumber: student.roomNumber || '',
                department: student.department || '',
                year: student.year || ''
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                rollNumber: '',
                hostelBlock: '',
                roomNumber: '',
                department: '',
                year: ''
            });
        }
    }, [student, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            };

            if (student) {
                // Update
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password; // Don't send empty password

                await axios.put(`process.env.NEXT_PUBLIC_API_URL/api/students/${student._id}`, updateData, config);
                toast.success('Student updated successfully');
            } else {
                // Create
                await axios.post('process.env.NEXT_PUBLIC_API_URL/api/students', formData, config);
                toast.success('Student created successfully');
            }
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.msg || 'Failed to save student';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {student ? <User size={20} /> : <Plus size={20} />}
                        {student ? 'Edit Student Details' : 'Add New Student'}
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Personal Info */}
                        <div className="col-span-full">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Personal Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="pl-9 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="pl-9 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {student ? 'New Password (leave blank to keep current)' : 'Password'}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={!student}
                                    minLength={6}
                                    className="pl-9 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Academic Info */}
                        <div className="col-span-full border-t border-gray-100 pt-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Academic & Hostel</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            name="rollNumber"
                                            value={formData.rollNumber}
                                            onChange={handleChange}
                                            required
                                            className="pl-9 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            placeholder="CS21B101"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        placeholder="Computer Science"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Block</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                        <select
                                            name="hostelBlock"
                                            value={formData.hostelBlock}
                                            onChange={handleChange}
                                            className="pl-9 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        >
                                            <option value="">Select Block</option>
                                            <option value="A Block">A Block (Boys)</option>
                                            <option value="B Block">B Block (Boys)</option>
                                            <option value="C Block">C Block (Girls)</option>
                                            <option value="D Block">D Block (Girls)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            name="roomNumber"
                                            value={formData.roomNumber}
                                            onChange={handleChange}
                                            className="pl-9 w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            placeholder="101"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    {student ? 'Update Student' : 'Create Student'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


