import '../styles/globals.css';
import { useState, useEffect } from 'react';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
    // Simple auth state management for demo
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token) {
            setUser({ token, role });
        }
    }, []);

    return (
        <>
            <Head>
                <title>Smart Hostel Mess</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
                {/* Simple Navbar */}
                <nav className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-50">
                    <h1 className="text-xl font-bold text-blue-600">SmartMess</h1>
                    <div>
                        {user ? (
                            <button
                                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                                className="text-red-500 hover:text-red-700"
                            >
                                Logout
                            </button>
                        ) : (
                            <a href="/login" className="text-blue-500 hover:text-blue-700">Login</a>
                        )}
                    </div>
                </nav>
                <main className="container mx-auto p-4">
                    <Component {...pageProps} user={user} />
                </main>
            </div>
        </>
    );
}

export default MyApp;
