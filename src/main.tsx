// Standalone dev entry only. The Host never uses this file.
import React from 'react';
import ReactDOM from 'react-dom/client';
import UserApp from './UserApp';
import './styles/dev.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <header className="dev-bar">ShopSphere (dev placeholder – the Host owns the real navbar)</header>
    <UserApp />
  </React.StrictMode>
);
