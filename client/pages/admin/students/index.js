import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Toaster, toast } from 'react-hot-toast';
import { ArrowLeft, Plus, Search, Trash2, Edit2, User, Building, MapPin, Hash, FileSpreadsheet, Upload, Info, X } from 'lucide-react';
import StudentModal from '../../../components/admin/students/StudentModal';
import * as XLSX from 'xlsx';

export default function StudentManagement() {
    const router = useRouter();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        const results = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(results);
    }, [searchTerm, students]);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/students`, {
                headers: { 'x-auth-token': token }
            });
            setStudents(res.data);
            setFilteredStudents(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load students');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this student?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`"+process.env.NEXT_PUBLIC_API_URL+"/api/students/${id}`, {
                headers: { 'x-auth-token': token }
            });
            toast.success('Student removed successfully');
            fetchStudents();
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete student');
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            {
                Name: "Full Name Here",
                Email: "student@example.com",
                Password: "password123",
                RollNumber: "24CS001",
                HostelBlock: "A Block",
                RoomNumber: "101",
                Department: "CSE",
                Year: "III"
            }
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "Student_Import_Template.xlsx");
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                console.log("Raw Excel Data:", data);

                // Better mapping function to handle variations and whitespace
                const studentsToImport = data.map(row => {
                    // Normalize keys to lowercase for easier lookup
                    const normalizedRow = {};
                    Object.keys(row).forEach(key => {
                        normalizedRow[key.toString().trim().toLowerCase()] = row[key];
                    });

                    return {
                        name: normalizedRow.name || normalizedRow['full name'] || normalizedRow['student name'],
                        email: normalizedRow.email || normalizedRow['email id'] || normalizedRow['email address'],
                        password: normalizedRow.password || normalizedRow.pass || '123456',
                        rollNumber: normalizedRow.rollnumber || normalizedRow['roll no'] || normalizedRow['reg no'],
                        hostelBlock: normalizedRow.hostelblock || normalizedRow['hostel'] || normalizedRow['block'],
                        roomNumber: normalizedRow.roomnumber || normalizedRow['room no'] || normalizedRow['room'],
                        department: normalizedRow.department || normalizedRow.dept || normalizedRow.branch,
                        year: normalizedRow.year || normalizedRow.yr
                    };
                }).filter(s => s.name && s.email);

                console.log("Parsed Students:", studentsToImport);

                if (studentsToImport.length === 0) {
                    console.log("No students found. Rows were:", data);
                    return toast.error("No valid student data found in Excel. Check column headers.");
                }

                const token = localStorage.getItem('token');
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/students/bulk`,
                    { students: studentsToImport },
                    { headers: { 'x-auth-token': token } }
                );

                toast.success(`Successfully imported ${studentsToImport.length} students`);
                setIsBulkModalOpen(false);
                fetchStudents();
            } catch (err) {
                console.error("Bulk Import Error:", err);
                if (err.message === "Network Error") {
                    toast.error("Network Error: Cannot connect to server. Ensure backend is running at 127.0.0.1:5002");
                } else {
                    toast.error("Import failed: " + (err.response?.data?.msg || err.message));
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Toaster position="top-right" />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                Student Management
                            </h1>
                            <p className="text-xs text-gray-500">Manage student accounts and bulk imports</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 transition shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="bg-white border border-green-500 text-green-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-green-50 transition flex items-center"
                        >
                            <FileSpreadsheet size={16} className="mr-2" /> Bulk Import
                        </button>
                        <button
                            onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition flex items-center"
                        >
                            <Plus size={16} className="mr-2" /> Add Student
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto p-6">
                {loading ? (
                    <div className="text-center py-10 text-gray-400 font-medium">Loading students...</div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Profile</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Roll Number</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hostel Allocation</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dept / Year</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <tr key={student._id} className="hover:bg-blue-50/30 transition group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                                                            {student.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-gray-900">{student.name}</div>
                                                            <div className="text-xs text-gray-500">{student.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200">
                                                        {student.rollNumber || 'Not assigned'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-semibold text-gray-700 flex items-center bg-blue-50 w-fit px-2 rounded-full py-0.5 border border-blue-100">
                                                            <Building size={12} className="mr-1 text-blue-500" /> {student.hostelBlock || '-'}
                                                        </span>
                                                        <span className="text-xs text-gray-500 flex items-center ml-1">
                                                            <MapPin size={12} className="mr-1" /> Room {student.roomNumber || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-xs text-gray-700 font-medium">
                                                        {student.department || '-'} / {student.year || '-'} Yr
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => { setEditingStudent(student); setIsModalOpen(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition mr-2">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(student._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-16 text-center text-gray-400">
                                                <div className="flex flex-col items-center">
                                                    <Search size={48} className="mb-4 opacity-20" />
                                                    <p className="font-medium italic">No students found matching your criteria.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Bulk Import Modal */}
            {isBulkModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                <FileSpreadsheet className="mr-3 text-green-500" /> Bulk Student Import
                            </h2>
                            <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition"><X /></button>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-sm font-bold text-blue-800 flex items-center">
                                    <Info size={16} className="mr-2" /> Required Excel Format
                                </h3>
                                <button
                                    onClick={downloadTemplate}
                                    className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded font-bold hover:bg-blue-700 transition"
                                >
                                    Download Template
                                </button>
                            </div>
                            <p className="text-xs text-blue-700 mb-2">Columns must follow this exact order or header names:</p>
                            <div className="bg-white/50 p-2 rounded text-[10px] font-mono text-blue-900 border border-blue-100">
                                Name | Email | Password | RollNumber | HostelBlock | RoomNumber | Department | Year
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer" onClick={() => fileInputRef.current.click()}>
                            <div className="bg-blue-100 p-4 rounded-full mb-4">
                                <Upload className="text-blue-600" size={32} />
                            </div>
                            <p className="font-bold text-gray-700">Click to Upload Excel File</p>
                            <p className="text-xs text-gray-500 mt-1">Supports .xlsx and .xls formats</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".xlsx, .xls"
                                onChange={handleFileUpload}
                            />
                        </div>

                        <button
                            onClick={() => setIsBulkModalOpen(false)}
                            className="mt-6 w-full py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <StudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={fetchStudents}
                student={editingStudent}
            />
        </div>
    );
}
