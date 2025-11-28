import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManageDocuments from '../components/ManageDocuments';
import UploadDocuments from '../components/UploadDocuments';

const AdminDashboard = () => {
    const [activeView, setActiveView] = useState('manage'); // 'manage' or 'upload'
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    return (
        <div className="flex h-screen bg-black overflow-hidden relative">
            {/* Colorful Gradient Backgrounds */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />
                <div
                    className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                />
                <div
                    className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, transparent 70%)',
                        filter: 'blur(70px)',
                    }}
                />
            </div>

            {/* Sidebar */}
            <aside className="relative z-10 w-64 bg-dark-900/50 backdrop-blur-sm border-r border-dark-700 flex flex-col">
                {/* Header */}
                <div className="p-6 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        AP
                    </div>
                    <div>
                        <h1 className="font-bold text-white">Admin Panel</h1>
                        <p className="text-xs text-gray-400">College RAG Assistant</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-2">
                    <button
                        onClick={() => setActiveView('manage')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'manage'
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium">Manage Documents</span>
                    </button>

                    <button
                        onClick={() => setActiveView('upload')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'upload'
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="font-medium">Upload Documents</span>
                    </button>
                </nav>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-dark-700">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-dark-800 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="relative z-10 flex-1 overflow-y-auto bg-transparent p-8">
                {activeView === 'manage' ? (
                    <ManageDocuments onNavigateToUpload={() => setActiveView('upload')} />
                ) : (
                    <UploadDocuments />
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;

