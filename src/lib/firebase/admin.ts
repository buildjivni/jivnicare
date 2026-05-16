import * as admin from "firebase-admin";

/**
 * JivniCare — Firebase Admin SDK Configuration
 * Used for server-side verification, session cookies, and custom claims.
 */

function getAdminApp() {
  if (!admin.apps.length) {
    try {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : undefined;

      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else {
        // Fallback for local development
        admin.initializeApp();
      }
    } catch (error) {
      console.error("Firebase Admin initialization error:", error);
    }
  }
  return admin;
}

// Export safe getters instead of evaluating at module load
export const getAdminAuth = () => getAdminApp().auth();
export const getAdminDb = () => getAdminApp().firestore();

export default admin;
