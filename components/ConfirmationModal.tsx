import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 bg-black/60 backdrop-blur-sm"
             onClick={onCancel}
           />
           <motion.div
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 0.9, opacity: 0 }}
             className="bg-surface border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative z-10"
           >
             <h3 className="text-lg font-bold text-text mb-2">Confirm Action</h3>
             <p className="text-subtext mb-6">{message}</p>
             <div className="flex justify-end gap-3">
               <button 
                 onClick={onCancel}
                 className="px-4 py-2 rounded-lg text-subtext hover:bg-white/5 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={onConfirm}
                 className="px-4 py-2 rounded-lg bg-primary text-bg font-semibold shadow-lg active:scale-95 transition-transform"
               >
                 Confirm
               </button>
             </div>
           </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};