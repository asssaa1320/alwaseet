// سكريبت لإعداد قواعد أمان Firestore أساسية تسمح بقراءة الإعلانات
const fs = require("fs")
const { exec } = require("child_process")
const path = require("path")

// قواعد أمان Firestore الأساسية
const basicFirestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // السماح بقراءة جميع الإعلانات للجميع
    match /ads/{adId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // السماح بقراءة المستخدمين للمستخدمين المسجلين
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // قواعد افتراضية
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`

// قواعد أمان Storage الأساسية
const basicStorageRules = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // السماح بقراءة جميع الملفات
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
`

// إنشاء الملفات المؤقتة
const tempDir = path.join(__dirname, "../temp")
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir)
}

const firestoreRulesPath = path.join(tempDir, "firestore.rules")
const storageRulesPath = path.join(tempDir, "storage.rules")

// كتابة القواعد إلى الملفات
fs.writeFileSync(firestoreRulesPath, basicFirestoreRules)
fs.writeFileSync(storageRulesPath, basicStorageRules)

console.log("تم إنشاء ملفات القواعد المؤقتة")

// إنشاء ملف firebase.json إذا لم يكن موجودًا
const firebaseJsonPath = path.join(__dirname, "../firebase.json")
if (!fs.existsSync(firebaseJsonPath)) {
  const firebaseJson = {
    firestore: {
      rules: "temp/firestore.rules",
      indexes: "firestore.indexes.json",
    },
    storage: {
      rules: "temp/storage.rules",
    },
  }

  fs.writeFileSync(firebaseJsonPath, JSON.stringify(firebaseJson, null, 2))
  console.log("تم إنشاء ملف firebase.json")
}

// نشر القواعد إلى Firebase
console.log("جاري نشر قواعد الأمان إلى Firebase...")
exec("firebase deploy --only firestore:rules,storage", (error, stdout, stderr) => {
  if (error) {
    console.error(`خطأ في نشر القواعد: ${error.message}`)
    console.log("تأكد من تثبيت Firebase CLI وتسجيل الدخول:")
    console.log("npm install -g firebase-tools")
    console.log("firebase login")
    console.log("firebase use --add")
    return
  }

  console.log("تم نشر قواعد الأمان بنجاح!")
  console.log(stdout)

  // حذف الملفات المؤقتة
  fs.unlinkSync(firestoreRulesPath)
  fs.unlinkSync(storageRulesPath)
  fs.rmdirSync(tempDir)
  console.log("تم حذف الملفات المؤقتة")
})
