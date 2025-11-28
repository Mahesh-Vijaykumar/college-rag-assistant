import React, { useState, useRef, useEffect } from 'react';
import { queryChat } from '../api';
import ChatBubble from '../components/ChatBubble';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ChatPage = () => {
    const [messages, setMessages] = useState([
        {
            text: "Hello! I'm your College Assistant. Ask me anything about admission requirements, scholarships, or campus policies.",
            isUser: false,
            sources: []
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { text: input, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const data = await queryChat(input);
            const botMessage = {
                text: data.answer,
                isUser: false,
                sources: data.sources || []
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage = {
                text: "Sorry, I encountered an error. Please try again.",
                isUser: false,
                sources: []
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const faqs = [
        "What are the admission requirements?",
        "Can I apply for multiple programs?",
        "What is the application deadline?",
        "Are there scholarships available?",
        "How do I check my application status?",
        "Is on-campus housing guaranteed?"
    ];

    return (
        <div className="flex h-screen bg-dark-900 overflow-hidden">
            {/* Sidebar (FAQ) */}
            <aside className="w-80 bg-dark-900 border-r border-dark-700 hidden md:flex flex-col">
                <div className="p-6 border-b border-dark-700">
                    <div className="flex items-center space-x-2 text-primary-500 mb-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        <span className="font-bold text-lg text-white">College RAG Assistant</span>
                    </div>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Frequently Asked Questions</h3>
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <button
                                key={index}
                                onClick={() => setInput(faq)}
                                className="w-full text-left p-3 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500 hover:bg-dark-700 transition-all text-sm text-gray-300"
                            >
                                {faq}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col bg-dark-900 relative">
                {/* Header (Mobile only) */}
                <div className="md:hidden p-4 border-b border-dark-700 flex items-center justify-between bg-dark-900 z-10">
                    <span className="font-bold text-lg">College RAG Assistant</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-3xl mx-auto">
                        {messages.map((msg, index) => (
                            <ChatBubble
                                key={index}
                                message={msg.text}
                                isUser={msg.isUser}
                                sources={msg.sources}
                            />
                        ))}
                        {loading && (
                            <div className="flex justify-start mb-6">
                                <div className="flex max-w-[80%] flex-row">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-dark-700 mr-3 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <div className="bg-dark-800 border border-dark-700 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-dark-900 border-t border-dark-700">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSend} className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask the College Assistant..."
                                className="w-full bg-dark-800 border border-dark-700 text-white rounded-xl pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500 shadow-lg"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-2 top-2 bottom-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg px-4 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChatPage;
