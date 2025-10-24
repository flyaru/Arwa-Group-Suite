import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { ChatMessage } from '../../types';

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const aiRef = useRef<any>(null); // To store the AI client instance

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                { role: 'model', text: `Hi ${user?.name || 'there'}! I'm the Arwa Assistant. How can I help you today?` }
            ]);
        }
    }, [isOpen, user, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', text: trimmedInput }];
        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);

        try {
            if (!aiRef.current) {
                // Dynamically import and initialize on first use
                const { GoogleGenAI } = await import('@google/genai');
                aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            }
            const ai = aiRef.current;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: trimmedInput,
            });

            const responseText = response.text;
            setMessages([...newMessages, { role: 'model', text: responseText }]);
        } catch (error) {
            console.error("Gemini API error:", error);
            setMessages([...newMessages, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 bg-[#D10028] text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-40"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Open chat assistant"
            >
                <Bot className="w-8 h-8" />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-28 right-8 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-lg w-full max-w-sm h-[60vh] flex flex-col z-50 overflow-hidden"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="chatbot-header"
                    >
                        {/* Header */}
                        <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <Bot className="w-6 h-6 text-red-400" />
                                <h2 id="chatbot-header" className="text-lg font-bold text-white">Arwa Assistant</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white" aria-label="Close chat">
                                <X className="w-6 h-6" />
                            </button>
                        </header>

                        {/* Messages */}
                        <main className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-red-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 text-slate-200 p-3 rounded-xl rounded-bl-none">
                                        <div className="flex items-center gap-2" aria-label="Assistant is typing">
                                           <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                           <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                           <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                             <div ref={messagesEndRef} />
                        </main>

                        {/* Input */}
                        <footer className="p-4 border-t border-white/10 flex-shrink-0">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="w-full flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D10028]/80"
                                    disabled={isLoading}
                                    aria-label="Your message"
                                />
                                <button type="submit" className="bg-[#D10028] text-white w-10 h-10 rounded-lg flex items-center justify-center disabled:opacity-50" disabled={isLoading || !inputValue.trim()} aria-label="Send message">
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;