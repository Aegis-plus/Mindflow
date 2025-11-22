import { Note } from '../types';

const STORAGE_KEY = 'chaos_notes_data_v1';

export const getNotes = (): Note[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load notes", e);
    return [];
  }
};

export const saveNotes = (notes: Note[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error("Failed to save notes", e);
  }
};

export const addNote = (note: Note): Note[] => {
  const notes = getNotes();
  const newNotes = [note, ...notes];
  saveNotes(newNotes);
  return newNotes;
};

export const updateNote = (updatedNote: Note): Note[] => {
  const notes = getNotes();
  const newNotes = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
  saveNotes(newNotes);
  return newNotes;
};

export const deleteNote = (id: string): Note[] => {
  const notes = getNotes();
  const newNotes = notes.filter(n => n.id !== id);
  saveNotes(newNotes);
  return newNotes;
};
