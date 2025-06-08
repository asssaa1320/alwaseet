// إعدادات Firebase Admin SDK للخادم

import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { getStorage } from "firebase-admin/storage"

// تكوين Firebase Admin
const adminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
}

// تهيئة Firebase Admin (تجنب التهيئة المتكررة)
const app = getApps().length === 0 ? initializeApp(adminConfig) : getApps()[0]

export const adminDb = getFirestore(app)
export const adminAuth = getAuth(app)
export const adminStorage = getStorage(app)

// دوال مساعدة للإدارة
export async function verifyIdToken(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    return decodedToken
  } catch (error) {
    console.error("Error verifying ID token:", error)
    throw new Error("Invalid token")
  }
}

export async function createCustomToken(uid: string, additionalClaims?: object) {
  try {
    const customToken = await adminAuth.createCustomToken(uid, additionalClaims)
    return customToken
  } catch (error) {
    console.error("Error creating custom token:", error)
    throw new Error("Failed to create custom token")
  }
}

export async function setUserClaims(uid: string, claims: object) {
  try {
    await adminAuth.setCustomUserClaims(uid, claims)
  } catch (error) {
    console.error("Error setting user claims:", error)
    throw new Error("Failed to set user claims")
  }
}
