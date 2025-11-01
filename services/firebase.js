// services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// REPLACE these with your Firebase config
const firebaseConfig = {
 const firebaseConfig = {
  apiKey: "AIza...yourAPIKey...",
  authDomain: "imposterwho-game.firebaseapp.com",
  databaseURL: "https://imposterwho-game-default-rtdb.firebaseio.com",
  projectId: "imposterwho-game",
  storageBucket: "imposterwho-game.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Ensure user is logged in anonymously
export function ensureAuth() {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        unsub();
        resolve(user);
      } else {
        signInAnonymously(auth)
          .then((cred) => {
            unsub();
            resolve(cred.user);
          })
          .catch(reject);
      }
    });
  });
}
