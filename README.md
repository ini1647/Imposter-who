# Imposter Who — Expo + Firebase Realtime Database (Full Template)

This is a full starter template for a multiplayer word game using **Expo** and **Firebase Realtime Database**.
It includes lobby creation, anonymous auth, role assignment (imposter vs regular), clue submission, voting, reveal, and score updates.

## Quick setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a Firebase project at https://console.firebase.google.com/
   - Enable **Realtime Database** and set a database URL.
   - Enable **Authentication → Sign-in method → Anonymous**.

3. In Firebase Console → Project settings → Add a Web app and copy the config, including the **databaseURL**.
   Paste those values into `services/firebase.js` (replace the REPLACE_ME placeholders).

4. Run the app:
   ```bash
   npx expo start
   ```
   Open with **Expo Go** on your phone.

## Notes

- This is a prototype. Before production, add Realtime Database rules to secure writes (use `auth.uid` as player IDs).
- The template uses `auth.currentUser.uid` for players — ensure anonymous auth is enabled.
- Consider moving role assignment and score updates to a trusted Cloud Function for cheat prevention.

