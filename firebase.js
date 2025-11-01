// Firebase initialization for Realtime Database (placeholder config)
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// TODO: replace with your Firebase config from the console
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  databaseURL: "REPLACE_ME", // e.g. https://your-project-default-rtdb.firebaseio.com
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// ensure anonymous auth helper
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
