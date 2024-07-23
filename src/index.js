import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App1 } from './app-1';
import { App2 } from './app-2';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <main>
      <App1 />
      <App2 />
    </main>
  </React.StrictMode>
);
