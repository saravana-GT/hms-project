import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, GripVertical } from 'lucide-react';

export default function MenuGrid({ weekDates, menuData, onDrop, onEditMeal, onDeleteMeal, onAddMeal }) {
    const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];

    return (
        <DragDropContext onDragEnd={onDrop}>
            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
                <table className="w-full min-w-max border-collapse bg-white">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700 text-left text-sm uppercase tracking-wider">
                            <th className="p-4 border-b border-gray-300 w-32 font-bold text-center">Day</th>
                            {mealTypes.map(type => (
                                <th key={type} className="p-4 border-b border-gray-300 font-bold text-center">{type}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {weekDates.map((dateObj, dayIndex) => {
                            const dateKey = format(dateObj, 'yyyy-MM-dd');
                            const dayName = format(dateObj, 'EEEE');
                            const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;

                            return (
                                <tr key={dateKey} className={`${isToday ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}>
                                    <td className="p-4 border-r border-gray-200 text-center">
                                        <div className="font-bold text-gray-800">{dayName}</div>
                                        <div className="text-xs text-gray-500 mt-1">{format(dateObj, 'MMM d')}</div>
                                    </td>
                                    {mealTypes.map((type) => {
                                        const droppableId = `${dateKey}|${type}`;
                                        const meals = menuData[droppableId] || [];

                                        return (
                                            <Droppable key={droppableId} droppableId={droppableId}>
                                                {(provided, snapshot) => (
                                                    <td
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className={`p-2 border-r border-gray-200 align-top min-w-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-blue-100/50' : ''}`}
                                                    >
                                                        <div className="flex flex-col space-y-2 min-h-[100px]">
                                                            {meals.map((meal, index) => (
                                                                <Draggable key={`${droppableId}-${meal._id}-${index}`} draggableId={`${droppableId}-${meal._id}-${index}`} index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className={`group bg-white p-2 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center space-x-3 cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'ring-2 ring-blue-500 rotate-2' : ''}`}
                                                                        >
                                                                            <img
                                                                                src={meal.imageUrl || 'https://via.placeholder.com/40'}
                                                                                alt={meal.name}
                                                                                className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                                                            />
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="text-sm font-semibold text-gray-900 truncate">{meal.name}</div>
                                                                                <div className="text-xs text-gray-500 flex items-center space-x-1">
                                                                                    <span className={`w-2 h-2 rounded-full ${meal.type === 'Veg' ? 'bg-green-500' : meal.type === 'Non-Veg' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                                                                    <span>{meal.nutritionalInfo?.calories || 0} kcal</span>
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => onDeleteMeal(dateKey, type, index)}
                                                                                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}

                                                            <button
                                                                onClick={() => onAddMeal(dateKey, type)}
                                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center text-xs font-semibold uppercase tracking-wide opacity-50 hover:opacity-100"
                                                            >
                                                                <Plus size={14} className="mr-1" /> Add
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </Droppable>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </DragDropContext>
    );
}
