# Ocean Notes — Personal Notes Manager (Frontend)

A modern, minimalist React app for creating, editing, searching, duplicating, and deleting personal notes. Data is stored in your browser's localStorage—no backend required.

## Features
- Sidebar list of notes with active selection
- Create, duplicate, edit, delete notes
- Search across titles and content
- Auto-save to localStorage
- Ocean Professional theme:
  - Primary: #2563EB (blue)
  - Secondary: #F59E0B (amber)
  - Error: #EF4444 (red)
  - Gradient accents and subtle shadows
  - Background: #f9fafb, Surface: #ffffff, Text: #111827

## Scripts

- `npm start` — run locally at http://localhost:3000
- `npm test` — run unit tests
- `npm run build` — production build

## Project Structure
- `src/App.js` — main app with modular UI components and localStorage logic
- `src/App.css` — Ocean Professional theme, layout, components styling
- `src/index.js`, `src/index.css` — bootstrapping and base styles
- `src/App.test.js` — basic smoke test

## Data Persistence
Notes are stored under the localStorage key `notes_app.v1.items`. Clear your browser storage to reset.

## Accessibility
- Buttons and inputs include accessible labels
- Keyboard and focus-friendly controls
