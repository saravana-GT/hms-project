import { useRef, useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { MessageSquare, Star, Camera, Frown, Smile } from 'lucide-react';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function FeedbackDetailModal({ isOpen, onClose, dayData }) {
    if (!isOpen || !dayData) return null;

    const { day, overallRating, totalCount, meals, comments, sentiment } = dayData;
    const { positive = 0, neutral = 0, negative = 0 } = sentiment || {};
    const [selectedImage, setSelectedImage] = useState(null);

    // Data for Meal Breakdown Chart
    const mealLabels = meals.map(m => m.name);
    const mealRatings = meals.map(m => m.rating);
    const mealChartData = {
        labels: mealLabels,
        datasets: [
            {
                label: 'Rating',
                data: mealRatings,
                backgroundColor: mealRatings.map(r => r >= 4 ? '#10B981' : r >= 3 ? '#FBBF24' : '#EF4444'),
                borderRadius: 4,
            }
        ]
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center sticky top-0 z-10">
                        <div>
                            <h2 className="text-3xl font-bold flex items-center">
                                📅 {day} Feedback Analysis
                            </h2>
                            <p className="opacity-90 mt-1">Detailed breakdown of student ratings and comments</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Visuals */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-6 rounded-2xl flex items-center justify-between border border-blue-100">
                                    <div>
                                        <div className="text-sm text-blue-600 font-bold uppercase tracking-wider">Overall Score</div>
                                        <div className="text-4xl font-extrabold text-blue-900 mt-2">{overallRating}</div>
                                    </div>
                                    <div className="text-5xl">⭐</div>
                                </div>
                                <div className="bg-indigo-50 p-6 rounded-2xl flex items-center justify-between border border-indigo-100">
                                    <div>
                                        <div className="text-sm text-indigo-600 font-bold uppercase tracking-wider">Total Feedbacks</div>
                                        <div className="text-4xl font-extrabold text-indigo-900 mt-2">{totalCount}</div>
                                    </div>
                                    <div className="text-5xl">📝</div>
                                </div>
                            </div>

                            {/* Meal-wise Breakdown Chart */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><span className="mr-2">🍽️</span> Meal Performance</h3>
                                <div className="h-64">
                                    <Bar
                                        data={mealChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: { beginAtZero: true, max: 5 }
                                            },
                                            plugins: { legend: { display: false } }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Sentiment Analysis (Mock) */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><span className="mr-2">❤️</span> Sentiment Trends</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1 bg-green-50 p-4 rounded-xl text-center border border-green-100">
                                        <Smile className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                        <div className="font-bold text-green-700">{positive}% Positive</div>
                                    </div>
                                    <div className="flex-1 bg-yellow-50 p-4 rounded-xl text-center border border-yellow-100">
                                        <div className="text-2xl mb-2">😐</div>
                                        <div className="font-bold text-yellow-700">{neutral}% Neutral</div>
                                    </div>
                                    <div className="flex-1 bg-red-50 p-4 rounded-xl text-center border border-red-100">
                                        <Frown className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                        <div className="font-bold text-red-700">{negative}% Negative</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Comments Stream */}
                        <div className="lg:col-span-1 bg-gray-50 rounded-2xl p-6 border border-gray-200 h-[800px] flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <MessageSquare className="w-5 h-5 mr-2" /> Recent Comments
                            </h3>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {comments.length === 0 ? (
                                    <p className="text-gray-500 text-center py-10">No comments for this day.</p>
                                ) : comments.map((comment, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center space-x-1">
                                                {[...Array(comment.rating)].map((_, i) => (
                                                    <Star key={i} size={12} className="text-yellow-400 fill-current" />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-400">{comment.meal}</span>
                                        </div>
                                        <p className="text-gray-700 text-sm mb-3">"{comment.text}"</p>

                                        {comment.photo && (
                                            <div className="mt-2">
                                                <button
                                                    onClick={() => setSelectedImage(comment.photo)}
                                                    className="text-xs flex items-center text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                                                >
                                                    <Camera size={12} className="mr-1" /> View Proof
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            {
                selectedImage && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-90 p-4" onClick={() => setSelectedImage(null)}>
                        <div className="relative max-w-4xl max-h-screen">
                            <img
                                src={selectedImage && selectedImage.startsWith('data:') ? selectedImage : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000"}
                                alt="Proof"
                                className="rounded-lg shadow-2xl max-h-[80vh] object-contain"
                            />
                            {!selectedImage?.startsWith('data:') && <p className="text-white text-center mt-2">Proof: {selectedImage}</p>}
                            <button className="absolute top-4 right-4 text-white hover:text-gray-300">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                    </div>
                )
            }
        </>
    );
}
