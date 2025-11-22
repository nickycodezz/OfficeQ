//firebase imports
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxh7d5iiCBGMxD6FRT8KHCrqgkdJLLzTw",
  authDomain: "officeq-79d4f.firebaseapp.com",
  projectId: "officeq-79d4f",
  storageBucket: "officeq-79d4f.firebasestorage.app",
  messagingSenderId: "58254536640",
  appId: "1:58254536640:web:1ab7516c5491695dcb2225",
  measurementId: "G-QS4RYZ25L8"
};

//initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);