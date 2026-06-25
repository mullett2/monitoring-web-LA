import { initializeApp }
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

import { getDatabase }
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyArvxs70-gLyHGLg4a79QDLNJCEgCrf2wg",
  authDomain: "hak-akses.firebaseapp.com",
  databaseURL: "https://hak-akses-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hak-akses",
  storageBucket: "hak-akses.firebasestorage.app",
  messagingSenderId: "1092450369209",
  appId: "1:1092450369209:web:a913d3e4e2440f1dad2568",
  measurementId: "G-8FRQLFDMGF"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);