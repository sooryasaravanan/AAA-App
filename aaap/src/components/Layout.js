// src/components/Layout.js
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  return (
    <div>
      <nav className="navbar">
        <ul className="nav-links">
          <li className="nav-item"><Link to="/home">Home</Link></li>
          <li className="nav-item"><Link to="/home/current-keys">Current Keys</Link></li>
          <li className="nav-item"><Link to="/home/saved-keys">Saved Keys</Link></li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
};

export default Layout;
