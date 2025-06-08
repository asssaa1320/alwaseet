// ملف جديد لقواعد أمان Firebase

export const getFirebaseSecurityRules = () => {
  return `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // وظائف مساعدة للأمان
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidAd() {
      return request.resource.data.title is string &&
        request.resource.data.title.size() <= 30 &&
        request.resource.data.description is string &&
        request.resource.data.description.size() <= 200 &&
        request.resource.data.price is number &&
        request.resource.data.price > 0 &&
        request.resource.data.accountType is string &&
        request.resource.data.phoneNumber is string &&
        request.resource.data.userId == request.auth.uid;
    }
    
    function isValidNews() {
      return request.resource.data.title is string &&
        request.resource.data.content is string &&
        request.resource.data.createdAt is timestamp;
    }
    
    // قواعد الإعلانات
    match /ads/{adId} {
      allow read: if true;
      allow create: if isAuthenticated() && isValidAd();
      allow update: if isOwner(resource.data.userId) || isAdmin();
      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // قواعد المستخدمين
    match /users/{userId} {
      allow read: if true;
      allow create, update: if isOwner(userId);
      allow delete: if isAdmin();
      
      // منع تعديل حقول معينة إلا من قبل المسؤولين
      match /isVerified {
        allow write: if isAdmin();
      }
      
      match /isPremium {
        allow write: if isAdmin();
      }
    }
    
    // قواعد الأخبار
    match /news/{newsId} {
      allow read: if true;
      allow write: if isAdmin() && isValidNews();
    }
    
    // قواعد طلبات يد بيد
    match /handToHand/{requestId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // قواعد المسؤولين
    match /admins/{adminId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // سجلات الأمان
    match /securityLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false; // لا يمكن تعديل أو حذف سجلات الأمان
    }
  }
}

service firebase.storage {
  match /b/{bucket}/o {
    // قواعد عامة
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false; // منع الكتابة بشكل افتراضي
    }
    
    // صور الإعلانات
    match /ads/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId &&
        request.resource.size < 2 * 1024 * 1024 && // حد 2 ميجابايت
        request.resource.contentType.matches('image/.*'); // فقط الصور
    }
    
    // صور الأخبار
    match /news/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
        request.resource.size < 5 * 1024 * 1024 && // حد 5 ميجابايت
        request.resource.contentType.matches('image/.*'); // فقط الصور
    }
  }
}
  `
}
