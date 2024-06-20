// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import CurrentKeys from './components/CurrentKeys';
import SavedKeys from './components/SavedKeys';
import Layout from './components/Layout';

const App = () => {
  return (
    <Router>
      <div>
        <h1>My Secure Email App</h1>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="current-keys" element={<CurrentKeys />} />
            <Route path="saved-keys" element={<SavedKeys />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
