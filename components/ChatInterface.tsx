import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Note, Message } from '../types';
import { askNotesRAG } from '../services/ai';
import { motion } from 'framer-motion';

interface ChatInterfaceProps {
  notes: Note[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ notes }) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hello! Ask me anything about your notes.', timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setIsLoading(true);

    const answer = await askNotesRAG(userMsg.content, notes);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: answer,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="w-full h-full relative bg-bg">
       {/* Messages Area - Absolute to fill space, with padding bottom to clear input */}
       <div className="absolute inset-0 overflow-y-auto px-4 pt-4 pb-32">
         <div className="space-y-4">
           {messages.map((msg) => (
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               key={msg.id}
               className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
             >
               <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-secondary text-bg' : 'bg-primary text-bg'}`}>
                   {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                 </div>
                 <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                   msg.role === 'user' 
                     ? 'bg-surface text-text rounded-tr-none' 
                     : 'bg-white/5 text-text border border-white/5 rounded-tl-none'
                 }`}>
                   {msg.content}
                 </div>
               </div>
             </motion.div>
           ))}
           {isLoading && (
             <div className="flex justify-start">
               <div className="flex gap-2 items-center bg-white/5 px-4 py-2 rounded-full">
                  <motion.div 
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-primary rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  />
               </div>
             </div>
           )}
           <div ref={messagesEndRef} />
         </div>
       </div>

       {/* Input Area - Absolutely positioned at the bottom */}
       <div className="absolute bottom-0 left-0 right-0 p-4 pb-24 bg-gradient-to-t from-bg via-bg to-transparent z-10">
          <div className="flex gap-2 bg-surface p-2 rounded-full border border-white/5 shadow-lg max-w-3xl mx-auto">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your brain..."
                className="flex-1 bg-transparent px-4 py-2 outline-none text-text placeholder:text-subtext/50"
            />
            <button 
                onClick={handleSend}
                disabled={isLoading || !query.trim()}
                className="p-3 bg-primary text-bg rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity flex-shrink-0"
            >
                <Send size={18} />
            </button>
          </div>
       </div>
    </div>
  );
};