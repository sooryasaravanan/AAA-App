import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuLLza1J7pr8f2GY0g5gjawH6AXCLL2tE",
  authDomain: "aaap-72257.firebaseapp.com",
  projectId: "aaap-72257",
  storageBucket: "aaap-72257.appspot.com",
  messagingSenderId: "595722916379",
  appId: "1:595722916379:web:e2703f988ef8d69b6d9ebe",
  measurementId: "G-5WY3X5JFXT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
