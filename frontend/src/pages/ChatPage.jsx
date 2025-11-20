import React, { useState, useRef, useEffect } from 'react';
import { Send, GraduationCap } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import { chatQuery } from '../api';

const ChatPage = () => {
    const [messages, setMessages] = useState([
        { text: "Hello! I'm the college AI assistant. How can I help you today?", isUser: false }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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

        const userMessage = input;
        setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatQuery(userMessage);
            setMessages(prev => [...prev, { text: response.answer, isUser: false }]);
        } catch (error) {
            setMessages(prev => [...prev, { text: "Sorry, I encountered an error. Please try again later.", isUser: false }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-center sticky top-0 z-10">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <GraduationCap size={32} />
                    <h1 className="text-xl font-bold">College Support Bot</h1>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full">
                {messages.map((msg, index) => (
                    <ChatBubble key={index} message={msg.text} isUser={msg.isUser} />
                ))}
                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="flex items-center gap-2 ml-10">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white dark:bg-gray-800 p-4 border-t dark:border-gray-700">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about college policies, events, etc..."
                        className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPage;
