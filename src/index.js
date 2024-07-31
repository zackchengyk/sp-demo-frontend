import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App1 } from './app-1';
import { App3 } from './app-3';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

function Main() {
  useEffect(() => {
    document.title = 'Singpass Demo';
  }, []);

  return (
    <main>
      <App1 />
      <App3 />
    </main>
  );
}
