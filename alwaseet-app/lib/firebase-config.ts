// إعدادات Firebase المفصلة والآمنة

export const firebaseConfig = {
  // إعدادات المشروع الأساسية
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBW0h3eoOmUMKDlWI6arzj48oC39uNJQxQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "alwaseet-44f09.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "alwaseet-44f09",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "alwaseet-44f09.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "496053790776",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:496053790776:web:fc85e42e26ee86f4f81ecd",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MCTRHJBSJR",
}

// إعدادات الأمان لـ Firestore
export const firestoreSecurityRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // دوال مساعدة للأمان
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        (request.auth.token.email == 'admin@alwaseet.com' || 
         request.auth.token.email == 'asssaa1320@gmail.com' ||
         exists(/databases/$(database)/documents/admins/$(request.auth.uid)));
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidAd() {
      let data = request.resource.data;
      return data.title is string &&
        data.title.size() > 0 && data.title.size() <= 30 &&
        data.description is string &&
        data.description.size() > 0 && data.description.size() <= 200 &&
        data.price is number && data.price > 0 && data.price <= 100000 &&
        data.accountType is string && data.accountType.size() > 0 &&
        data.phoneNumber is string && data.phoneNumber.matches('^\\+20[0-9]{10}$') &&
        data.userId == request.auth.uid &&
        data.userEmail == request.auth.token.email;
    }
    
    function isValidUser() {
      let data = request.resource.data;
      return data.email == request.auth.token.email &&
        data.name is string && data.name.size() <= 50;
    }
    
    function isValidNews() {
      let data = request.resource.data;
      return data.title is string && data.title.size() > 0 && data.title.size() <= 100 &&
        data.content is string && data.content.size() > 0 && data.content.size() <= 5000;
    }
    
    function isRateLimited() {
      // تحديد معدل الطلبات - 10 طلبات في الدقيقة
      return false; // يتم التحكم في هذا من جانب التطبيق
    }
    
    // قواعد الإعلانات
    match /ads/{adId} {
      allow read: if resource.data.isActive == true;
      allow create: if isAuthenticated() && 
        isValidAd() && 
        !isRateLimited() &&
        // التحقق من عدد الإعلانات النشطة للمستخدم
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.adsCount < 2;
      allow update: if (isOwner(resource.data.userId) || isAdmin()) &&
        (isAdmin() || isValidAd());
      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // قواعد المستخدمين
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId) && isValidUser();
      allow update: if isOwner(userId) && isValidUser() ||
        (isAdmin() && request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['isVerified', 'isPremium', 'premiumExpiryDate']));
      allow delete: if isAdmin();
    }
    
    // قواعد الأخبار
    match /news/{newsId} {
      allow read: if resource.data.isActive == true;
      allow write: if isAdmin() && isValidNews();
    }
    
    // قواعد طلبات يد بيد
    match /handToHand/{requestId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.phoneNumber.matches('^\\+20[0-9]{10}$');
      allow update, delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // قواعد المسؤولين
    match /admins/{adminId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // سجلات الأمان - للقراءة من قبل المسؤولين فقط
    match /securityLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }
    
    // سجلات النشاطات
    match /activityLogs/{logId} {
      allow read: if isAdmin() || isOwner(resource.data.userId);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
    
    // إعدادات النظام - للمسؤولين فقط
    match /systemSettings/{settingId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // تقارير المستخدمين
    match /reports/{reportId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated() && 
        request.resource.data.reporterUserId == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if false;
    }
  }
}
`

// إعدادات الأمان لـ Firebase Storage
export const storageSecurityRules = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // قواعد عامة - منع الوصول غير المصرح به
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // صور الإعلانات
    match /ads/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.size < 2 * 1024 * 1024 && // 2MB
        request.resource.contentType.matches('image/.*') &&
        // التحقق من امتداد الملف
        fileName.matches('.*\\.(jpg|jpeg|png|gif|webp)$');
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // صور الأخبار - للمسؤولين فقط
    match /news/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && 
        (request.auth.token.email == 'admin@alwaseet.com' || 
         request.auth.token.email == 'asssaa1320@gmail.com') &&
        request.resource.size < 5 * 1024 * 1024 && // 5MB
        request.resource.contentType.matches('image/.*') &&
        fileName.matches('.*\\.(jpg|jpeg|png|gif|webp)$');
    }
    
    // صور المستخدمين
    match /users/{userId}/avatar.{ext} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.size < 1 * 1024 * 1024 && // 1MB
        request.resource.contentType.matches('image/.*') &&
        ext.matches('(jpg|jpeg|png|gif|webp)');
    }
  }
}
`

// إعدادات متقدمة للأمان
export const securityConfig = {
  // إعدادات المصادقة
  auth: {
    // مدة انتهاء الجلسة (24 ساعة)
    sessionTimeout: 24 * 60 * 60 * 1000,
    // عدد محاولات تسجيل الدخول المسموحة
    maxLoginAttempts: 5,
    // مدة الحظر بعد تجاوز المحاولات (15 دقيقة)
    lockoutDuration: 15 * 60 * 1000,
    // مقدمي الخدمة المسموح بهم
    allowedProviders: ["google.com", "facebook.com"],
  },

  // إعدادات تحديد معدل الطلبات
  rateLimit: {
    // إنشاء الإعلانات - 5 إعلانات في الساعة
    createAd: { requests: 5, window: 60 * 60 * 1000 },
    // تسجيل الدخول - 10 محاولات في الساعة
    login: { requests: 10, window: 60 * 60 * 1000 },
    // البحث - 100 طلب في الدقيقة
    search: { requests: 100, window: 60 * 1000 },
    // رفع الصور - 20 صورة في الساعة
    uploadImage: { requests: 20, window: 60 * 60 * 1000 },
    // إرسال التقارير - 5 تقارير في اليوم
    submitReport: { requests: 5, window: 24 * 60 * 60 * 1000 },
  },

  // إعدادات رفع الملفات
  fileUpload: {
    // الحد الأقصى لحجم الصورة (2MB)
    maxImageSize: 2 * 1024 * 1024,
    // أنواع الصور المسموحة
    allowedImageTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    // امتدادات الملفات المسموحة
    allowedExtensions: ["jpg", "jpeg", "png", "gif", "webp"],
    // الحد الأقصى لعدد الصور لكل إعلان
    maxImagesPerAd: 5,
  },

  // إعدادات التشفير
  encryption: {
    // خوارزمية التشفير
    algorithm: "aes-256-gcm",
    // طول المفتاح
    keyLength: 32,
    // طول IV
    ivLength: 16,
  },

  // إعدادات المراقبة
  monitoring: {
    // تسجيل الأنشطة المشبوهة
    logSuspiciousActivity: true,
    // إرسال تنبيهات للمسؤولين
    alertAdmins: true,
    // الاحتفاظ بالسجلات (30 يوم)
    logRetentionDays: 30,
  },
}

// متغيرات البيئة المطلوبة
export const requiredEnvVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_ADMIN_PRIVATE_KEY", // للخادم فقط
  "FIREBASE_ADMIN_CLIENT_EMAIL", // للخادم فقط
]

// التحقق من متغيرات البيئة
export function validateEnvironmentVariables(): { isValid: boolean; missing: string[] } {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
  }
}

// إعدادات Firebase Admin SDK (للخادم)
export const adminConfig = {
  credential: {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`,
}
