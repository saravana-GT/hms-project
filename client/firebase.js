import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    projectId: "mess-15fa0",
    databaseURL: "https://mess-15fa0-default-rtdb.asia-southeast1.firebasedatabase.app",
    // You might need to add your apiKey and authDomain here from your Firebase Console
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
