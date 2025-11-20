import React from 'react';
import { User, Bot } from 'lucide-react';

const ChatBubble = ({ message, isUser }) => {
    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                <div className={`p-2 rounded-full ${isUser ? 'bg-blue-600' : 'bg-gray-600'} text-white shrink-0`}>
                    {isUser ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div
                    className={`p-3 rounded-lg text-sm ${isUser
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-gray-100 text-gray-800 rounded-tl-none dark:bg-gray-700 dark:text-gray-100'
                        }`}
                >
                    <p className="whitespace-pre-wrap">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default ChatBubble;
