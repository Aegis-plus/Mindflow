
import React, { useState, useEffect } from 'react';
import { NotebookPen, MessageSquare, Settings as SettingsIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, NoteTab } from './types';
import { getNotes, addNote, deleteNote, updateNote } from './services/storage';
import { NoteCard } from './components/NoteCard';
import { NoteInput } from './components/NoteInput';
import { ChatInterface } from './components/ChatInterface';
import { Settings } from './components/Settings';
import { ConfirmationModal } from './components/ConfirmationModal';
import { formatNoteMagic } from './services/ai';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState<NoteTab>('notes');
  
  // Input/Edit State
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  // Theme State with Persistence logic
  const [theme, setTheme] = useState<'mocha' | 'latte'>(() => {
    try {
      const saved = localStorage.getItem('mindflow_theme');
      if (saved === 'mocha' || saved === 'latte') return saved;
      
      // Fallback to system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'latte';
      }
    } catch (e) {
      console.warn("LocalStorage access denied", e);
    }
    return 'mocha';
  });

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  // Initialize Notes
  useEffect(() => {
    setNotes(getNotes());
  }, []);

  // Apply Theme & Persist
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'latte') {
      root.setAttribute('data-theme', 'latte');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('mindflow_theme', theme);
  }, [theme]);

  const requestConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleSaveNote = (title: string, content: string, type: 'raw' | 'formatted' | 'summary', tags: string[], originalContent?: string) => {
    if (editingNote) {
        const updated: Note = {
            ...editingNote,
            title,
            content,
            type,
            tags,
            // Preserve existing originalContent if not provided, or update it if provided
            originalContent: originalContent || editingNote.originalContent
        };
        const newNotes = updateNote(updated);
        setNotes(newNotes);
        setEditingNote(null);
    } else {
        const newNote: Note = {
            id: Date.now().toString(),
            title,
            content,
            createdAt: Date.now(),
            isArchived: false,
            isPinned: false,
            type,
            tags,
            originalContent
        };
        const updated = addNote(newNote);
        setNotes(updated);
    }
  };

  const handleUpdateContent = (id: string, content: string) => {
     const note = notes.find(n => n.id === id);
     if (note) {
         const updated = updateNote({ ...note, content });
         setNotes(updated);
     }
  };

  const handleEditStart = (note: Note) => {
      setEditingNote(note);
      setIsInputOpen(true);
  };

  const handlePin = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      // Toggle pinned state
      const updated = updateNote({ ...note, isPinned: !note.isPinned });
      setNotes(updated);
    }
  };

  const handleArchive = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      const updated = updateNote({ ...note, isArchived: true });
      setNotes(updated);
    }
  };

  const handleUndoMagic = (id: string) => {
      const note = notes.find(n => n.id === id);
      if (note && note.originalContent) {
          requestConfirm("Revert to original messy text?", () => {
              const updated = updateNote({
                  ...note,
                  content: note.originalContent!,
                  type: 'raw',
                  originalContent: undefined // Clear history after revert
              });
              setNotes(updated);
          });
      }
  };

  const handleClearAll = () => {
    localStorage.clear();
    // Preserve theme after clear
    localStorage.setItem('mindflow_theme', theme);
    setNotes([]);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'mocha' ? 'latte' : 'mocha');
  };

  // Sort: Pinned first, then by Date desc
  const activeNotes = notes
    .filter(n => !n.isArchived)
    .sort((a, b) => {
        if (a.isPinned === b.isPinned) {
            return b.createdAt - a.createdAt;
        }
        return a.isPinned ? -1 : 1;
    });

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-bg text-text transition-colors duration-300 overflow-hidden">
      
      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* VIEW: NOTES */}
          {activeTab === 'notes' && (
            <motion.div 
              key="notes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              // absolute inset-0 forces it to take full available space of main
              className="absolute inset-0 overflow-y-auto px-4 pt-12 pb-32 scrollbar-hide"
            >
              <h1 className="text-3xl font-black mb-1 text-text tracking-tight">My Notes</h1>
              <p className="text-subtext mb-6 text-sm">Swipe right to pin, left to delete.</p>
              
              {activeNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center mt-20 opacity-50">
                   <NotebookPen size={64} className="mb-4 text-primary" />
                   <p>No chaos yet.</p>
                </div>
              ) : (
                activeNotes.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onPin={handlePin}
                    onDelete={(id) => requestConfirm("Delete this note permanently?", () => setNotes(deleteNote(id)))}
                    onEdit={handleEditStart}
                    onUpdateContent={handleUpdateContent}
                    onUndo={handleUndoMagic}
                  />
                ))
              )}
            </motion.div>
          )}

          {/* VIEW: CHAT */}
          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // absolute inset-0 ensures flex container fills the screen for chat
              className="absolute inset-0 flex flex-col pt-12"
            >
              <div className="px-4 mb-2 shrink-0">
                 <h1 className="text-3xl font-black text-text tracking-tight">Ask Notes</h1>
                 <p className="text-subtext text-sm">Your second brain.</p>
              </div>
              <div className="flex-1 min-h-0 w-full">
                 <ChatInterface notes={notes} />
              </div>
            </motion.div>
          )}

          {/* VIEW: SETTINGS */}
          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 overflow-y-auto pt-12 pb-24 px-4"
            >
               <div>
                 <h1 className="text-3xl font-black text-text tracking-tight">Settings</h1>
               </div>
               <Settings 
                 theme={theme} 
                 toggleTheme={toggleTheme} 
                 clearAll={handleClearAll} 
                 requestConfirm={requestConfirm}
               />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Input Integration */}
      <NoteInput 
        isOpen={isInputOpen} 
        onClose={() => { setIsInputOpen(false); setEditingNote(null); }} 
        onSave={handleSaveNote}
        initialNote={editingNote}
        requestConfirm={requestConfirm}
      />

      {/* Floating Action Button for Add */}
      {activeTab === 'notes' && !isInputOpen && (
         <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-bg shadow-lg flex items-center justify-center z-40 active:scale-90 transition-transform"
            onClick={() => { setEditingNote(null); setIsInputOpen(true); }}
            whileHover={{ scale: 1.1 }}
         >
            <Plus size={28} />
         </motion.button>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg/90 backdrop-blur-md border-t border-white/5 pb-safe pt-2 px-6 flex justify-between items-center z-30 h-20">
        <button 
          onClick={() => setActiveTab('notes')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'notes' ? 'text-primary' : 'text-subtext'}`}
        >
          <NotebookPen size={24} strokeWidth={activeTab === 'notes' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Notes</span>
        </button>

        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'chat' ? 'text-primary' : 'text-subtext'}`}
        >
          <MessageSquare size={24} strokeWidth={activeTab === 'chat' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Ask AI</span>
        </button>

        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-primary' : 'text-subtext'}`}
        >
          <SettingsIcon size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}

export default App;
