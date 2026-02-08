import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StatsPanel({ meals }) {
    // Calculate Stats
    const totalMeals = meals.length;
    const vegCount = meals.filter(m => m.type === 'Veg').length;
    const nonVegCount = meals.filter(m => m.type === 'Non-Veg').length;
    const eggCount = meals.filter(m => m.type === 'Egg').length;

    const wasteData = {
        labels: ['Low Waste', 'Medium Waste', 'High Waste'],
        datasets: [{
            data: [65, 25, 10], // Mock data
            backgroundColor: ['#10B981', '#FBBF24', '#EF4444'],
            borderWidth: 0,
        }],
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 h-full border border-gray-100 sticky top-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">📊</span> Analytics
            </h3>

            <div className="space-y-8">
                {/* Highlights */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-blue-600">{totalMeals}</div>
                        <div className="text-xs text-blue-500 uppercase font-semibold">Meals Set</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-green-600">4.5 ⭐</div>
                        <div className="text-xs text-green-500 uppercase font-semibold">Avg Rating</div>
                    </div>
                </div>

                {/* Diet Distribution */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Dietary Distribution</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Veg</span>
                            <span className="font-bold">{vegCount}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(vegCount / totalMeals) * 100}%` }}></div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>Non-Veg</span>
                            <span className="font-bold">{nonVegCount}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(nonVegCount / totalMeals) * 100}%` }}></div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>Egg</span>
                            <span className="font-bold">{eggCount}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(eggCount / totalMeals) * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Waste Chart */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">Predicted Waste</h4>
                    <div className="h-40 flex justify-center">
                        <Doughnut data={wasteData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                {/* Top Dish */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <h4 className="text-amber-800 text-xs font-bold uppercase mb-2">🏆 Star Dish of the Week</h4>
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl">🍗</div>
                        <div>
                            <div className="font-bold text-gray-900">Chicken Biryani</div>
                            <div className="text-xs text-gray-500">Scheduled for Sunday Lunch</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
