// أدوات تشخيص مشاكل Firebase
import { db } from "./firebase"
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore"

export const debugFirebaseConnection = async () => {
  const results = {
    connection: false,
    permissions: false,
    adsCount: 0,
    errors: [] as string[],
    suggestions: [] as string[],
  }

  try {
    // 1. اختبار الاتصال الأساسي
    if (!db) {
      results.errors.push("Firebase غير مهيأ - تحقق من متغيرات البيئة")
      results.suggestions.push("تأكد من إعداد جميع متغيرات البيئة المطلوبة")
      return results
    }

    results.connection = true

    // 2. اختبار قراءة الإعلانات
    try {
      const adsRef = collection(db, "ads")
      const q = query(adsRef, orderBy("createdAt", "desc"), limit(5))
      const snapshot = await getDocs(q)

      results.permissions = true
      results.adsCount = snapshot.size

      if (snapshot.empty) {
        results.suggestions.push("لا توجد إعلانات في قاعدة البيانات")
        results.suggestions.push("قم بإنشاء بعض الإعلانات التجريبية")
      } else {
        console.log("تم العثور على إعلانات:", snapshot.size)
        snapshot.docs.forEach((doc) => {
          const data = doc.data()
          console.log(`إعلان: ${data.title} - نشط: ${data.isActive}`)
        })
      }
    } catch (permissionError: any) {
      results.permissions = false
      results.errors.push(`خطأ في الصلاحيات: ${permissionError.message}`)

      if (permissionError.message.includes("Missing or insufficient permissions")) {
        results.suggestions.push("قم بتحديث قواعد Firestore للسماح بقراءة الإعلانات")
        results.suggestions.push("استخدم القواعد المبسطة المتوفرة في المشروع")
      }
    }
  } catch (error: any) {
    results.errors.push(`خطأ عام: ${error.message}`)
    results.suggestions.push("تحقق من إعدادات Firebase وحالة الشبكة")
  }

  return results
}

export const testFirebaseRules = async () => {
  console.log("🔍 اختبار قواعد Firebase...")

  const tests = [
    {
      name: "قراءة الإعلانات",
      test: async () => {
        const adsRef = collection(db, "ads")
        const snapshot = await getDocs(query(adsRef, limit(1)))
        return snapshot.size >= 0
      },
    },
    {
      name: "قراءة الأخبار",
      test: async () => {
        const newsRef = collection(db, "news")
        const snapshot = await getDocs(query(newsRef, limit(1)))
        return snapshot.size >= 0
      },
    },
    {
      name: "قراءة طلبات يد بيد",
      test: async () => {
        const handToHandRef = collection(db, "handToHand")
        const snapshot = await getDocs(query(handToHandRef, limit(1)))
        return snapshot.size >= 0
      },
    },
  ]

  const results = []

  for (const test of tests) {
    try {
      const success = await test.test()
      results.push({ name: test.name, success, error: null })
      console.log(`✅ ${test.name}: نجح`)
    } catch (error: any) {
      results.push({ name: test.name, success: false, error: error.message })
      console.log(`❌ ${test.name}: فشل - ${error.message}`)
    }
  }

  return results
}
