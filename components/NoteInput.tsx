import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Sparkles, Send, Hash, FileText } from 'lucide-react';
import { formatNoteMagic, rewriteTone, summarizeText } from '../services/ai';
import { Note } from '../types';

interface NoteInputProps {
  onSave: (content: string, type: 'raw' | 'formatted' | 'summary', tags: string[], originalContent?: string) => void;
  isOpen: boolean;
  onClose: () => void;
  initialNote?: Note | null;
  requestConfirm: (message: string, onConfirm: () => void) => void;
}

export const NoteInput: React.FC<NoteInputProps> = ({ onSave, isOpen, onClose, initialNote, requestConfirm }) => {
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset or populate when opening
  useEffect(() => {
    if (isOpen) {
      if (initialNote) {
        setText(initialNote.content);
        setTags(initialNote.tags?.join(', ') || "");
      } else {
        setText("");
        setTags("");
      }
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, initialNote]);

  const getTagsArray = () => {
    return tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSave(text, initialNote ? initialNote.type : 'raw', getTagsArray());
    setText("");
    setTags("");
    onClose();
  };

  const handleMagicSubmit = async () => {
    if (!text.trim()) return;
    
    requestConfirm("Use Magic Format? This will restructure your note using AI.", async () => {
        const rawText = text; // Capture raw text before processing
        setIsProcessing(true);
        try {
          const { content, tags: aiTags } = await formatNoteMagic(rawText);
          // Merge existing tags with AI tags
          const currentTags = getTagsArray();
          const mergedTags = Array.from(new Set([...currentTags, ...aiTags]));
          
          // Pass rawText as originalContent so we can Undo later
          onSave(content, 'formatted', mergedTags, rawText);
          setText("");
          setTags("");
          onClose();
        } catch (e) {
          alert("Failed to generate magic format. Please try again.");
        } finally {
          setIsProcessing(false);
        }
    });
  };

  const handleSummarizeSubmit = async () => {
    if (!text.trim()) return;

    requestConfirm("Summarize this text? The original text will be saved in history.", async () => {
        const rawText = text;
        setIsProcessing(true);
        try {
            const { content, tags: aiTags } = await summarizeText(rawText);
            const currentTags = getTagsArray();
            const mergedTags = Array.from(new Set([...currentTags, ...aiTags]));

            onSave(content, 'summary', mergedTags, rawText);
            setText("");
            setTags("");
            onClose();
        } catch (e) {
            alert("Failed to generate summary. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    });
  };

  const handleToneSwitch = async (newTone: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    const rewritten = await rewriteTone(text, newTone);
    setText(rewritten);
    setIsProcessing(false);
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-bg border-t border-white/10 rounded-t-3xl z-50 p-6 shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-text">{initialNote ? 'Edit Note' : 'New Note'}</h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-surface text-subtext">
                <X size={24} />
              </button>
            </div>

            {/* Input */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Dump your thoughts or paste an article here..."
              className="w-full bg-surface text-text p-4 rounded-xl resize-none flex-grow min-h-[200px] outline-none border border-transparent focus:border-primary/50 transition-all mb-2 placeholder:text-subtext/50"
            />

            {/* Tags Input */}
            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl mb-4 border border-transparent focus-within:border-primary/50">
                <Hash size={16} className="text-subtext" />
                <input 
                    type="text" 
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="tags, comma, separated"
                    className="bg-transparent w-full outline-none text-sm text-text placeholder:text-subtext/50"
                />
            </div>

            {/* Tone Pills */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
               <span className="text-xs text-subtext uppercase tracking-wide self-center mr-2">Rewrite:</span>
               {['Professional', 'Polite', 'Pirate'].map((tone) => (
                 <button 
                   key={tone}
                   disabled={isProcessing || !text}
                   onClick={() => handleToneSwitch(tone)}
                   className="px-3 py-1.5 rounded-full bg-surface border border-white/5 text-xs font-medium text-text whitespace-nowrap active:scale-95 transition-transform"
                 >
                   {tone}
                 </button>
               ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className="py-3 rounded-xl bg-surface text-text font-semibold flex flex-col justify-center items-center gap-1 active:scale-[0.98] transition-transform disabled:opacity-50 text-xs"
              >
                <Send size={18} />
                Save Raw
              </button>
              
              <button
                onClick={handleMagicSubmit}
                disabled={!text.trim() || isProcessing}
                className="py-3 rounded-xl bg-primary/10 text-primary font-bold flex flex-col justify-center items-center gap-1 active:scale-[0.98] transition-transform border border-primary/20 disabled:opacity-50 text-xs"
              >
                {isProcessing ? <Sparkles size={18} className="animate-spin" /> : <Sparkles size={18} />}
                Magic
              </button>

              <button
                onClick={handleSummarizeSubmit}
                disabled={!text.trim() || isProcessing}
                className="py-3 rounded-xl bg-secondary/10 text-secondary font-bold flex flex-col justify-center items-center gap-1 active:scale-[0.98] transition-transform border border-secondary/20 disabled:opacity-50 text-xs"
              >
                {isProcessing ? <FileText size={18} className="animate-spin" /> : <FileText size={18} />}
                Summary
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};