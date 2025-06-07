#!/usr/bin/env node

/**
 * سكريبت لنشر جميع الفهارس المطلوبة لمشروع الوسيط
 * يجب تشغيله بعد تسجيل الدخول إلى Firebase CLI
 */

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 بدء نشر فهارس Firestore...")

try {
  // التحقق من وجود ملف الفهارس
  const indexesFile = path.join(process.cwd(), "firestore.indexes.json")

  if (!fs.existsSync(indexesFile)) {
    console.error("❌ ملف firestore.indexes.json غير موجود")
    process.exit(1)
  }

  // قراءة ملف الفهارس
  const indexesContent = fs.readFileSync(indexesFile, "utf8")
  const indexes = JSON.parse(indexesContent)

  console.log(`📊 تم العثور على ${indexes.indexes.length} فهرس`)

  // نشر الفهارس
  console.log("📤 جاري نشر الفهارس...")
  execSync("firebase deploy --only firestore:indexes", {
    stdio: "inherit",
    cwd: process.cwd(),
  })

  console.log("✅ تم نشر جميع الفهارس بنجاح!")
  console.log("")
  console.log("📋 ملخص الفهارس المنشورة:")

  // عرض ملخص الفهارس حسب المجموعة
  const indexesByCollection = {}
  indexes.indexes.forEach((index) => {
    const collection = index.collectionGroup
    if (!indexesByCollection[collection]) {
      indexesByCollection[collection] = 0
    }
    indexesByCollection[collection]++
  })

  Object.entries(indexesByCollection).forEach(([collection, count]) => {
    console.log(`   ${collection}: ${count} فهرس`)
  })

  console.log("")
  console.log("🎉 جميع الفهارس جاهزة للاستخدام!")
  console.log("💡 يمكنك الآن تشغيل التطبيق بدون مشاكل في الاستعلامات")
} catch (error) {
  console.error("❌ خطأ في نشر الفهارس:", error.message)
  console.log("")
  console.log("🔧 تأكد من:")
  console.log("   1. تسجيل الدخول إلى Firebase CLI: firebase login")
  console.log("   2. تحديد المشروع الصحيح: firebase use <project-id>")
  console.log("   3. وجود ملف firebase.json في المجلد الجذر")
  process.exit(1)
}
