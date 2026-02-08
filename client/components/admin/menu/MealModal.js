import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function MealModal({ isOpen, onClose, onSave, meal = null }) {
    const [formData, setFormData] = useState({
        name: meal?.name || '',
        category: meal?.category || 'Main Course',
        type: meal?.type || 'Veg',
        calories: meal?.nutritionalInfo?.calories || '',
        protein: meal?.nutritionalInfo?.protein || '',
        startTime: meal?.ratingWindow?.startTime || '12:00',
        endTime: meal?.ratingWindow?.endTime || '14:00',
        image: null
    });

    const categories = ['Main Course', 'Side Dish', 'Starter', 'Beverage'];
    const types = ['Veg', 'Non-Veg', 'Egg'];

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('category', formData.category);
        data.append('type', formData.type);
        data.append('calories', formData.calories);
        data.append('protein', formData.protein);
        data.append('startTime', formData.startTime);
        data.append('endTime', formData.endTime);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            if (meal?._id) {
                await axios.put(`http://localhost:5001/api/meals/${meal._id}`, data);
                toast.success('Meal updated!');
            } else {
                await axios.post('http://localhost:5001/api/meals', data);
                toast.success('Meal created!');
            }
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to save meal');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all w-full max-w-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
                    <h2 className="text-2xl font-bold text-white">{meal ? 'Edit Meal' : 'Add New Meal'}</h2>
                    <p className="text-blue-100 text-sm mt-1">Fill in the details below</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meal Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="e.g. Butter Chicken"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {types.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Calories (kcal)</label>
                            <input
                                type="number"
                                name="calories"
                                value={formData.calories}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Protein (g)</label>
                            <input
                                type="number"
                                name="protein"
                                value={formData.protein}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating Start</label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating End</label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 font-medium shadow-md transition transform active:scale-95"
                        >
                            Save Meal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
