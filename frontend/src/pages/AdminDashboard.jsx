import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Trash2, FileText, LogOut } from 'lucide-react';
import { getDocuments, uploadDocument, deleteDocument } from '../api';

const AdminDashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [file, setFile] = useState(null);
    const [category, setCategory] = useState('General');
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const docs = await getDocuments();
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to fetch documents", error);
            if (error.response && error.response.status === 401) {
                navigate('/admin/login');
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        try {
            await uploadDocument(file, category);
            setFile(null);
            // Reset file input
            document.getElementById('fileInput').value = "";
            fetchDocuments();
        } catch (error) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (filename) => {
        if (window.confirm(`Are you sure you want to delete ${filename}?`)) {
            try {
                await deleteDocument(filename);
                fetchDocuments();
            } catch (error) {
                alert("Delete failed");
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>

                {/* Upload Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                        <Upload size={20} /> Upload New Document
                    </h2>
                    <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select PDF</label>
                            <input
                                id="fileInput"
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                                required
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="General">General</option>
                                <option value="Policies">Policies</option>
                                <option value="Events">Events</option>
                                <option value="Curriculum">Curriculum</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </form>
                </div>

                {/* Document List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            <FileText size={20} /> Uploaded Documents
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Filename</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Upload Time</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {documents.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                            No documents uploaded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    documents.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                                            <td className="px-6 py-4 text-gray-800 dark:text-gray-200 font-medium">{doc.filename}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200">
                                                    {doc.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                                                {new Date(parseFloat(doc.upload_time) * 1000).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(doc.filename)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
