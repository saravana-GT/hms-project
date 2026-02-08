import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Toaster, toast } from 'react-hot-toast';
import { startOfWeek, addDays, format } from 'date-fns';
import { ArrowLeft, Save, Upload, Calendar, Copy, ChevronLeft, ChevronRight, Plus, Eye } from 'lucide-react';

import MenuGrid from '../../../components/admin/menu/MenuGrid';
import MealModal from '../../../components/admin/menu/MealModal';
import AllMealsModal from '../../../components/admin/menu/AllMealsModal';
import StatsPanel from '../../../components/admin/menu/StatsPanel';

export default function UpdateMenu() {
    const router = useRouter();
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday start
    const [menuData, setMenuData] = useState({}); // Key: "yyyy-mm-dd|mealType" -> Value: Array of Meal Objects
    const [allMeals, setAllMeals] = useState([]); // Database, fetched on load
    const [isMealModalOpen, setIsMealModalOpen] = useState(false);
    const [isAllMealsModalOpen, setIsAllMealsModalOpen] = useState(false);
    const [selectingFor, setSelectingFor] = useState(null); // { dateKey, type }
    const [editingMeal, setEditingMeal] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial Fetch
    useEffect(() => {
        fetchMeals();
    }, []);

    // Fetch existing menu when week changes
    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                // Fetch all menus (for mock mode). In real app, pass week range.
                const res = await axios.get('http://localhost:5002/api/menu');
                const allMenus = res.data;

                const newMenuData = {};

                // We need all meals to map IDs back to objects
                // Ideally we should wait for allMeals to be loaded. 
                // Let's refactor to ensure we have meals first, or fetch them here if empty.
                let currentMeals = allMeals;
                if (currentMeals.length === 0) {
                    const mealsRes = await axios.get('http://localhost:5002/api/meals');
                    currentMeals = mealsRes.data;
                    setAllMeals(currentMeals);
                }

                const mealMap = {};
                currentMeals.forEach(m => mealMap[m._id] = m);

                // Populate menuData
                weekDates.forEach(dateObj => {
                    const dateStr = format(dateObj, 'yyyy-MM-dd');
                    const dayMenu = allMenus.find(m => m.date.startsWith(dateStr));

                    if (dayMenu && dayMenu.meals) {
                        // dayMenu.meals.breakfast is [id1, id2...]
                        ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(type => {
                            const mealIds = dayMenu.meals[type] || [];
                            // Map IDs to Objects, filter out undefined (deleted meals)
                            const mealObjects = mealIds.map(id => mealMap[id]).filter(Boolean);
                            if (mealObjects.length > 0) {
                                newMenuData[`${dateStr}|${type}`] = mealObjects;
                            }
                        });
                    }
                });

                setMenuData(newMenuData);

            } catch (err) {
                console.error("Error fetching weekly menu:", err);
                toast.error("Failed to load this week's menu");
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [weekStart]); // Depend on weekStart. allMeals dep might cause loop if not careful.

    const fetchMeals = async () => {
        try {
            const res = await axios.get('http://localhost:5002/api/meals');
            setAllMeals(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load meals');
        }
    };

    // Helper to generate dates for current view
    const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const handleDragDrop = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        // Extract info from Drop IDs "YYYY-MM-DD|type"
        const sourceId = source.droppableId;
        const destId = destination.droppableId;

        // Deep copy of menu data
        const newMenuData = { ...menuData };

        // Initialize arrays if empty
        if (!newMenuData[sourceId]) newMenuData[sourceId] = [];
        if (!newMenuData[destId]) newMenuData[destId] = [];

        // Logic
        if (sourceId === destId) {
            // Reorder within same cell
            const [moved] = newMenuData[sourceId].splice(source.index, 1);
            newMenuData[sourceId].splice(destination.index, 0, moved);
        } else {
            // Move/Copy between cells
            // Option: Decide if move or copy. Let's do COPY for ease of menu planning (drag from one day to another usually implies copying)
            // But standard DnD is move. Let's implement COPY if holding Ctrl, else MOVE?
            // For simplicity in web, let's do MOVE by default, but maybe add "Copy" button separately.
            // Wait, requirements said "Drag & drop **copy** meal". Okay, let's clone it.

            const itemToCopy = newMenuData[sourceId][source.index];
            // Don't remove from source if we want to copy
            // newMenuData[sourceId].splice(source.index, 1); 

            // Insert into destination
            newMenuData[destId].splice(destination.index, 0, { ...itemToCopy }); // Clone object
        }

        setMenuData(newMenuData);
    };

    const handleAddMealToCell = (dateKey, type) => {
        setSelectingFor({ dateKey, type });
        setIsAllMealsModalOpen(true);
    };

    const handleMealSelection = (meal) => {
        if (selectingFor) {
            const { dateKey, type } = selectingFor;
            const cellId = `${dateKey}|${type}`;

            // Avoid duplicates in the same cell if desired, or allow multiple
            // Check if already exists?
            // let exists = (menuData[cellId] || []).find(m => m._id === meal._id);
            // if (exists) return toast.error('Meal already added to this slot');

            setMenuData(prev => ({
                ...prev,
                [cellId]: [...(prev[cellId] || []), meal]
            }));

            toast.success(`Added ${meal.name} to ${type}`);
            // Don't close modal immediately if they want to add multiple? 
            // Better close for clarity.
            setIsAllMealsModalOpen(false);
            setSelectingFor(null);
        }
    };

    const handleDeleteMeal = (dateKey, type, index) => {
        const cellId = `${dateKey}|${type}`;
        setMenuData(prev => {
            const newList = [...(prev[cellId] || [])];
            newList.splice(index, 1);
            return { ...prev, [cellId]: newList };
        });
    };

    const handleSaveMenu = async () => {
        // Transform flat state map back to nested structure for API if needed, or send as is
        // Based on server route logic (create/update menu per day)

        toast.promise(
            new Promise(async (resolve, reject) => {
                try {
                    // Iterate through each day in view
                    const promises = weekDates.map(dateObj => {
                        const dateStr = format(dateObj, 'yyyy-MM-dd');
                        const dayName = format(dateObj, 'EEEE');

                        const mealsForDay = {
                            breakfast: (menuData[`${dateStr}|breakfast`] || []).map(m => m._id),
                            lunch: (menuData[`${dateStr}|lunch`] || []).map(m => m._id),
                            snacks: (menuData[`${dateStr}|snacks`] || []).map(m => m._id),
                            dinner: (menuData[`${dateStr}|dinner`] || []).map(m => m._id),
                        };

                        return axios.post('http://localhost:5002/api/menu', {
                            date: dateStr, // Send 'yyyy-MM-dd' string directly to avoid timezone shifts
                            dayOfWeek: dayName,
                            meals: mealsForDay
                        });
                    });

                    await Promise.all(promises);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            }),
            {
                loading: 'Saving Weekly Menu...',
                success: 'Menu Saved Successfully!',
                error: 'Failed to Save.',
            }
        );
    };

    const handleEditMeal = (meal) => {
        setEditingMeal(meal);
        setIsAllMealsModalOpen(false);
        setIsMealModalOpen(true);
    };

    const handleDeleteMealFromDB = async (id) => {
        if (!confirm('Are you sure you want to delete this meal permanently?')) return;
        try {
            await axios.delete(`http://localhost:5002/api/meals/${id}`);
            toast.success('Meal deleted');
            fetchMeals();
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete meal');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Toaster position="top-right" />

            {/* Top Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                Menu Editor
                            </h1>
                            <p className="text-xs text-gray-500">Plan meals for the hostel mess</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6 bg-gray-100 rounded-lg p-1">
                        <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="p-1 hover:bg-white rounded shadow-sm transition"><ChevronLeft size={16} /></button>
                        <div className="flex items-center space-x-2 px-2">
                            <Calendar size={16} className="text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700">
                                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                            </span>
                        </div>
                        <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="p-1 hover:bg-white rounded shadow-sm transition"><ChevronRight size={16} /></button>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsAllMealsModalOpen(true)}
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition flex items-center shadow-sm"
                        >
                            <Eye size={16} className="mr-2" /> View All Meals
                        </button>
                        <button
                            onClick={() => setIsMealModalOpen(true)}
                            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition flex items-center shadow-sm"
                        >
                            <Plus size={16} className="mr-2" /> New Meal
                        </button>
                        <button
                            onClick={handleSaveMenu}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg hover:shadow-xl transform transition hover:-translate-y-0.5 flex items-center"
                        >
                            <Save size={16} className="mr-2" /> Publish Menu
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1600px] mx-auto p-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Left: Menu Grid (9 cols) */}
                    <div className="col-span-12 lg:col-span-9">
                        <MenuGrid
                            weekDates={weekDates}
                            menuData={menuData}
                            onDrop={handleDragDrop}
                            onAddMeal={handleAddMealToCell}
                            onDeleteMeal={handleDeleteMeal}
                        />
                    </div>

                    {/* Right: Analytics (3 cols) */}
                    <div className="col-span-12 lg:col-span-3">
                        <StatsPanel meals={Object.values(menuData).flat()} />
                    </div>
                </div>
            </main>

            {/* Modal */}
            <MealModal
                isOpen={isMealModalOpen}
                onClose={() => {
                    setIsMealModalOpen(false);
                    setEditingMeal(null);
                }}
                onSave={fetchMeals}
                meal={editingMeal}
            />

            <AllMealsModal
                isOpen={isAllMealsModalOpen}
                onClose={() => {
                    setIsAllMealsModalOpen(false);
                    setSelectingFor(null);
                }}
                meals={allMeals}
                onEdit={handleEditMeal}
                onDelete={handleDeleteMealFromDB}
                onSelect={selectingFor ? handleMealSelection : undefined}
                isSelectionMode={!!selectingFor}
            />
        </div>
    );
}
