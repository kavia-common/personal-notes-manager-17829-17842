import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean Professional Notes App
 * - Sidebar with list and create
 * - Main area for viewing/editing notes
 * - LocalStorage persistence
 * - Modern minimalist UI using provided theme
 */

// Utilities
const STORAGE_KEY = 'notes_app.v1.items';

// PUBLIC_INTERFACE
export function generateId() {
  /** Generate a simple unique id based on time and randomness */
  return `note_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// PUBLIC_INTERFACE
export function loadNotes() {
  /** Load notes from localStorage, returning an array */
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function saveNotes(notes) {
  /** Persist notes array to localStorage */
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// PUBLIC_INTERFACE
function App() {
  /**
   * Root of the Notes App - sets up theme and layout containers.
   * Maintains notes state and selected note id; passes handlers to children.
   */
  const [notes, setNotes] = useState(() => loadNotes());
  const [selectedId, setSelectedId] = useState(() => (loadNotes()[0]?.id ?? null));
  const [query, setQuery] = useState('');

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    document.body.setAttribute('data-theme', 'ocean');
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(n => (n.title + ' ' + n.content).toLowerCase().includes(q));
  }, [notes, query]);

  const selectedNote = useMemo(() => notes.find(n => n.id === selectedId) || null, [notes, selectedId]);

  // PUBLIC_INTERFACE
  const createNote = () => {
    /** Create a new note with default content and select it */
    const id = generateId();
    const newNote = {
      id,
      title: 'Untitled Note',
      content: '',
      updatedAt: Date.now()
    };
    const next = [newNote, ...notes];
    setNotes(next);
    setSelectedId(id);
  };

  // PUBLIC_INTERFACE
  const deleteNote = (id) => {
    /** Delete note by id; adjust selection appropriately */
    const idx = notes.findIndex(n => n.id === id);
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    if (selectedId === id) {
      const fallback = next[Math.min(idx, next.length - 1)];
      setSelectedId(fallback?.id ?? null);
    }
  };

  // PUBLIC_INTERFACE
  const updateNote = (id, patch) => {
    /** Update note by id with provided patch fields */
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n))
    );
  };

  // PUBLIC_INTERFACE
  const duplicateNote = (id) => {
    /** Create a duplicate of the note and select it */
    const original = notes.find(n => n.id === id);
    if (!original) return;
    const id2 = generateId();
    const dup = {
      ...original,
      id: id2,
      title: `${original.title} (Copy)`,
      updatedAt: Date.now()
    };
    const idx = notes.findIndex(n => n.id === id);
    const next = [...notes.slice(0, idx + 1), dup, ...notes.slice(idx + 1)];
    setNotes(next);
    setSelectedId(id2);
  };

  return (
    <div className="ocean-app">
      <HeaderBar onCreate={createNote} query={query} setQuery={setQuery} />
      <div className="workspace">
        <Sidebar
          notes={filtered}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onCreate={createNote}
          onDelete={deleteNote}
          onDuplicate={duplicateNote}
        />
        <MainArea
          note={selectedNote}
          onChange={(patch) => selectedNote && updateNote(selectedNote.id, patch)}
          onDelete={() => selectedNote && deleteNote(selectedNote.id)}
        />
      </div>
      <Footer />
    </div>
  );
}

function HeaderBar({ onCreate, query, setQuery }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="logo">📝</div>
        <div className="brand-text">
          <span className="brand-title">Ocean Notes</span>
          <span className="brand-subtitle">Personal notes, beautifully simple</span>
        </div>
      </div>
      <div className="header-actions">
        <div className="search">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            aria-label="Search notes"
          />
        </div>
        <button className="btn btn-primary" onClick={onCreate} aria-label="Create new note">
          + New Note
        </button>
      </div>
    </header>
  );
}

function Sidebar({ notes, selectedId, setSelectedId, onCreate, onDelete, onDuplicate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Notes</span>
        <button className="btn btn-secondary" onClick={onCreate}>New</button>
      </div>
      <div className="note-list">
        {notes.length === 0 && (
          <div className="empty">
            <p>No notes yet</p>
            <button className="btn btn-primary" onClick={onCreate}>Create your first note</button>
          </div>
        )}
        {notes.map(n => (
          <button
            key={n.id}
            className={`note-list-item ${selectedId === n.id ? 'active' : ''}`}
            onClick={() => setSelectedId(n.id)}
            title={n.title}
          >
            <div className="note-item-title">{n.title || 'Untitled'}</div>
            <div className="note-item-row">
              <span className="note-item-date">{new Date(n.updatedAt).toLocaleString()}</span>
              <span className="note-item-actions" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn" onClick={() => onDuplicate(n.id)} title="Duplicate">⧉</button>
                <button className="icon-btn danger" onClick={() => onDelete(n.id)} title="Delete">✕</button>
              </span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}

function MainArea({ note, onChange, onDelete }) {
  if (!note) {
    return (
      <main className="main empty-state">
        <div className="empty-card">
          <h2>Welcome to Ocean Notes</h2>
          <p>Create a new note to get started.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="editor-card">
        <div className="editor-toolbar">
          <input
            className="title-input"
            value={note.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Note title"
            aria-label="Note title"
          />
          <div className="toolbar-actions">
            <button className="btn btn-ghost danger" onClick={onDelete} title="Delete note">Delete</button>
          </div>
        </div>
        <textarea
          className="content-area"
          value={note.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Start typing your note here..."
          aria-label="Note content"
        />
        <div className="editor-footer">
          <span>Last updated: {new Date(note.updatedAt).toLocaleString()}</span>
          <span className="hint">Saved locally</span>
        </div>
      </div>
    </main>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span>Ocean Professional Theme</span>
      <span className="dot">•</span>
      <span>Local storage powered</span>
    </footer>
  );
}

export default App;
