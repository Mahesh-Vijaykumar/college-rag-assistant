import React, { useState, useRef } from 'react';
import { uploadDocument } from '../api';
import Button from './ui/Button';
import Notification from './ui/Notification';

const UploadDocuments = () => {
    const [file, setFile] = useState(null);
    const [category, setCategory] = useState('');
    const [uploading, setUploading] = useState(false);
    const [notification, setNotification] = useState(null);
    const fileInputRef = useRef(null);

    const categories = [
        'Syllabus',
        'Research Paper',
        'Policy',
        'Lecture Notes',
        'General'
    ];

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            validateAndSetFile(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        if (selectedFile.type !== 'application/pdf') {
            setNotification({ type: 'error', message: 'Invalid file type. Please upload a PDF.' });
            return;
        }
        setFile(selectedFile);
        setNotification(null);
    };

    const handleUpload = async () => {
        if (!file) {
            setNotification({ type: 'error', message: 'Please select a file.' });
            return;
        }
        if (!category) {
            setNotification({ type: 'error', message: 'Please select a category.' });
            return;
        }

        setUploading(true);
        setNotification(null);

        try {
            await uploadDocument(file, category);
            setNotification({ type: 'success', message: 'Upload Successful. The document is now available.' });
            setFile(null);
            setCategory('');
        } catch (err) {
            setNotification({ type: 'error', message: 'Upload failed. Please try again.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-8 w-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Upload Documents</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Upload Area & Category */}
                <div className="space-y-6">
                    {/* Drag & Drop Area */}
                    <div
                        className={`
              border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer
              flex flex-col items-center justify-center min-h-[240px]
              ${file ? 'border-primary-500 bg-primary-500/5' : 'border-dark-700 hover:border-primary-500 hover:bg-dark-800'}
            `}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf"
                            onChange={handleFileSelect}
                        />

                        {file ? (
                            <div className="text-center">
                                <svg className="w-12 h-12 text-primary-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="font-medium text-white">{file.name}</p>
                                <p className="text-sm text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-lg font-medium text-white mb-2">Drag & drop your PDF file here, or click to browse</p>
                                <p className="text-sm text-gray-400 mb-6">Only .pdf files will be accepted</p>
                                <Button variant="primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                                    Select File
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Document Category</label>
                        <select
                            className="w-full bg-dark-800 border border-dark-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="" disabled>Select a category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Upload Button */}
                    <Button
                        variant="primary"
                        className="w-full py-4 text-lg bg-primary-600 hover:bg-primary-700"
                        onClick={handleUpload}
                        disabled={uploading || !file || !category}
                    >
                        {uploading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                            </span>
                        ) : (
                            <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Upload
                            </>
                        )}
                    </Button>
                </div>

                {/* Right Column: Status & Notifications */}
                <div className="space-y-6">
                    {/* File Selected Card */}
                    <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
                        <h3 className="font-semibold mb-4">File Selected</h3>
                        {file ? (
                            <div className="bg-dark-900 rounded-lg p-4 flex items-center justify-between border border-dark-700">
                                <div className="flex items-center space-x-3">
                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <div>
                                        <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button onClick={() => setFile(null)} className="text-gray-500 hover:text-white">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm italic">No file selected yet.</p>
                        )}
                    </div>

                    {/* Processing State */}
                    {uploading && (
                        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
                            <h3 className="font-semibold mb-4">Processing State</h3>
                            <div className="w-full bg-dark-900 rounded-full h-12 relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-primary-600/20 animate-pulse"></div>
                                <span className="relative z-10 font-medium text-primary-400 flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Notifications Area */}
                    <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
                        <h3 className="font-semibold mb-4">Notifications</h3>
                        {notification ? (
                            <Notification
                                type={notification.type}
                                message={notification.message}
                                onClose={() => setNotification(null)}
                            />
                        ) : (
                            <p className="text-gray-500 text-sm">No new notifications.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadDocuments;
