import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAjmFnQJcCg-m199MR4etxU8Kjz2uWTAv8",
  authDomain: "eventcalendar-883a0.firebaseapp.com",
  projectId: "eventcalendar-883a0",
  storageBucket: "eventcalendar-883a0.firebasestorage.app",
  messagingSenderId: "631043630792",
  appId: "1:631043630792:web:11b7a0ca561709b8dc67fd",
  measurementId: "G-96QGWJN630"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase inicializado correctamente");

export { db };
