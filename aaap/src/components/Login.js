import React from 'react';
import { auth, firestore } from '../firebase/config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const Login = () => {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user) {
        const userRef = doc(collection(firestore, 'users'), user.email);
        await setDoc(userRef, {
          email: user.email,
          lastLogin: serverTimestamp(),
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  return (
    <div>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  );
};

export default Login;
