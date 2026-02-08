import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { format } from 'date-fns';
import { Bar, Line } from 'react-chartjs-2';
import FeedbackDetailModal from '../../components/admin/FeedbackDetailModal';
import { Toaster, toast } from 'react-hot-toast';
import {
    Plus, Trash2, Save, X, Bell, AlertOctagon,
    Moon, Zap, ShieldCheck, ChevronRight, MessageSquare,
    Activity, TrendingUp, Users, Coffee, PieChart, CheckCircle, Camera
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    PointElement, LineElement, ArcElement
);

export default function AdminDashboard() {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDayData, setSelectedDayData] = useState(null);
    const [isWasteModalOpen, setIsWasteModalOpen] = useState(false);
    const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);


    // Form States
    const [wasteAmount, setWasteAmount] = useState('');
    const [wasteDate, setWasteDate] = useState(new Date().toISOString().split('T')[0]);
    const [notifMsg, setNotifMsg] = useState('');
    const [notifType, setNotifType] = useState('info');
    const [eventTitle, setEventTitle] = useState('');
    const [eventDesc, setEventDesc] = useState('');

    // Global Data
    const [feedbacks, setFeedbacks] = useState([]);
    const [studentCount, setStudentCount] = useState(0);
    const [wasteData, setWasteData] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Trend Filters (Recovered)
    const [trendDays, setTrendDays] = useState(7);
    const [trendMeal, setTrendMeal] = useState('All');
    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };

            const [feedRes, stuRes, wasteRes, compRes, eventRes, predictRes] = await Promise.all([
                axios.get('http://127.0.0.1:5001/api/feedback'),
                axios.get('http://127.0.0.1:5001/api/students', config),
                axios.get('http://127.0.0.1:5001/api/waste', config),
                axios.get('http://127.0.0.1:5001/api/complaints', config),
                axios.get('http://127.0.0.1:5001/api/events', config),
                axios.get('http://127.0.0.1:5001/api/analytics/predict', config)
            ]);

            setFeedbacks(feedRes.data);
            setStudentCount(stuRes.data.length);
            setWasteData(wasteRes.data);
            setComplaints(compRes.data);
            setEvents(eventRes.data);
            setPrediction(predictRes.data);
            setLoading(false);
        } catch (err) {
            toast.error("Failed to load dashboard");
            setLoading(false);
        }
    };

    const handleLogWaste = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.post('http://127.0.0.1:5001/api/waste', {
                date: wasteDate,
                amount: wasteAmount
            }, config);

            setWasteData([...wasteData, res.data]);
            setIsWasteModalOpen(false);
            setWasteAmount('');
            toast.success('Waste recorded successfully');
        } catch (err) {
            toast.error('Failed to log waste');
        }
    };

    const handleSendNotif = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://127.0.0.1:5001/api/notifications', { message: notifMsg, type: notifType }, { headers: { 'x-auth-token': token } });
            toast.success("Notification sent!");
            setIsNotifModalOpen(false);
            setNotifMsg('');
        } catch (err) { toast.error("Failed to send"); }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://127.0.0.1:5001/api/events', { title: eventTitle, description: eventDesc }, { headers: { 'x-auth-token': token } });
            toast.success("Event created!");
            setIsEventModalOpen(false);
            setEventTitle(''); setEventDesc('');
            fetchData();
        } catch (err) { toast.error("Failed to create event"); }
    };

    const handleResolveComplaint = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://127.0.0.1:5001/api/complaints/${id}/resolve`, {}, { headers: { 'x-auth-token': token } });
            toast.success("Marked as resolved");
            fetchData();
        } catch (err) { toast.error("Failed to update"); }
    };

    // Chart Data Helpers (Recovered)
    const calculateAverage = (items) => {
        if (!items || items.length === 0) return 0;
        return (items.reduce((s, i) => s + i.rating, 0) / items.length).toFixed(1);
    };

    const getTodayStats = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysFeedback = feedbacks.filter(f => f.dateStr === todayStr);
        const meals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
        const ratings = meals.map(meal => calculateAverage(todaysFeedback.filter(f => f.mealType.toLowerCase() === meal.toLowerCase())));
        return { meals, ratings };
    };

    const todayStats = getTodayStats();

    const dailyChartData = {
        labels: todayStats.meals,
        datasets: [{
            label: `Today's Ratings`,
            data: todayStats.ratings,
            backgroundColor: ['rgba(255, 205, 86, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)'],
            borderColor: ['rgb(255, 205, 86)', 'rgb(255, 99, 132)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)'],
            borderWidth: 1,
            borderRadius: 8,
        }],
    };

    const getWasteChartData = () => {
        const labels = [];
        const dataPoints = [];
        const date = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(date);
            d.setDate(d.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
            const dayWaste = wasteData.filter(w => w.date === dStr).reduce((sum, w) => sum + w.amount, 0);
            dataPoints.push(dayWaste);
        }
        return {
            labels,
            datasets: [{
                label: 'Food Waste (kg)',
                data: dataPoints,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        };
    };

    const getTrendData = () => {
        const labels = [];
        const dataPoints = [];
        const date = new Date();
        for (let i = trendDays - 1; i >= 0; i--) {
            const d = new Date(date);
            d.setDate(d.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            let dayFeedbacks = feedbacks.filter(f => f.dateStr === dStr);
            if (trendMeal !== 'All') dayFeedbacks = dayFeedbacks.filter(f => f.mealType.toLowerCase() === trendMeal.toLowerCase());
            dataPoints.push(calculateAverage(dayFeedbacks));
        }
        return {
            labels,
            datasets: [{
                label: `${trendMeal} Rating Trend`,
                data: dataPoints,
                borderColor: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.3,
                fill: true,
                pointRadius: 4,
            }]
        };
    };

    if (loading) return <div className="p-10 text-center font-bold">Initializing Admin Control...</div>;

    const pendingComplaints = complaints.filter(c => c.status === 'pending');

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Toaster position="top-right" />

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* ... existing header ... */}
                {/* TOP HEADER */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Mess Analytics Hub</h1>
                        <p className="text-gray-500 font-bold mt-1">Real-time oversight of hostel dining operations.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setIsNotifModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex items-center gap-2">
                            <Bell size={20} /> Smart Alert
                        </button>
                        <button onClick={() => setIsWasteModalOpen(true)} className="bg-rose-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-rose-200 hover:bg-rose-700 transition flex items-center gap-2">
                            <Trash2 size={20} /> Log Waste
                        </button>
                    </div>
                </div>

                {/* KPI SCORING SYSTEM */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:border-blue-500 transition border-b-4 border-b-blue-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Users /></div>
                            <span className="text-xs font-black text-gray-400">STUDENTS</span>
                        </div>
                        <p className="text-4xl font-black text-gray-900">{studentCount}</p>
                        <p className="text-sm font-bold text-green-500 mt-2">↑ 4% from last week</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 border-b-4 border-b-yellow-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl"><TrendingUp /></div>
                            <span className="text-xs font-black text-gray-400">RATING</span>
                        </div>
                        <p className="text-4xl font-black text-gray-900">{calculateAverage(feedbacks)}</p>
                        <p className="text-sm font-bold text-gray-500 mt-2">Student Satisfaction</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 border-b-4 border-b-rose-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><PieChart /></div>
                            <span className="text-xs font-black text-gray-400">WASTE</span>
                        </div>
                        <p className="text-4xl font-black text-gray-900">
                            {wasteData.filter(w => w.date === new Date().toISOString().split('T')[0]).reduce((sum, w) => sum + w.amount, 0)}<span className="text-xl">kg</span>
                        </p>
                        <p className="text-sm font-bold text-red-500 mt-2">Real-time Today</p>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/10 text-yellow-400 rounded-2xl"><Activity /></div>
                                <span className="text-xs font-black text-indigo-300">AI PREDICT</span>
                            </div>
                            <p className="text-xl font-black text-white leading-tight">{prediction ? prediction.meal_name : 'No Data'}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-2xl font-black text-green-400">
                                    {prediction ? `${prediction.demand_percentage}%` : '--'}
                                </span>
                                <span className="text-xs font-bold text-slate-400">
                                    {prediction ? `Cook ${prediction.cook_quantity}kg` : 'Calculating...'}
                                </span>
                            </div>
                        </div>
                        <Zap className="absolute -bottom-8 -right-8 text-white/5 w-32 h-32" />
                    </div>
                </div>

                {/* CHARTS SECTION (RESTORED) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-black mb-6 text-gray-800 flex items-center gap-2">
                            <PieChart className="text-orange-500" size={24} /> 🥗 Daily Food Analysis
                        </h3>
                        <div className="h-72">
                            <Bar options={{ responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 5 } } }} data={dailyChartData} />
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-black mb-6 text-gray-800 flex items-center gap-2">
                            <Activity className="text-rose-500" size={24} /> 🗑️ Food Waste (7 Days)
                        </h3>
                        <div className="h-72">
                            <Line options={{ responsive: true, maintainAspectRatio: false }} data={getWasteChartData()} />
                        </div>
                    </div>
                </div>

                {/* RATING TRENDS (RESTORED) */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                            <TrendingUp className="text-indigo-500" size={24} /> 📈 Rating Trends
                        </h3>
                        <div className="flex gap-3">
                            <select value={trendMeal} onChange={(e) => setTrendMeal(e.target.value)} className="bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none">
                                <option value="All">All Meals</option>
                                <option value="Breakfast">Breakfast</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Snacks">Snacks</option>
                                <option value="Dinner">Dinner</option>
                            </select>
                            <select value={trendDays} onChange={(e) => setTrendDays(Number(e.target.value))} className="bg-gray-50 border-none rounded-xl p-3 text-sm font-bold outline-none">
                                <option value={7}>7 Days</option>
                                <option value={30}>30 Days</option>
                            </select>
                        </div>
                    </div>
                    <div className="h-80">
                        <Line options={{ responsive: true, maintainAspectRatio: false, scales: { y: { min: 1, max: 5 } } }} data={getTrendData()} />
                    </div>
                </div>

                {/* LOGS & ACTIONS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Complaints Notification Center */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[500px] flex flex-col">
                        <div className="bg-rose-50 px-8 py-5 border-b border-rose-100 flex justify-between items-center">
                            <h2 className="text-xl font-black text-rose-900 flex items-center gap-2">
                                <AlertOctagon size={24} /> Red Alerts ({pendingComplaints.length})
                            </h2>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            {pendingComplaints.length > 0 ? pendingComplaints.map(c => (
                                <div key={c.id} className="bg-white border rounded-2xl p-4 flex gap-4 hover:shadow-md transition group">
                                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                                        {c.studentName.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <p className="font-extrabold text-gray-900">{c.type}</p>
                                            <span className="text-[10px] font-black text-gray-400">{format(new Date(c.createdAt), 'hh:mm a')}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-500 mt-1 line-clamp-1">{c.description}</p>
                                    </div>
                                    <button onClick={() => handleResolveComplaint(c.id)} className="self-center bg-gray-100 text-gray-400 p-2 rounded-xl group-hover:bg-green-600 group-hover:text-white transition">
                                        <ShieldCheck size={20} />
                                    </button>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-50">
                                    <CheckCircle size={48} className="mx-auto text-green-300 mb-4" />
                                    <p className="font-black text-gray-400">Clear!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LIVE FEEDBACK LIST (NEW) */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[500px] flex flex-col">
                        <div className="bg-blue-50 px-8 py-5 border-b border-blue-100 flex justify-between items-center">
                            <h2 className="text-xl font-black text-blue-900 flex items-center gap-2">
                                <MessageSquare size={24} /> Recent Feedback
                            </h2>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto flex-1">
                            {feedbacks.length > 0 ? [...feedbacks].reverse().slice(0, 15).map((f, i) => (
                                <div key={i} className="bg-white border-b pb-4 last:border-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">S</div>
                                            <p className="text-sm font-black text-gray-800">{f.mealName}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {f.photo && (
                                                <button onClick={() => setSelectedImage(f.photo)} className="text-blue-600 hover:text-blue-800 transition p-1 bg-blue-50 rounded-lg">
                                                    <Camera size={14} />
                                                </button>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Zap size={10} className="text-yellow-500 fill-yellow-500" />
                                                <span className="text-xs font-black text-gray-900">{f.rating}/5</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 pl-8">{f.comment || "No comment provided."}</p>
                                </div>
                            )) : (
                                <p className="text-center text-gray-400 font-bold py-10">No feedback yet today.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Voting & Events Control */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
                    <div className="bg-indigo-50 px-8 py-5 border-b border-indigo-100 flex justify-between items-center">
                        <h2 className="text-xl font-black text-indigo-900 flex items-center gap-2">
                            <Moon size={24} /> Midnight & Special Events
                        </h2>
                        <button onClick={() => setIsEventModalOpen(true)} className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {events.map(e => (
                            <div key={e.id} className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-black text-indigo-900">{e.title}</p>
                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-tighter">Status: {e.status}</p>
                                    </div>
                                    <div className="bg-white px-3 py-1 rounded-full text-xs font-black text-indigo-600 shadow-sm border border-indigo-100">
                                        {e.votes.length} Votes
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (e.votes.length / studentCount) * 100)}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER NAVIGATION */}
                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 pb-10">
                    {[
                        { label: 'Update Menu', route: '/admin/menu/update', color: 'blue', icon: <Coffee size={18} /> },
                        { label: 'Manage Students', route: '/admin/students', color: 'indigo', icon: <Users size={18} /> },
                        { label: 'Attendance', route: '#', color: 'emerald', icon: <Zap size={18} /> },
                        { label: 'AI Prediction Hub', route: '#', color: 'violet', icon: < TrendingUp size={18} /> }
                    ].map((btn, idx) => (
                        <button
                            key={idx}
                            onClick={() => btn.route !== '#' && router.push(btn.route)}
                            className={`bg-white border-2 border-${btn.color}-100 p-6 rounded-3xl hover:bg-${btn.color}-50 hover:border-${btn.color}-400 transition flex flex-col items-center gap-3 group shadow-sm`}
                        >
                            <div className={`p-4 bg-${btn.color}-50 text-${btn.color}-600 rounded-2xl shadow-sm group-hover:scale-110 transition`}>{btn.icon}</div>
                            <span className="font-black text-gray-800 text-sm tracking-tight">{btn.label}</span>
                        </button>
                    ))}
                </div>
            </main>

            {/* --- MODALS --- */}
            {isNotifModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl scale-100">
                        <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-3">
                            <Bell className="text-blue-600" /> Send Smart Alert
                        </h2>
                        <form onSubmit={handleSendNotif} className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-gray-400 uppercase mb-2">Message</label>
                                <textarea className="w-full bg-gray-50 rounded-2xl p-4 outline-none font-bold text-gray-800 h-24" placeholder="e.g. Hot Dosa ready now! 🔥" value={notifMsg} onChange={(e) => setNotifMsg(e.target.value)} required />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200">Broadcast Message</button>
                            <button type="button" onClick={() => setIsNotifModalOpen(false)} className="w-full py-2 font-bold text-gray-400">Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            {isEventModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
                        <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-3"><Moon className="text-indigo-600" /> Create Special Event</h2>
                        <form onSubmit={handleCreateEvent} className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-gray-400 uppercase mb-2">Event Title</label>
                                <input type="text" className="w-full bg-gray-50 rounded-2xl p-4 outline-none font-bold" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} required />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl">Launch Vote</button>
                            <button type="button" onClick={() => setIsEventModalOpen(false)} className="w-full py-2 font-bold text-gray-400">Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            {isWasteModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-black flex items-center gap-3 mb-6"><Trash2 size={24} className="text-red-500" /> Log Daily Waste</h2>
                        <form onSubmit={handleLogWaste} className="space-y-6">
                            <input type="number" step="0.1" required className="w-full bg-gray-50 rounded-2xl p-4 outline-none font-bold" placeholder="Waste in kg" value={wasteAmount} onChange={(e) => setWasteAmount(e.target.value)} />
                            <input type="date" className="w-full bg-gray-50 rounded-2xl p-4 outline-none font-bold" value={wasteDate} onChange={(e) => setWasteDate(e.target.value)} />
                            <button type="submit" className="w-full bg-rose-600 text-white font-black py-4 rounded-2xl shadow-lg">Save Entry</button>
                            <button type="button" onClick={() => setIsWasteModalOpen(false)} className="w-full py-2 font-bold text-gray-400">Close</button>
                        </form>
                    </div>
                </div>
            )}
            {/* Image Preview Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl w-full">
                        <img src={selectedImage} alt="Evidence" className="w-full h-auto rounded-3xl shadow-2xl border-4 border-white/20" />
                        <button className="absolute -top-4 -right-4 bg-white text-black p-2 rounded-full shadow-xl"><X size={24} /></button>
                        <p className="text-white text-center mt-6 font-black text-xl tracking-widest uppercase">Student Evidence Proof</p>
                    </div>
                </div>
            )}
        </div>
    );
}
