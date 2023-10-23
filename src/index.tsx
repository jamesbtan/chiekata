/* @refresh reload */
import { delegateEvents, render } from 'solid-js/web';
import { openDB, deleteDB } from 'idb';

import './index.css';
import App from './App';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

if (!('indexedDB' in window)) {
  throw new Error('This app relies on indexedDB');
}

//await deleteDB('chiekata-db');
const db = await openDB('chiekata-db', 1, {
  upgrade(db) {
    db.createObjectStore('tags', {keyPath: 'name'});
    // [{random}]
    const notes = db.createObjectStore('notes', {keyPath: 'text'});
    // [{nextRev}]
    notes.createIndex('rev', 'nextRev');
  },
});

render(() => <App db={db}/>, root!);
