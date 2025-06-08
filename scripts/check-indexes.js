#!/usr/bin/env node

/**
 * سكريبت للتحقق من حالة الفهارس في Firestore
 */

const { execSync } = require("child_process")

console.log("🔍 التحقق من حالة فهارس Firestore...")

try {
  // عرض قائمة الفهارس الحالية
  console.log("📋 الفهارس الحالية:")
  execSync("firebase firestore:indexes", {
    stdio: "inherit",
    cwd: process.cwd(),
  })

  console.log("")
  console.log("✅ تم عرض جميع الفهارس بنجاح")
  console.log("")
  console.log("💡 نصائح:")
  console.log('   - إذا كانت هناك فهارس في حالة "Building"، انتظر حتى اكتمالها')
  console.log("   - الفهارس الجديدة قد تستغرق عدة دقائق للبناء")
  console.log("   - يمكنك مراقبة التقدم من Firebase Console")
} catch (error) {
  console.error("❌ خطأ في التحقق من الفهارس:", error.message)
  process.exit(1)
}
