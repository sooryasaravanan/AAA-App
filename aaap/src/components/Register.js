import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import './Register.css'; // Create a CSS file for styling

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { gmail } = location.state || {}; // Access the gmail from state

  const [username, setUsername] = useState('');
  const [yahooMail, setYahooMail] = useState('');

  const handleRegister = async () => {
    try {
      await setDoc(doc(db, 'users', gmail), {
        username,
        gmail,
        yahooMail,
      });
      navigate('/home');
    } catch (error) {
      console.error('Error registering user', error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Gmail"
          value={gmail}
          readOnly
        />
        <input
          type="email"
          placeholder="Yahoo Mail"
          value={yahooMail}
          onChange={(e) => setYahooMail(e.target.value)}
        />
        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
};

export default Register;
