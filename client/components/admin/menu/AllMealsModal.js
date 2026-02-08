import { Trash2, Edit2, Search } from 'lucide-react';
import { useState } from 'react';

export default function AllMealsModal({ isOpen, onClose, meals, onEdit, onDelete, onSelect, isSelectionMode = false }) {
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredMeals = meals.filter(meal =>
        meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{isSelectionMode ? 'Select a Meal' : 'All Available Meals'}</h2>
                        <p className="text-sm text-gray-500 mt-1">{isSelectionMode ? 'Click on a meal to add it to the menu' : `Manage your meal repository (${meals.length} total)`}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search meals by name or category..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {filteredMeals.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <p className="text-lg">No meals found matching "{searchTerm}"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredMeals.map((meal) => (
                                <div
                                    key={meal._id}
                                    onClick={() => isSelectionMode && onSelect(meal)}
                                    className={`bg-white rounded-lg border shadow-sm transition-all overflow-hidden flex flex-col group ${isSelectionMode ? 'cursor-pointer hover:ring-2 hover:ring-blue-500 hover:shadow-lg' : 'border-gray-200 hover:shadow-md'}`}
                                >
                                    <div className="relative h-40 bg-gray-100">
                                        <img
                                            src={meal.imageUrl || 'https://via.placeholder.com/150'}
                                            alt={meal.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full ${meal.type === 'Veg' ? 'bg-green-100 text-green-800' :
                                            meal.type === 'Non-Veg' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {meal.type}
                                        </span>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-bold text-gray-900 line-clamp-1" title={meal.name}>{meal.name}</h3>
                                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-medium uppercase">{meal.category}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 flex justify-between items-center text-sm text-gray-500 border-t border-gray-100">
                                            <span>{meal.nutritionalInfo?.calories || 0} kcal</span>

                                            <div className="flex space-x-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onEdit(meal)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(meal._id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
