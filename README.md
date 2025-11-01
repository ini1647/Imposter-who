# Imposter Who (Expo + Firebase) - Prototype

This is a starter **React Native (Expo)** project for a multiplayer word game similar to "Imposter Who".
It uses **Firestore** for real-time multiplayer.

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Install Expo CLI globally if you don't have it:
   ```bash
   npm install -g expo-cli
   ```
3. Create a Firebase project and enable Firestore and Anonymous Auth.
4. In `services/firebase.js` replace the placeholder config with your Firebase project's config.
5. Run:
   ```bash
   expo start
   ```
6. Test on your device using Expo Go.

## Notes

- The Firebase config in `services/firebase.js` contains placeholders. Add your keys there.
- This is a prototype — you'll want to add Firestore security rules before deploying.

