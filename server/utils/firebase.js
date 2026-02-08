const admin = require('firebase-admin');

// In production, we should use environment variables instead of a file
let serviceAccount = null;
try {
    serviceAccount = require('../serviceAccountKey.json');
} catch (e) {
    if (process.env.FIREBASE_PROJECT_ID) {
        serviceAccount = {
            type: process.env.FIREBASE_TYPE,
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: process.env.FIREBASE_AUTH_URI,
            token_uri: process.env.FIREBASE_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
            client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
        };
    }
}

let firebaseApp = null;
if (serviceAccount && (serviceAccount.project_id || serviceAccount.private_key)) {
    try {
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://mess-15fa0-default-rtdb.asia-southeast1.firebasedatabase.app"
        });
        console.log("✅ Firebase Admin Initialized Successfully");
    } catch (err) {
        console.error("❌ Firebase Initialization Error:", err.message);
    }
} else {
    console.log("⚠️ Firebase Admin not initialized: serviceAccountKey.json is missing. Falling back to local mode.");
}

const db = firebaseApp ? admin.database() : null;

module.exports = {
    db,
    admin,
    isInitialized: !!firebaseApp
};
