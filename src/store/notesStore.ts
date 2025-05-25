
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  codeId?: string;
  articleNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesStore {
  notes: Note[];
  addNote: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, noteData: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteNote: (id: string) => void;
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (noteData) => set((state) => {
        const newNote: Note = {
          ...noteData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { notes: [newNote, ...state.notes] };
      }),
      updateNote: (id, noteData) => set((state) => ({
        notes: state.notes.map(note => 
          note.id === id 
            ? { ...note, ...noteData, updatedAt: new Date().toISOString() }
            : note
        )
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(note => note.id !== id)
      })),
    }),
    {
      name: 'notes-storage',
    }
  )
);
