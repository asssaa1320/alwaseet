// اختبار اتصال Firebase
import { db, auth, storage } from "./firebase"
import { collection, getDocs, query, limit } from "firebase/firestore"
import { ref, listAll } from "firebase/storage"

export const testFirebaseConnection = async () => {
  const results = {
    firebaseInitialized: false,
    firestoreConnected: false,
    authInitialized: false,
    storageConnected: false,
    adsReadable: false,
    error: null as string | null,
  }

  try {
    // اختبار تهيئة Firebase
    results.firebaseInitialized = !!db && !!auth && !!storage

    // اختبار اتصال Firestore
    if (db) {
      try {
        const testQuery = query(collection(db, "test-collection"), limit(1))
        await getDocs(testQuery)
        results.firestoreConnected = true
      } catch (error) {
        // تجاهل أخطاء الصلاحيات، فقط نتحقق من الاتصال
        if (error.code !== "permission-denied") {
          throw error
        }
        results.firestoreConnected = true
      }
    }

    // اختبار تهيئة Auth
    results.authInitialized = !!auth

    // اختبار اتصال Storage
    if (storage) {
      try {
        const testRef = ref(storage, "test-folder")
        await listAll(testRef)
        results.storageConnected = true
      } catch (error) {
        // تجاهل أخطاء الصلاحيات، فقط نتحقق من الاتصال
        if (error.code !== "storage/unauthorized") {
          throw error
        }
        results.storageConnected = true
      }
    }

    // اختبار قراءة الإعلانات
    if (db) {
      try {
        const adsQuery = query(collection(db, "ads"), limit(1))
        await getDocs(adsQuery)
        results.adsReadable = true
      } catch (error) {
        if (error.code === "permission-denied") {
          results.error = "لا توجد صلاحيات كافية لقراءة الإعلانات. يرجى تحديث قواعد الأمان."
        } else {
          throw error
        }
      }
    }

    return results
  } catch (error) {
    console.error("Error testing Firebase connection:", error)
    results.error = error.message
    return results
  }
}
