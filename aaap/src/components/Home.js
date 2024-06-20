// src/components/Home.js
import React, { useEffect, useState } from 'react';

const Home = () => {
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  return (
    <div>
      <h1>Welcome, {userName}!</h1>
    </div>
  );
};

export default Home;
