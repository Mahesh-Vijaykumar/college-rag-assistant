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
                    <span className="text-xl font-bold tracking-tight">Gladiia</span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full px-6"
                    onClick={() => navigate('/admin/login')}
                >
                    Admin Login
                </Button>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
                    Genesis AI RAG
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
                    Gladia is the STT engine built for developers. Sub-300ms guaranteed latency, infinite scale, and no infrastructure headaches.
                </p>
                <Button
                    variant="primary"
                    size="lg"
                    className="rounded-full px-8 py-3 bg-white text-dark-900 hover:bg-gray-100 font-semibold"
                    onClick={() => navigate('/chat')}
                >
                    Try Now
                </Button>
            </main>
        </div>
    );
};

export default LandingPage;
