// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "zk-bug.firebaseapp.com",
  projectId: "zk-bug",
  storageBucket: "zk-bug.appspot.com",
  messagingSenderId: "873692584205",
  appId: "1:873692584205:web:03fe36e179438ff293b844",
  measurementId: "G-PX3D649KJB"
};

// Initialize Firebase
    export const app = initializeApp(firebaseConfig);
