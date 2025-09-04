
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import favicon32 from './assets/favicons/favicon-32x32.png';
import favicon16 from './assets/favicons/favicon-16x16.png';
import appleTouch from './assets/favicons/apple-touch-icon.png';
import manifestUrl from './assets/favicons/site.webmanifest?url';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// Dynamically register favicons for Vite + GitHub Pages
const head = document.head;
const links = [
  { rel: 'icon', type: 'image/png', sizes: '32x32', href: favicon32 },
  { rel: 'icon', type: 'image/png', sizes: '16x16', href: favicon16 },
  { rel: 'apple-touch-icon', sizes: '180x180', href: appleTouch },
  { rel: 'manifest', href: manifestUrl }
];
for (const attrs of links) {
  const link = document.createElement('link');
  Object.entries(attrs).forEach(([k, v]) => link.setAttribute(k, String(v)));
  head.appendChild(link);
}
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
