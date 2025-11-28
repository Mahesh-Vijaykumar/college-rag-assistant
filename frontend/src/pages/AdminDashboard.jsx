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
        <div className="flex h-screen bg-dark-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-dark-900 border-r border-dark-700 flex flex-col">
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
            <main className="flex-1 overflow-y-auto bg-dark-900 p-8">
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
