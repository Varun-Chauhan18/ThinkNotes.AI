import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Read config from Vite env variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Debugging (prints presence of keys — safe)
console.info("[firebaseClient] config keys present:", {
  apiKey: !!firebaseConfig.apiKey,
  authDomain: !!firebaseConfig.authDomain,
  projectId: !!firebaseConfig.projectId,
  appId: !!firebaseConfig.appId,
});

function validate(cfg) {
  const required = ["apiKey", "authDomain", "projectId", "appId"];
  const missing = required.filter((k) => !cfg[k]);
  if (missing.length) {
    throw new Error(
      `Firebase config incomplete. Missing: ${missing.join(
        ", "
      )}. Make sure your CLIENT/.env contains VITE_FIREBASE_* keys and restart dev server.`
    );
  }
}

try {
  validate(firebaseConfig);
} catch (err) {
  console.error("[firebaseClient] init error:", err.message);
  throw err;
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
