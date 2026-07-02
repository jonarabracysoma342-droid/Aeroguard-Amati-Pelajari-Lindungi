// Safely make window.fetch writable in sandboxed environments (like AI Studio previews)
// where it might be defined as a read-only getter, which causes errors in fetch/formdata polyfills.
try {
  let currentFetch = window.fetch;
  
  // Try to define it on window directly first
  try {
    Object.defineProperty(window, 'fetch', {
      get() { return currentFetch; },
      set(val) { currentFetch = val; },
      configurable: true,
      enumerable: true
    });
  } catch (e1) {
    // Log or ignore if window property is sealed
  }

  // Also try to define it on Window.prototype to catch any prototype lookups
  try {
    Object.defineProperty(Window.prototype, 'fetch', {
      get() { return currentFetch; },
      set(val) { currentFetch = val; },
      configurable: true,
      enumerable: true
    });
  } catch (e2) {
    // Log or ignore
  }
} catch (e) {
  console.warn("Fetch fallback setup error:", e);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
