import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import './Login.css'; // Import the CSS file for styling

const Login = () => {
  const navigate = useNavigate();

  const checkUserExists = async (email) => {
    const q = query(collection(db, 'users'), where('gmail', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      localStorage.setItem('accessToken', token);
      const user = result.user;
      localStorage.setItem('userName', user.displayName);

      const userExists = await checkUserExists(user.email);
      if (userExists) {
        navigate('/home');
      } else {
        navigate('/register', {
          state: { gmail: user.email },
        });
      }
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome to My Secure Email App</h2>
        <p>Please sign in with Google to continue</p>
        <button className="google-sign-in-button" onClick={handleGoogleSignIn}>
          <span className="google-logo"></span>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
