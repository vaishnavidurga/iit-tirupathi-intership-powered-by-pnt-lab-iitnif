// Import Firebase core functions
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXgNf4opHiGv8ZZ_MWyZdRqoPqS4ooyXY",
  authDomain: "soil-monitoring-b9e6d.firebaseapp.com",
  databaseURL: "https://soil-monitoring-b9e6d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "soil-monitoring-b9e6d",
  storageBucket: "soil-monitoring-b9e6d.firebasestorage.app",
  messagingSenderId: "849093422124",
  appId: "1:849093422124:web:2f173436ad14eeb7227589",
  measurementId: "G-V5ZWESGKTC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);
