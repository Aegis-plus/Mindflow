
export interface Note {
  id: string;
  title?: string;
  content: string;
  originalContent?: string; // Keep the "mess" if we want to revert
  createdAt: number;
  isArchived: boolean;
  isPinned?: boolean;
  tags?: string[];
  type: 'raw' | 'formatted' | 'summary';
}

export type NoteTab = 'notes' | 'chat' | 'settings';

export interface AIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
