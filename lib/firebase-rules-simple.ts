// قواعد أمان Firestore مبسطة للسماح بقراءة الإعلانات
export const getSimpleFirestoreRules = () => {
  return `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // === دوال مساعدة للأمان ===
    
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
    
    function isOwnerOrAdmin(userId) {
      return isOwner(userId) || isAdmin();
    }
    
    // === قواعد الإعلانات - مبسطة للسماح بالقراءة ===
    match /ads/{adId} {
      // السماح بقراءة جميع الإعلانات للجميع
      allow read: if true;
      
      // السماح بإنشاء الإعلانات للمستخدمين المسجلين فقط
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      
      // السماح بتحديث الإعلان لصاحبه أو المسؤول
      allow update: if isOwnerOrAdmin(resource.data.userId);
      
      // السماح بحذف الإعلان لصاحبه أو المسؤول
      allow delete: if isOwnerOrAdmin(resource.data.userId);
    }
    
    // === قواعد المستخدمين ===
    match /users/{userId} {
      allow read: if isAuthenticated();
      
      allow create: if isOwner(userId) && 
                       request.resource.data.email == request.auth.token.email;
      
      allow update: if isOwner(userId) || isAdmin();
      
      allow delete: if isAdmin();
    }
    
    // === قواعد الأخبار ===
    match /news/{newsId} {
      allow read: if true; // السماح للجميع بقراءة الأخبار
      allow write: if isAdmin();
    }
    
    // === قواعد طلبات يد بيد ===
    match /handToHand/{requestId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwnerOrAdmin(resource.data.userId);
    }
    
    // === قواعد المسؤولين ===
    match /admins/{adminId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // === قواعد التقارير ===
    match /reports/{reportId} {
      allow read: if isAdmin() || isOwner(resource.data.reporterUserId);
      allow create: if isAuthenticated() && 
                       request.resource.data.reporterUserId == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // === قواعد الإشعارات ===
    match /notifications/{notificationId} {
      allow read: if isOwnerOrAdmin(resource.data.userId);
      allow create: if isAdmin();
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwnerOrAdmin(resource.data.userId);
    }
    
    // === سجلات الأمان ===
    match /securityLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }
    
    // === إعدادات النظام ===
    match /systemSettings/{settingId} {
      allow read: if true; // السماح للجميع بقراءة الإعدادات العامة
      allow write: if isAdmin();
    }
    
    // === قواعد افتراضية ===
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`
}

// قواعد أمان Firebase Storage مبسطة
export const getSimpleStorageSecurityRules = () => {
  return `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        (request.auth.token.email == 'admin@alwaseet.com' || 
         request.auth.token.email == 'asssaa1320@gmail.com');
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isValidImageFile() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isValidSize(maxSize) {
      return request.resource.size <= maxSize;
    }
    
    // === قواعد عامة ===
    match /{allPaths=**} {
      allow read: if true; // السماح بقراءة جميع الملفات
      allow write: if false; // منع الكتابة العامة
    }
    
    // === صور الإعلانات ===
    match /ads/{userId}/{fileName} {
      allow read: if true;
      allow write: if isOwner(userId) &&
                      isValidImageFile() &&
                      isValidSize(2 * 1024 * 1024); // 2MB
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // === صور المستخدمين ===
    match /users/{userId}/avatar.{ext} {
      allow read: if true;
      allow write: if isOwner(userId) &&
                      isValidImageFile() &&
                      isValidSize(1 * 1024 * 1024); // 1MB
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // === ملفات النظام ===
    match /system/{fileName} {
      allow read: if isAdmin();
      allow write: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
`
}
