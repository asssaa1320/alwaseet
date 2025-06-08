// قواعد Firebase مبسطة للسماح بقراءة الإعلانات للجميع
export const getPublicFirestoreRules = () => {
  return `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // === دوال مساعدة ===
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
    
    // === قواعد الإعلانات - مفتوحة للقراءة ===
    match /ads/{adId} {
      // السماح للجميع بقراءة الإعلانات النشطة
      allow read: if true;
      
      // السماح للمستخدمين المسجلين بإنشاء إعلانات
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.userEmail == request.auth.token.email;
      
      // السماح لصاحب الإعلان أو المسؤول بالتحديث
      allow update: if isOwner(resource.data.userId) || isAdmin();
      
      // السماح لصاحب الإعلان أو المسؤول بالحذف
      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // === قواعد المستخدمين ===
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // === قواعد الأخبار ===
    match /news/{newsId} {
      allow read: if true; // مفتوح للجميع
      allow write: if isAdmin();
    }
    
    // === قواعد طلبات يد بيد ===
    match /handToHand/{requestId} {
      allow read: if true; // مفتوح للجميع
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // === قواعد المسؤولين ===
    match /admins/{adminId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // === قواعد التقارير ===
    match /reports/{reportId} {
      allow read: if isAdmin() || isOwner(resource.data.reporterUserId);
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // === قواعد الإشعارات ===
    match /notifications/{notificationId} {
      allow read: if isOwner(resource.data.userId) || isAdmin();
      allow create: if isAdmin();
      allow update: if isOwner(resource.data.userId);
      allow delete: if isOwner(resource.data.userId) || isAdmin();
    }
    
    // === سجلات الأمان ===
    match /securityLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false;
    }
    
    // === إعدادات النظام ===
    match /systemSettings/{settingId} {
      allow read: if true;
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

// قواعد Storage مبسطة
export const getPublicStorageRules = () => {
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
    
    // === قراءة عامة للملفات ===
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // === صور الإعلانات ===
    match /ads/{userId}/{fileName} {
      allow read: if true;
      allow write: if isOwner(userId) &&
                      isValidImageFile() &&
                      isValidSize(5 * 1024 * 1024); // 5MB
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // === صور المستخدمين ===
    match /users/{userId}/avatar.{ext} {
      allow read: if true;
      allow write: if isOwner(userId) &&
                      isValidImageFile() &&
                      isValidSize(2 * 1024 * 1024); // 2MB
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
