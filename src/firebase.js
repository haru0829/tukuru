import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBcQMnjl0h5R3KUby7jNU0UHVqbBLuzxy8",
  authDomain: "tukuru-54288.firebaseapp.com",
  projectId: "tukuru-54288",
  storageBucket: "tukuru-54288.firebasestorage.app",
  messagingSenderId: "173247706292",
  appId: "1:173247706292:web:46609f6b3f7802b5a453e1"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
