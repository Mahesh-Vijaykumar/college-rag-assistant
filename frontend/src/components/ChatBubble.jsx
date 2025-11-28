import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatBubble = ({ message, isUser, sources }) => {
    return (
        <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isUser ? 'bg-primary-600 ml-3' : 'bg-dark-700 mr-3'}`}>
                    {isUser ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    )}
                </div>

                {/* Message Content */}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Header for Assistant */}
                    {!isUser && (
                        <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-300">College Assistant</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${sources && sources.length > 0 ? 'bg-primary-600/20 text-primary-400' : 'bg-green-600/20 text-green-400'}`}>
                                {sources && sources.length > 0 ? 'RAG' : 'LLM'}
                            </span>
                        </div>
                    )}

                    {/* Bubble */}
                    <div className={`
            px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isUser
                            ? 'bg-primary-600 text-white rounded-tr-sm'
                            : 'bg-dark-800 border border-dark-700 text-gray-200 rounded-tl-sm'
                        }
          `}>
                        {isUser ? (
                            <div>{message}</div>
                        ) : (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    // Headings
                                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-3 mt-4 text-white" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-2 mt-3 text-white" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mb-2 mt-2 text-gray-100" {...props} />,

                                    // Paragraphs
                                    p: ({ node, ...props }) => <p className="mb-3 leading-relaxed text-gray-200" {...props} />,

                                    // Lists
                                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 space-y-1 ml-2" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1 ml-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="text-gray-200 leading-relaxed" {...props} />,

                                    // Bold and emphasis
                                    strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                                    em: ({ node, ...props }) => <em className="italic text-gray-100" {...props} />,

                                    // Code blocks
                                    code: ({ node, inline, ...props }) =>
                                        inline ? (
                                            <code className="bg-dark-900 px-1.5 py-0.5 rounded text-primary-400 font-mono text-xs" {...props} />
                                        ) : (
                                            <code className="block bg-dark-900 p-3 rounded-lg my-2 overflow-x-auto text-gray-300 font-mono text-xs" {...props} />
                                        ),

                                    // Links
                                    a: ({ node, ...props }) => <a className="text-primary-400 hover:text-primary-300 underline" {...props} />,

                                    // Blockquotes
                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary-600 pl-4 italic my-3 text-gray-300" {...props} />,

                                    // Horizontal rule
                                    hr: ({ node, ...props }) => <hr className="my-4 border-dark-700" {...props} />,
                                }}
                            >
                                {message}
                            </ReactMarkdown>
                        )}
                    </div>

                    {/* Sources */}
                    {!isUser && sources && sources.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-2">
                            <span className="font-medium">Sources:</span>
                            {sources.map((source, index) => (
                                <span key={index} className="bg-dark-800 border border-dark-700 px-2 py-1 rounded text-gray-400">
                                    {source}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatBubble;
