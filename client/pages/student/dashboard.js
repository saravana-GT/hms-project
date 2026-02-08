import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FaStar } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';
import {
    Upload, Bell, Award, Activity, Heart, AlertOctagon,
    Moon, Zap, ArrowRight, ShieldCheck, Trophy, Target,
    Calendar, Coffee, Clock, Info, CheckCircle, ChevronRight
} from 'lucide-react';

export default function StudentDashboard() {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [voted, setVoted] = useState(false);
    const [comment, setComment] = useState('');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(true);

    // New Features State
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({
        mealsEaten: 0,
        missedMeals: 0,
        avgRating: 0,
        calories: '--',
        points: 0,
        badges: []
    });
    const [events, setEvents] = useState([]);
    const [complaintType, setComplaintType] = useState('');
    const [complaintDesc, setComplaintDesc] = useState('');
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

    const [todaysMenu, setTodaysMenu] = useState({
        breakfast: 'Loading...',
        lunch: 'Loading...',
        snacks: 'Loading...',
        dinner: 'Loading...'
    });

    const [foodOfTheDay, setFoodOfTheDay] = useState({ name: 'Calculating...', rating: 0 });

    useEffect(() => {
        fetchDashboardData();

        // 🔔 Request System Notification Permission
        if ("Notification" in window) {
            Notification.requestPermission();
        }

        // 🔄 SMART NOTIFICATION POLLING
        const interval = setInterval(async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const notifRes = await axios.get('http://127.0.0.1:5001/api/notifications', {
                        headers: { 'x-auth-token': token }
                    });

                    if (notifRes.data.length > 0) {
                        const latestNotif = notifRes.data[0];
                        const lastShownId = localStorage.getItem('last_notif_id');
                        if (latestNotif.id !== lastShownId) {
                            if (Notification.permission === "granted") {
                                new Notification("Mess Alert 🍱", { body: latestNotif.message });
                            }
                            localStorage.setItem('last_notif_id', latestNotif.id);
                        }
                    }
                    setNotifications(notifRes.data);
                }
            } catch (err) { }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };

            const [menuRes, mealsRes, notifRes, statsRes, eventsRes, feedRes] = await Promise.all([
                axios.get('http://127.0.0.1:5001/api/menu'),
                axios.get('http://127.0.0.1:5001/api/meals'),
                axios.get('http://127.0.0.1:5001/api/notifications', config),
                axios.get('http://127.0.0.1:5001/api/student-stats', config),
                axios.get('http://127.0.0.1:5001/api/events', config),
                axios.get('http://127.0.0.1:5001/api/feedback')
            ]);

            // Process Menu
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const todayMenu = menuRes.data.find(m => m.date.startsWith(todayStr));
            const allMeals = mealsRes.data;
            const mealMap = {};
            allMeals.forEach(m => mealMap[m._id] = m.name);

            if (todayMenu) {
                setTodaysMenu({
                    breakfast: todayMenu.meals.breakfast.map(id => mealMap[id]).join(', '),
                    lunch: todayMenu.meals.lunch.map(id => mealMap[id]).join(', '),
                    snacks: todayMenu.meals.snacks.map(id => mealMap[id]).join(', '),
                    dinner: todayMenu.meals.dinner.map(id => mealMap[id]).join(', ')
                });
            } else {
                setTodaysMenu({ breakfast: 'Not Set', lunch: 'Not Set', snacks: 'Not Set', dinner: 'Not Set' });
            }

            // Calculate REAL Food of the Day from feedback
            const ratingsMap = {};
            feedRes.data.forEach(f => {
                if (!ratingsMap[f.mealName]) ratingsMap[f.mealName] = { sum: 0, count: 0 };
                ratingsMap[f.mealName].sum += f.rating;
                ratingsMap[f.mealName].count++;
            });

            let bestMeal = "Standard Meal";
            let bestAvg = 0;
            Object.keys(ratingsMap).forEach(name => {
                const avg = ratingsMap[name].sum / ratingsMap[name].count;
                if (avg > bestAvg) {
                    bestAvg = avg;
                    bestMeal = name;
                }
            });

            setFoodOfTheDay({ name: bestMeal, rating: bestAvg.toFixed(1) });
            setNotifications(notifRes.data);
            setStats(statsRes.data);
            setEvents(eventsRes.data);
            setLoading(false);
        } catch (err) {
            setLoading(false);
        }
    };

    const getTargetMeal = () => {
        const hour = new Date().getHours();
        let type = 'breakfast';
        if (hour >= 11 && hour < 16) type = 'lunch';
        else if (hour >= 16 && hour < 19) type = 'snacks';
        else if (hour >= 19) type = 'dinner';
        return { type, name: todaysMenu[type] };
    };

    const targetMeal = getTargetMeal();

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const handleRate = async () => {
        if (rating === 0) return alert("Please select a rating.");

        // Validation logic restored
        if (rating === 1) {
            if (!photo) return alert("For a 1-star rating, you must upload a photo as proof.");
            if (!comment.trim()) return alert("For a 1-star rating, please explain what was wrong.");
        }
        if (rating === 2) {
            if (!comment.trim()) return alert("For a 2-star rating, please provide a comment.");
        }

        try {
            const token = localStorage.getItem('token');
            let photoBase64 = null;
            if (photo) {
                photoBase64 = await toBase64(photo);
            }

            await axios.post('http://127.0.0.1:5001/api/feedback', {
                mealType: targetMeal.type,
                mealName: targetMeal.name,
                rating,
                comment,
                photo: photoBase64
            }, { headers: { 'x-auth-token': token } });

            alert("Thank you! Your feedback has been submitted.");
            setRating(0); setComment(''); setPhoto(null);
            fetchDashboardData();
        } catch (err) { alert("Failed to submit"); }
    };

    const handleComplaint = async () => {
        if (!complaintType || !complaintDesc) return alert("Please fill details");
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://127.0.0.1:5001/api/complaints', {
                type: complaintType,
                description: complaintDesc
            }, { headers: { 'x-auth-token': token } });
            alert("Complaint logged. Admin notified!");
            setIsComplaintModalOpen(false);
            setComplaintType(''); setComplaintDesc('');
        } catch (err) { alert("Failed to log complaint"); }
    };

    const handleEventVote = async (eventId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://127.0.0.1:5001/api/events/${eventId}/vote`, {}, { headers: { 'x-auth-token': token } });
            alert("Vote registered!");
            fetchDashboardData();
        } catch (err) { alert(err.response?.data?.msg || "Vote failed"); }
    };

    const handleMarkAsEaten = async () => {
        try {
            const token = localStorage.getItem('token');
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            await axios.post('http://127.0.0.1:5001/api/attendance', {
                mealType: targetMeal.type,
                dateStr: todayStr
            }, { headers: { 'x-auth-token': token } });

            toast.success("Attendance marked! Enjoy your meal 🥣");
            fetchDashboardData();
        } catch (err) {
            toast.error(err.response?.data?.msg || "Failed to mark attendance");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-bold animate-pulse">Syncing with Mess Hall...</p>
            </div>
        </div>
    );

    const hasEatenCurrentMeal = stats.eatenToday && stats.eatenToday.includes(targetMeal.type);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Toaster position="top-right" />

            {/* Notification Bar */}
            {notifications.length > 0 && (
                <div className="bg-blue-600 text-white py-3 px-6 overflow-hidden relative">
                    <div className="flex whitespace-nowrap animate-marquee items-center gap-12">
                        {notifications.map((n, i) => (
                            <span key={i} className="font-extrabold flex items-center gap-3">
                                <Zap size={18} className="text-yellow-300" /> {n.message}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-6 pt-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            Hi, {stats.username || 'Student'}! 👋
                        </h1>
                        <p className="text-slate-500 font-bold mt-1">Ready for {targetMeal.type}? Good nutrition leads to better grades.</p>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-2 md:grid-cols-4 bg-white p-2 rounded-3xl shadow-xl shadow-slate-200 gap-2 border border-slate-100">
                        <div className="px-6 py-4 text-center group">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-500 transition">Meals Eaten</p>
                            <p className="text-2xl font-black text-slate-900">{stats.mealsEaten}</p>
                        </div>
                        <div className="px-6 py-4 text-center border-l border-slate-50 group">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-rose-500 transition">Skipped</p>
                            <p className="text-2xl font-black text-slate-900">{stats.missedMeals}</p>
                        </div>
                        <div className="px-6 py-4 text-center border-l border-slate-50 group">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-yellow-500 transition">Avg Rating</p>
                            <div className="flex items-center justify-center gap-1">
                                <p className="text-2xl font-black text-slate-900">{stats.avgRating}</p>
                                <FaStar size={14} className="text-yellow-400" />
                            </div>
                        </div>
                        <div className="px-6 py-4 text-center border-l border-slate-50 group bg-slate-900 rounded-2xl">
                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Calories</p>
                            <p className="text-2xl font-black text-white">{stats.calories}</p>
                        </div>
                    </div>
                </div>

                {/* Main Hero Card: Current Meal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="lg:col-span-2 bg-gradient-to-br from-rose-500 to-orange-500 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-rose-200 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="bg-white/20 backdrop-blur-md w-fit px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase mb-6 flex items-center gap-2">
                                <Award size={14} /> MUST TRY TODAY
                            </div>
                            <h2 className="text-2xl font-bold opacity-90 mb-1">Today's Star Meal</h2>
                            <p className="text-5xl font-black mb-6 group-hover:scale-105 transition-transform origin-left">{foodOfTheDay.name} 🍛</p>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Heart className="text-rose-200 fill-rose-200" size={20} />
                                    <span className="font-bold text-xl">{foodOfTheDay.rating}/5 Avg Rating</span>
                                </div>
                                <div className="text-sm font-medium opacity-80 border-l border-white/30 pl-6">
                                    Based on student feedback
                                </div>
                            </div>

                            <button onClick={handleMarkAsEaten} disabled={hasEatenCurrentMeal} className={`mt-10 px-10 py-5 rounded-2xl font-black text-lg transition shadow-xl flex items-center gap-3 ${hasEatenCurrentMeal ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-rose-600 hover:bg-slate-50 active:scale-95 shadow-rose-900/20'}`}>
                                {hasEatenCurrentMeal ? (
                                    <><ShieldCheck size={24} /> Already Marked as Eaten</>
                                ) : (
                                    <><Coffee size={24} /> Mark as Eaten</>
                                )}
                            </button>
                        </div>
                        <FaStar className="absolute -bottom-10 -right-10 text-white/10 w-64 h-64 rotate-12" />
                    </div>

                    {/* PERSONAL FOOD ANALYTICS */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-gray-800">
                            <Activity className="text-blue-500" size={20} /> My Health Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-2xl">
                                <p className="text-xs font-bold text-blue-600 uppercase mb-1">Eaten</p>
                                <p className="text-2xl font-black text-gray-900">{stats.mealsEaten}/21</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-2xl">
                                <p className="text-xs font-bold text-red-600 uppercase mb-1">Skipped</p>
                                <p className="text-2xl font-black text-gray-900">{stats.missedMeals} 😴</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-2xl">
                                <p className="text-xs font-bold text-green-600 uppercase mb-1">Avg Rating</p>
                                <p className="text-2xl font-black text-gray-900">{stats.avgRating} ⭐</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-2xl">
                                <p className="text-xs font-bold text-purple-600 uppercase mb-1">Calories</p>
                                <p className="text-xl font-black text-gray-900">{stats.calories}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MENU & RATING SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Menu Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                <Calendar size={20} /> Today's Menu
                            </h2>
                            <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                {format(new Date(), 'EEEE, dd MMM')}
                            </span>
                        </div>
                        <div className="p-8 space-y-6">
                            {[
                                { t: 'Breakfast', v: todaysMenu.breakfast, i: <Coffee />, c: 'blue' },
                                { t: 'Lunch', v: todaysMenu.lunch, i: <Zap />, c: 'orange' },
                                { t: 'Snacks', v: todaysMenu.snacks, i: <Heart />, c: 'rose' },
                                { t: 'Dinner', v: todaysMenu.dinner, i: <Moon />, c: 'indigo' }
                            ].map((meal, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className={`w-12 h-12 rounded-2xl bg-${meal.c}-50 flex items-center justify-center text-${meal.c}-500 group-hover:scale-110 transition`}>
                                        {meal.i}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{meal.t}</p>
                                        <p className="text-lg font-bold text-gray-800">{meal.v}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rating Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-black text-gray-800 mb-2 flex items-center gap-2">
                            <Zap className="text-yellow-500 fill-yellow-500" size={20} /> Rate Your Last Meal
                        </h2>
                        <p className="text-gray-500 font-medium mb-8 capitalize">
                            Current meal: <span className="text-gray-900 font-extrabold">{targetMeal.type}</span>
                        </p>

                        <div className="flex gap-4 mb-8">
                            {[...Array(5)].map((_, i) => {
                                const ratingValue = i + 1;
                                return (
                                    <FaStar
                                        key={i}
                                        className="cursor-pointer transition-all hover:scale-125 duration-200"
                                        color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                        size={48}
                                        onClick={() => setRating(ratingValue)}
                                        onMouseEnter={() => setHover(ratingValue)}
                                        onMouseLeave={() => setHover(0)}
                                    />
                                );
                            })}
                        </div>

                        <div className="space-y-4 mb-6">
                            {rating > 0 && rating <= 2 && (
                                <div className="text-xs font-bold text-red-500 animate-pulse flex items-center gap-1">
                                    <AlertOctagon size={14} />
                                    {rating === 1 ? "Photo & Reason required for 1-Star" : "Reason required for 2-Stars"}
                                </div>
                            )}

                            <textarea
                                className="w-full bg-gray-50 rounded-2xl p-4 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none text-gray-800 font-medium h-28"
                                placeholder={rating <= 2 ? "Tell us what went wrong... (Required)" : "Any comments for the chef?"}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />

                            {/* RESTORED PHOTO UPLOAD */}
                            <div className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${rating === 1 && !photo ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-400 bg-gray-50/50'}`}>
                                <label className="cursor-pointer block">
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files[0])} />
                                    <Upload className={`mx-auto mb-2 ${rating === 1 && !photo ? 'text-red-400' : 'text-gray-400'}`} />
                                    <span className="text-sm font-bold text-gray-500">
                                        {photo ? `✅ ${photo.name}` : (rating === 1 ? "Upload Photo Proof (Required)" : "Upload Photo (Optional)")}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsComplaintModalOpen(true)}
                                className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
                            >
                                <AlertOctagon size={18} /> Issue?
                            </button>
                            <button
                                onClick={handleRate}
                                className="flex-[2] bg-blue-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
                            >
                                Send Feedback
                            </button>
                        </div>
                    </div>
                </div>

                {/* 🎮 GAMIFICATION BADGES */}
                {stats.badges.length > 0 && (
                    <div className="bg-indigo-600 rounded-3xl p-8 text-white">
                        <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <Award /> My Mess Achievements
                        </h2>
                        <div className="flex flex-wrap gap-6">
                            {stats.badges.map((b, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/20 w-fit">
                                    <div className="text-4xl">{b.icon}</div>
                                    <div>
                                        <p className="font-black text-lg leading-tight">{b.name}</p>
                                        <p className="text-xs font-bold text-indigo-200">{b.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 🌙 MIDNIGHT / SPECIAL MODE */}
                {events.length > 0 && (
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                                <Moon className="text-yellow-400" /> Exam Nights / Fest Mode
                            </h2>
                            <p className="text-slate-400 font-bold mb-8">Feeling hungry late night? Vote for special snacks!</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {events.map(e => (
                                    <div key={e.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-yellow-400/50 transition">
                                        <h3 className="text-xl font-bold mb-1">{e.title}</h3>
                                        <p className="text-sm text-slate-500 mb-6">{e.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                {[...Array(Math.min(3, e.votes.length))].map((_, i) => (
                                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">👤</div>
                                                ))}
                                                {e.votes.length > 3 && <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-slate-900 flex items-center justify-center text-slate-900 text-[10px] font-bold">+{e.votes.length - 3}</div>}
                                            </div>
                                            <button
                                                onClick={() => handleEventVote(e.id)}
                                                className={`px-6 py-2 rounded-xl font-bold transition flex items-center gap-2 ${e.votes.includes(stats.userId) ? 'bg-green-500 text-white' : 'bg-yellow-400 text-slate-900 hover:bg-yellow-500'}`}
                                            >
                                                {e.votes.includes(stats.userId) ? <CheckCircle size={16} /> : <Zap size={16} />}
                                                {e.votes.includes(stats.userId) ? 'Voted' : 'Vote Now'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <AlertOctagon className="absolute -top-10 -right-10 text-white/5 w-64 h-64 rotate-12" />
                    </div>
                )}
            </main>

            {/* 🚨 COMPLAINT MODAL */}
            {isComplaintModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl scale-100 animate-in fade-in zoom-in">
                        <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-3">
                            <AlertOctagon className="text-red-500" /> Instant Complaint
                        </h2>
                        <p className="text-gray-500 font-medium mb-8">Admin will get a real-time alert about this.</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Issue Type</label>
                                <select
                                    className="w-full bg-gray-50 border-transparent rounded-2xl p-4 outline-none font-bold text-gray-800"
                                    value={complaintType}
                                    onChange={(e) => setComplaintType(e.target.value)}
                                >
                                    <option value="">Select Type</option>
                                    <option value="Food Cold">🥘 Food is Cold</option>
                                    <option value="Not Cooked">🥩 Not Cooked Properly</option>
                                    <option value="Hygiene Issue">🧼 Hygiene Issue</option>
                                    <option value="Mess Delay">⏰ Huge Delay</option>
                                    <option value="Other">❓ Other Issue</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Details (Optional)</label>
                                <textarea
                                    className="w-full bg-gray-50 border-transparent rounded-2xl p-4 outline-none font-medium text-gray-800 h-24"
                                    placeholder="Tell us exactly what's wrong..."
                                    value={complaintDesc}
                                    onChange={(e) => setComplaintDesc(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsComplaintModalOpen(false)}
                                    className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition"
                                >
                                    Go Back
                                </button>
                                <button
                                    onClick={handleComplaint}
                                    className="flex-1 bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition"
                                >
                                    Submit Alert
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MARQUEE ANIMATION CSS */}
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}
