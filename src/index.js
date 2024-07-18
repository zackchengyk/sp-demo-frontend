import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Callback from './callback';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename="/sp-demo-frontend">
      <Routes>
        <Route path="/" element={<App />}></Route>
        <Route path="/callback" element={<Callback />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
