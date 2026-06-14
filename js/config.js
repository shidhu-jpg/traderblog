// ════════════════════════════════════════════════════
//  FIREBASE CONFIGURATION
//  Fill in your Firebase project details below.
//  How to get these values:
//  1. Go to https://console.firebase.google.com
//  2. Open your project → Project Settings (gear icon)
//  3. Scroll to "Your apps" → Web app → SDK setup
//  4. Copy the firebaseConfig object values below
// ════════════════════════════════════════════════════

const firebaseConfig = {
  apiKey:            "AIzaSyC62IqvxWWD07shomzpLz1RSVSnr9S4diI",
  authDomain:        "bolgwebsite.firebaseapp.com",
  projectId:         "bolgwebsite",
  storageBucket:     "bolgwebsite.firebasestorage.app",
  messagingSenderId: "503696350426",
  appId:             "1:503696350426:web:d18238b5c145829c6359e3"
};

// ── Initialize Firebase ──────────────────────────────
(function () {
  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    window._firebaseReady = true;
  } catch (e) {
    window._firebaseReady = false;
    console.error('[MNH Blog] Firebase init failed. Did you fill in js/config.js?', e);
  }
})();
