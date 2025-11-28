import React, { useState, useEffect } from 'react';
import { getDocuments, deleteDocument } from '../api';
import Button from './ui/Button';
import Input from './ui/Input';
import Notification from './ui/Notification';

const ManageDocuments = ({ onNavigateToUpload }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const data = await getDocuments();
            setDocuments(data);
        } catch (err) {
            setError('Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (filename) => {
        if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;

        try {
            await deleteDocument(filename);
            setNotification({ type: 'success', message: 'Document deleted successfully' });
            fetchDocuments();
        } catch (err) {
            setNotification({ type: 'error', message: 'Failed to delete document' });
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All Categories' || doc.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All Categories', ...new Set(documents.map(doc => doc.category || 'General'))];

    return (
        <div className="p-8 w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Manage Documents</h2>
                <Button onClick={onNavigateToUpload}>
                    <span className="mr-2">+</span> Add New Document
                </Button>
            </div>

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-dark-700 flex gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-dark-900 border-dark-700"
                        />
                    </div>
                    <select
                        className="bg-dark-900 border border-dark-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-dark-800/50 text-gray-400 text-xs uppercase tracking-wider border-b border-dark-700">
                                <th className="px-6 py-4 font-medium">Document Name</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Upload Time</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400">Loading documents...</td>
                                </tr>
                            ) : filteredDocuments.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400">No documents found</td>
                                </tr>
                            ) : (
                                filteredDocuments.map((doc) => (
                                    <tr key={doc.id || doc.filename} className="hover:bg-dark-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{doc.filename}</td>
                                        <td className="px-6 py-4 text-gray-300">{doc.category || 'General'}</td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">{doc.upload_time}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(doc.filename)}
                                                className="text-red-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Static for now as per design) */}
                {!loading && filteredDocuments.length > 0 && (
                    <div className="px-6 py-4 border-t border-dark-700 flex items-center justify-between text-sm text-gray-400">
                        <span>Showing 1 to {filteredDocuments.length} of {filteredDocuments.length} results</span>
                        <div className="flex space-x-2">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-700 disabled:opacity-50" disabled>&lt;</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-600 text-white">1</button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-dark-700 disabled:opacity-50" disabled>&gt;</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageDocuments;
