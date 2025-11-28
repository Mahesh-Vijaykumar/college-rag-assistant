import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex justify-between items-center px-8 py-6">
                <div className="flex items-center space-x-2">
                    {/* Logo Placeholder */}
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-xl font-bold tracking-tight">CampusAI</span>
                </div>
                <button
                    onClick={() => navigate('/admin/login')}
                    className="group relative inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-full shadow-md hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                >
                    <span className="relative z-10">Admin Login</span>
                    <svg
                        className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 blur-sm opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                </button>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
                    CampusAI
                    <br />
                    Gemini X RAG
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
                    Your trusted source for quick, accurate information from all documents.
                </p>
                <button
                    onClick={() => navigate('/chat')}
                    className="group relative inline-flex items-center gap-3 px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-full shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                >
                    <span className="relative z-10">TRY NOW</span>
                    <svg
                        className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                </button>
            </main>
        </div>
    );
};

export default LandingPage;
