import Link from 'next/link';

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <h1 className="text-5xl font-extrabold text-blue-600 mb-6">
                Smart Hostel Food System
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                AI-powered menu planning, real-time feedback, and food waste analytics for a better hostel experience.
            </p>

            <div className="flex gap-4">
                <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
                    Login / Register
                </Link>
                <Link href="/menu" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition">
                    View Today's Menu
                </Link>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                    <h3 className="text-xl font-bold mb-2">🍽️ AI Menu Planning</h3>
                    <p className="text-gray-500">Intelligent suggestions based on student preferences and past ratings.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                    <h3 className="text-xl font-bold mb-2">📊 Real-time Stats</h3>
                    <p className="text-gray-500">Live feedback analytics and food waste tracking dashboards.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
                    <h3 className="text-xl font-bold mb-2">⭐ Student Voting</h3>
                    <p className="text-gray-500">Vote for your favorite dishes to see them on next week's menu.</p>
                </div>
            </div>
        </div>
    );
}
