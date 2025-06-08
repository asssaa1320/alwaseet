// سكريبت لتنظيف قاعدة البيانات من البيانات التجريبية
const admin = require("firebase-admin")

// Initialize Firebase Admin
const serviceAccount = {
  // ضع هنا بيانات service account الخاصة بك
  type: "service_account",
  project_id: "alwaseet-44f09",
  // ... باقي البيانات
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://alwaseet-44f09-default-rtdb.firebaseio.com",
  })
}

const db = admin.firestore()

async function cleanupDatabase() {
  console.log("🧹 بدء تنظيف قاعدة البيانات...")

  try {
    // 1. حذف الأخبار التجريبية/الفارغة
    console.log("📰 تنظيف مجموعة الأخبار...")
    const newsRef = db.collection("news")
    const newsSnapshot = await newsRef.get()

    let deletedNews = 0
    for (const doc of newsSnapshot.docs) {
      const data = doc.data()
      // حذف الأخبار الفارغة أو التجريبية
      if (
        !data.title ||
        data.title === "" ||
        !data.content ||
        data.content === "" ||
        data.title.includes("تجريبي") ||
        data.content.includes("تجريبي")
      ) {
        await doc.ref.delete()
        deletedNews++
        console.log(`حذف خبر: ${doc.id}`)
      }
    }
    console.log(`✅ تم حذف ${deletedNews} خبر تجريبي/فارغ`)

    // 2. حذف الإعلانات التجريبية/الفارغة
    console.log("📢 تنظيف مجموعة الإعلانات...")
    const adsRef = db.collection("ads")
    const adsSnapshot = await adsRef.get()

    let deletedAds = 0
    for (const doc of adsSnapshot.docs) {
      const data = doc.data()
      // حذف الإعلانات التجريبية أو غير المكتملة
      if (
        !data.title ||
        data.title === "" ||
        !data.description ||
        data.description === "" ||
        data.title.includes("تجريبي") ||
        data.description.includes("تجريبي") ||
        data.title.includes("test") ||
        data.title.includes("Test")
      ) {
        await doc.ref.delete()
        deletedAds++
        console.log(`حذف إعلان: ${doc.id}`)
      }
    }
    console.log(`✅ تم حذف ${deletedAds} إعلان تجريبي/فارغ`)

    // 3. تنظيف طلبات يد بيد الفارغة
    console.log("🤝 تنظيف مجموعة طلبات يد بيد...")
    const handToHandRef = db.collection("handToHand")
    const handToHandSnapshot = await handToHandRef.get()

    let deletedRequests = 0
    for (const doc of handToHandSnapshot.docs) {
      const data = doc.data()
      // حذف الطلبات الفارغة
      if (
        !data.type ||
        data.type === "" ||
        !data.userId ||
        data.userId === "" ||
        !data.phoneNumber ||
        data.phoneNumber === ""
      ) {
        await doc.ref.delete()
        deletedRequests++
        console.log(`حذف طلب يد بيد: ${doc.id}`)
      }
    }
    console.log(`✅ تم حذف ${deletedRequests} طلب يد بيد فارغ`)

    console.log("🎉 تم الانتهاء من تنظيف قاعدة البيانات بنجاح!")
  } catch (error) {
    console.error("❌ خطأ في تنظيف قاعدة البيانات:", error)
  }
}

// تشغيل التنظيف
cleanupDatabase()
