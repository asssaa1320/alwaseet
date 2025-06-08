import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, query, limit } from "firebase/firestore"

// دالة لاختبار اتصال Firebase
export const testFirebaseConnection = async () => {
  try {
    // تكوين Firebase
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBW0h3eoOmUMKDlWI6arzj48oC39uNJQxQ",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "alwaseet-44f09.firebaseapp.com",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "alwaseet-44f09",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "alwaseet-44f09.appspot.com",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "496053790776",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:496053790776:web:fc85e42e26ee86f4f81ecd",
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MCTRHJBSJR",
    }

    // تهيئة Firebase
    const app = initializeApp(firebaseConfig, "test-connection")
    const db = getFirestore(app)

    // محاولة قراءة بيانات من مجموعة الإعلانات
    const adsRef = collection(db, "ads")
    const q = query(adsRef, limit(1))
    const snapshot = await getDocs(q)

    // إذا نجحت العملية، فهذا يعني أن الاتصال يعمل
    return {
      success: true,
      message: "تم الاتصال بـ Firebase بنجاح",
      data: {
        docsCount: snapshot.size,
        empty: snapshot.empty,
      },
    }
  } catch (error: any) {
    // إذا فشلت العملية، فهناك مشكلة في الاتصال
    return {
      success: false,
      message: "فشل الاتصال بـ Firebase",
      error: {
        code: error.code,
        message: error.message,
      },
    }
  }
}

// دالة لاختبار قواعد الأمان
export const testFirebaseRules = async () => {
  try {
    // تكوين Firebase
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBW0h3eoOmUMKDlWI6arzj48oC39uNJQxQ",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "alwaseet-44f09.firebaseapp.com",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "alwaseet-44f09",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "alwaseet-44f09.appspot.com",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "496053790776",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:496053790776:web:fc85e42e26ee86f4f81ecd",
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MCTRHJBSJR",
    }

    // تهيئة Firebase
    const app = initializeApp(firebaseConfig, "test-rules")
    const db = getFirestore(app)

    // اختبار قراءة الإعلانات
    const adsRef = collection(db, "ads")
    const q = query(adsRef, limit(1))
    const adsSnapshot = await getDocs(q)

    // اختبار قراءة الأخبار
    const newsRef = collection(db, "news")
    const newsQuery = query(newsRef, limit(1))
    let newsSuccess = true
    try {
      await getDocs(newsQuery)
    } catch (error) {
      newsSuccess = false
    }

    // اختبار قراءة المستخدمين (يجب أن يفشل للمستخدم غير المسجل)
    const usersRef = collection(db, "users")
    const usersQuery = query(usersRef, limit(1))
    let usersSuccess = true
    try {
      await getDocs(usersQuery)
    } catch (error) {
      usersSuccess = false
    }

    return {
      success: true,
      message: "تم اختبار قواعد الأمان بنجاح",
      data: {
        adsReadable: !adsSnapshot.empty,
        newsReadable: newsSuccess,
        usersReadable: usersSuccess,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      message: "فشل اختبار قواعد الأمان",
      error: {
        code: error.code,
        message: error.message,
      },
    }
  }
}
