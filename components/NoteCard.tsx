
import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Pin, PinOff, Trash2, Clock, Pencil, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onUpdateContent: (id: string, content: string) => void;
  onUndo: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onPin, onDelete, onEdit, onUpdateContent, onUndo }) => {
  // Motion values for drag gestures
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-100, 0, 100], [1, 0, 1]);
  
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.x < -100) {
      // Swiped Left -> Delete
      onDelete(note.id);
    } else if (info.offset.x > 100) {
      // Swiped Right -> Pin
      onPin(note.id);
    }
  };

  // Handle check/uncheck of task list items
  const handleCheckboxClick = (isChecked: boolean, lineIndex: number) => {
    const lines = note.content.split('\n');
    // The lineIndex provided by remark corresponds to the markdown line number (1-based)
    
    if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        const newTaskState = isChecked ? '[x]' : '[ ]';
        // Replace the first occurrence of a checkbox pattern on that line
        const newLine = line.replace(/\[([ x])\]/, newTaskState);
        
        if (newLine !== line) {
            lines[lineIndex] = newLine;
            onUpdateContent(note.id, lines.join('\n'));
        }
    }
  };

  return (
    <div className="relative mb-4 select-none touch-pan-y">
      {/* Background Layer for Actions */}
      <motion.div 
        style={{ opacity: bgOpacity }}
        className="absolute inset-0 rounded-xl flex justify-between items-center px-6 pointer-events-none overflow-hidden"
      >
        {/* Left Action (Swipe Right to Reveal) -> Pin */}
        <div className={`flex items-center gap-2 ${x.get() > 0 ? 'opacity-100' : 'opacity-0'}`}>
           {note.isPinned ? <PinOff className="text-text" /> : <Pin className="text-text" />}
           <span className="text-text font-bold">{note.isPinned ? 'Unpin' : 'Pin'}</span>
        </div>

        {/* Right Action (Swipe Left to Reveal) -> Delete */}
        <div className={`flex items-center gap-2 ${x.get() < 0 ? 'opacity-100' : 'opacity-0'}`}>
           <span className="text-white font-bold">Delete</span>
           <Trash2 className="text-white" />
        </div>
        
        {/* Dynamic Background Color Overlay */}
        <motion.div 
          className="absolute inset-0 -z-10 rounded-xl"
          style={{ 
            backgroundColor: x.get() > 0 ? 'var(--color-secondary)' : 'var(--color-danger)',
            opacity: useTransform(x, [-50, 0, 50], [1, 0, 1])
          }} 
        />
      </motion.div>

      {/* Foreground Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x, touchAction: 'pan-y' }}
        className={`bg-surface p-5 rounded-xl shadow-sm relative z-10 border active:cursor-grabbing cursor-grab group ${note.isPinned ? 'border-primary/30' : 'border-white/5'}`}
        whileTap={{ scale: 0.995 }}
      >
        {note.isPinned && (
            <div className="absolute -top-2 -right-2 bg-primary text-bg p-1.5 rounded-full shadow-md z-20">
                <Pin size={12} fill="currentColor" />
            </div>
        )}

        <div className="prose max-w-none text-text prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 prose-a:text-primary">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
                input: ({node, ...props}) => {
                    if (props.type === 'checkbox') {
                        // node.position.start.line is 1-based
                        const lineIdx = node?.position?.start.line ? node.position.start.line - 1 : -1;
                        return (
                            <input 
                                type="checkbox" 
                                checked={props.checked} 
                                onChange={(e) => handleCheckboxClick(e.target.checked, lineIdx)}
                                className="accent-primary mr-2 h-4 w-4 rounded border-gray-300 cursor-pointer"
                            />
                        );
                    }
                    return <input {...props} />;
                }
            }}
          >
            {note.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
                {note.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-medium px-2 py-1 bg-white/5 text-subtext rounded-md">
                        #{tag}
                    </span>
                ))}
            </div>
        )}
        
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10 text-xs text-subtext">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(note); }}
                className="flex items-center gap-1 text-primary hover:text-primary/80 p-1 -ml-1 rounded"
              >
                <Pencil size={12} />
                <span>Edit</span>
              </button>
            </div>
            <div className="flex gap-2 items-center">
               {(note.type === 'formatted' || note.type === 'summary') && note.originalContent && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onUndo(note.id); }}
                    className="flex items-center gap-1 text-danger hover:text-danger/80 px-2 py-0.5 rounded-full bg-danger/10 border border-danger/20"
                    title="Revert to original raw text"
                  >
                    <RotateCcw size={10} />
                    <span>Undo</span>
                  </button>
               )}
               {note.type === 'formatted' && <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] uppercase tracking-wider">Magic</span>}
               {note.type === 'summary' && <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-[10px] uppercase tracking-wider">Summary</span>}
            </div>
        </div>
      </motion.div>
    </div>
  );
};
