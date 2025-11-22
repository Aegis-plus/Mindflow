import React from 'react';
import { Moon, Sun, Trash2, Github } from 'lucide-react';

interface SettingsProps {
  theme: 'mocha' | 'latte';
  toggleTheme: () => void;
  clearAll: () => void;
  requestConfirm: (message: string, onConfirm: () => void) => void;
}

export const Settings: React.FC<SettingsProps> = ({ theme, toggleTheme, clearAll, requestConfirm }) => {
  return (
    <div className="p-6 space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4 text-primary">Appearance</h2>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-4 bg-surface rounded-xl active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
             {theme === 'mocha' ? <Moon className="text-primary" /> : <Sun className="text-primary" />}
             <span className="font-medium">Theme Mode</span>
          </div>
          <span className="text-sm text-subtext uppercase tracking-wider">{theme}</span>
        </button>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 text-danger">Danger Zone</h2>
        <button
          onClick={() => {
             requestConfirm("Are you sure? This deletes ALL notes locally.", clearAll);
          }}
          className="w-full flex items-center gap-3 p-4 bg-danger/10 text-danger rounded-xl active:scale-[0.98] transition-transform border border-danger/20"
        >
          <Trash2 size={20} />
          <span className="font-bold">Delete All Data</span>
        </button>
        <p className="mt-2 text-xs text-subtext">
          MindFlow stores data in your browser's LocalStorage. Wiping data is irreversible.
        </p>
      </section>

      <section className="pt-10 text-center">
        <p className="text-subtext text-sm">MindFlow v1.1</p>
        <p className="text-subtext/50 text-xs mt-1">"Thoughts, structured."</p>
      </section>
    </div>
  );
};