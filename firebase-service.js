// Firebase Configuration and Data Service
// This file handles Firebase integration for the web dashboard

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, push, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

class FirebaseService {
  constructor() {
    this.db = database;
  }

  // Get real-time sensor data
  getSensorData(callback) {
    const sensorRef = ref(this.db, 'sensor_data');
    onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sensorArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        callback(sensorArray);
      }
    });
  }

  // Send irrigation command to Raspberry Pi
  async sendIrrigationCommand(command) {
    try {
      const commandRef = ref(this.db, 'irrigation_commands');
      await push(commandRef, {
        ...command,
        timestamp: Date.now()
      });
      return { success: true };
    } catch (error) {
      console.error('Error sending irrigation command:', error);
      return { success: false, error };
    }
  }

  // Get irrigation history
  getIrrigationHistory(callback) {
    const historyRef = ref(this.db, 'irrigation_history');
    onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const historyArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        callback(historyArray);
      }
    });
  }

  // Log irrigation event
  async logIrrigationEvent(event) {
    try {
      const eventRef = ref(this.db, 'irrigation_history');
      await push(eventRef, {
        ...event,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error logging irrigation event:', error);
    }
  }
}

export default new FirebaseService();