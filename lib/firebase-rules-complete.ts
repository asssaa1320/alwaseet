// قواعد أمان Firestore الكاملة والشاملة
export const getCompleteFirestoreRules = () => {
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
    
    function isModerator() {
      return isAdmin() || 
        exists(/databases/$(database)/documents/moderators/$(request.auth.uid));
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isOwnerOrAdmin(userId) {
      return isOwner(userId) || isAdmin();
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isUserBlocked() {
      return isAuthenticated() && getUserData().isBlocked == true;
    }
    
    function isUserVerified() {
      return isAuthenticated() && getUserData().isVerified == true;
    }
    
    function isUserPremium() {
      return isAuthenticated() && 
        getUserData().isPremium == true &&
        getUserData().premiumExpiryDate > request.time;
    }
    
    function isValidPhoneNumber(phone) {
      return phone.matches('^\\+20[0-9]{10}$');
    }
    
    function isValidEmail(email) {
      return email.matches('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$');
    }
    
    function isValidPrice(price) {
      return price is number && price > 0 && price <= 100000;
    }
    
    function isValidString(str, minLen, maxLen) {
      return str is string && str.size() >= minLen && str.size() <= maxLen;
    }
    
    function isRateLimited(action) {
      // يمكن تنفيذ منطق Rate Limiting هنا
      return false;
    }
    
    // === قواعد الإعلانات ===
    match /ads/{adId} {
      allow read: if resource.data.isActive == true && 
                     resource.data.expiryDate > request.time;
      
      allow create: if isAuthenticated() && 
                       !isUserBlocked() &&
                       !isRateLimited('create_ad') &&
                       isValidAdData() &&
                       request.resource.data.userId == request.auth.uid &&
                       getUserAdsCount() < getMaxAdsLimit();
      
      allow update: if (isOwner(resource.data.userId) || isModerator()) &&
                       !isUserBlocked() &&
                       (isOwner(resource.data.userId) ? isValidAdData() : true);
      
      allow delete: if isOwnerOrAdmin(resource.data.userId);
      
      function isValidAdData() {
        let data = request.resource.data;
        return isValidString(data.title, 1, 30) &&
               isValidString(data.description, 1, 200) &&
               isValidString(data.accountType, 1, 50) &&
               isValidPrice(data.price) &&
               isValidPhoneNumber(data.phoneNumber) &&
               data.userId == request.auth.uid &&
               data.userEmail == request.auth.token.email &&
               data.currency == 'ج.م' &&
               data.duration in [12, 24] &&
               data.views == 0 &&
               data.isActive == true;
      }
      
      function getUserAdsCount() {
        return getUserData().adsCount;
      }
      
      function getMaxAdsLimit() {
        return isUserPremium() ? 5 : 2;
      }
    }
    
    // === قواعد المستخدمين ===
    match /users/{userId} {
      allow read: if isAuthenticated();
      
      allow create: if isOwner(userId) && 
                       isValidUserData() &&
                       request.resource.data.email == request.auth.token.email;
      
      allow update: if isOwner(userId) && 
                       isValidUserUpdate() ||
                       (isAdmin() && isValidAdminUserUpdate());
      
      allow delete: if isAdmin();
      
      function isValidUserData() {
        let data = request.resource.data;
        return isValidString(data.name, 1, 50) &&
               isValidEmail(data.email) &&
               data.adsCount == 0 &&
               data.isPremium == false &&
               data.isVerified == false &&
               data.isBlocked == false;
      }
      
      function isValidUserUpdate() {
        let data = request.resource.data;
        let oldData = resource.data;
        return data.email == oldData.email && // لا يمكن تغيير الإيميل
               data.isPremium == oldData.isPremium && // لا يمكن تغيير البريميوم
               data.isVerified == oldData.isVerified && // لا يمكن تغيير التوثيق
               data.isBlocked == oldData.isBlocked && // لا يمكن تغيير الحظر
               isValidString(data.name, 1, 50) &&
               (data.phoneNumber == null || isValidPhoneNumber(data.phoneNumber));
      }
      
      function isValidAdminUserUpdate() {
        // المسؤولون يمكنهم تعديل حقول إضافية
        return true;
      }
    }
    
    // === قواعد الأخبار ===
    match /news/{newsId} {
      allow read: if resource.data.isActive == true &&
                     resource.data.publishedAt <= request.time &&
                     (resource.data.expiryDate == null || resource.data.expiryDate > request.time);
      
      allow write: if isAdmin() && isValidNewsData();
      
      function isValidNewsData() {
        let data = request.resource.data;
        return isValidString(data.title, 1, 100) &&
               isValidString(data.content, 1, 5000) &&
               isValidString(data.category, 1, 50) &&
               data.authorId == request.auth.uid;
      }
    }
    
    // === قواعد طلبات يد بيد ===
    match /handToHand/{requestId} {
      allow read: if isAuthenticated();
      
      allow create: if isAuthenticated() && 
                       !isUserBlocked() &&
                       isValidHandToHandData() &&
                       request.resource.data.userId == request.auth.uid;
      
      allow update, delete: if isOwnerOrAdmin(resource.data.userId);
      
      function isValidHandToHandData() {
        let data = request.resource.data;
        return data.type in ['buyer', 'seller'] &&
               isValidString(data.accountType, 1, 50) &&
               isValidPhoneNumber(data.phoneNumber) &&
               data.userId == request.auth.uid &&
               (data.type == 'seller' ? 
                 isValidPrice(data.price) && data.accountUrl.matches('^https?://.*')
                 : 
                 data.minFollowers >= 0 && data.maxFollowers > data.minFollowers
               );
      }
    }
    
    // === قواعد طلبات التوثيق ===
    match /verificationRequests/{requestId} {
      allow read: if isOwnerOrAdmin(resource.data.userId);
      
      allow create: if isAuthenticated() && 
                       !isUserBlocked() &&
                       !isUserVerified() &&
                       isValidVerificationData() &&
                       request.resource.data.userId == request.auth.uid;
      
      allow update: if isAdmin() && isValidVerificationUpdate();
      
      allow delete: if isAdmin();
      
      function isValidVerificationData() {
        let data = request.resource.data;
        return isValidString(data.fullName, 1, 100) &&
               isValidString(data.idNumber, 5, 20) &&
               isValidPhoneNumber(data.phoneNumber) &&
               isValidString(data.reason, 10, 500) &&
               data.status == 'pending';
      }
      
      function isValidVerificationUpdate() {
        let data = request.resource.data;
        return data.status in ['pending', 'approved', 'rejected', 'under_review'] &&
               data.reviewerId == request.auth.uid;
      }
    }
    
    // === قواعد التقارير ===
    match /reports/{reportId} {
      allow read: if isAdmin() || isOwner(resource.data.reporterUserId);
      
      allow create: if isAuthenticated() && 
                       !isUserBlocked() &&
                       isValidReportData() &&
                       request.resource.data.reporterUserId == request.auth.uid;
      
      allow update: if isAdmin();
      
      allow delete: if isAdmin();
      
      function isValidReportData() {
        let data = request.resource.data;
        return data.type in ['spam', 'fraud', 'inappropriate', 'fake'] &&
               isValidString(data.description, 10, 1000) &&
               data.status == 'pending';
      }
    }
    
    // === قواعد المسؤولين ===
    match /admins/{adminId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // === قواعد المشرفين ===
    match /moderators/{moderatorId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // === قواعد الدفع والاشتراكات ===
    match /premiumSubscriptions/{subscriptionId} {
      allow read: if isOwnerOrAdmin(resource.data.userId);
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    match /payments/{paymentId} {
      allow read: if isOwnerOrAdmin(resource.data.userId);
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if false; // لا يمكن حذف المدفوعات
    }
    
    // === قواعد الإشعارات ===
    match /notifications/{notificationId} {
      allow read: if isOwnerOrAdmin(resource.data.userId);
      allow create: if isAdmin();
      allow update: if isOwner(resource.data.userId) && 
                       onlyUpdatingReadStatus();
      allow delete: if isOwnerOrAdmin(resource.data.userId);
      
      function onlyUpdatingReadStatus() {
        return request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isRead', 'readAt']);
      }
    }
    
    // === سجلات الأمان ===
    match /securityLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false; // السجلات لا تُعدل أو تُحذف
    }
    
    // === سجلات النشاطات ===
    match /activityLogs/{logId} {
      allow read: if isAdmin() || isOwner(resource.data.userId);
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }
    
    // === الإحصائيات ===
    match /dailyStats/{statId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    match /monthlyStats/{statId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    match /userStats/{userId} {
      allow read: if isOwnerOrAdmin(userId);
      allow write: if isAdmin();
    }
    
    // === إعدادات النظام ===
    match /systemSettings/{settingId} {
      allow read: if resource.data.isPublic == true || isAdmin();
      allow write: if isAdmin();
    }
    
    // === الدعم الفني ===
    match /supportTickets/{ticketId} {
      allow read: if isAdmin() || isOwner(resource.data.userId);
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
      allow update: if isAdmin() || 
                       (isOwner(resource.data.userId) && onlyUpdatingUserFields());
      allow delete: if isAdmin();
      
      function onlyUpdatingUserFields() {
        return request.resource.data.diff(resource.data).affectedKeys()
               .hasAny(['lastUserMessage', 'userSatisfaction']);
      }
    }
    
    // === المحتوى الإضافي ===
    match /faq/{faqId} {
      allow read: if true; // متاح للجميع
      allow write: if isAdmin();
    }
    
    match /tutorials/{tutorialId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // === الحملات والتسويق ===
    match /campaigns/{campaignId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    match /promoCodes/{promoId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // === النسخ الاحتياطية والأرشيف ===
    match /backups/{backupId} {
      allow read, write: if isAdmin();
    }
    
    match /archivedAds/{adId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
    
    // === منطقة الاختبار ===
    match /testData/{testId} {
      allow read, write: if isAdmin();
    }
    
    match /debugLogs/{logId} {
      allow read, write: if isAdmin();
    }
    
    // === قواعد افتراضية لحماية أي مجموعات أخرى ===
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`
}

// قواعد أمان Firebase Storage
export const getStorageSecurityRules = () => {
  return `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
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
    
    function isValidImageFile() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isValidDocumentFile() {
      return request.resource.contentType.matches('(image/.*|application/pdf)');
    }
    
    function isValidSize(maxSize) {
      return request.resource.size <= maxSize;
    }
    
    function isValidImageExtension(fileName) {
      return fileName.matches('.*\\.(jpg|jpeg|png|gif|webp)$');
    }
    
    // === قواعد عامة - منع الوصول غير المصرح به ===
    match /{allPaths=**} {
      allow read: if true; // قراءة عامة للملفات المرفوعة بشكل صحيح
      allow write: if false; // منع الكتابة العامة
    }
    
    // === صور الإعلانات ===
    match /ads/{userId}/{fileName} {
      allow read: if true;
      allow write: if isOwner(userId) &&
                      isValidImageFile() &&
                      isValidImageExtension(fileName) &&
                      isValidSize(2 * 1024 * 1024); // 2MB
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // === صور المستخدمين (الصور الشخصية) ===
    match /users/{userId}/avatar.{ext} {
      allow read: if true;
      allow write: if isOwner(userId) &&
                      isValidImageFile() &&
                      isValidSize(1 * 1024 * 1024) && // 1MB
                      ext.matches('(jpg|jpeg|png|gif|webp)');
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // === وثائق التوثيق ===
    match /verification/{userId}/{fileName} {
      allow read: if isOwner(userId) || isAdmin();
      allow write: if isOwner(userId) &&
                      isValidDocumentFile() &&
                      isValidSize(5 * 1024 * 1024); // 5MB
      allow delete: if isAdmin();
    }
    
    // === صور الأخبار ===
    match /news/{fileName} {
      allow read: if true;
      allow write: if isAdmin() &&
                      isValidImageFile() &&
                      isValidSize(5 * 1024 * 1024); // 5MB
      allow delete: if isAdmin();
    }
    
    // === ملفات النظام والنسخ الاحتياطية ===
    match /system/{fileName} {
      allow read: if isAdmin();
      allow write: if isAdmin();
      allow delete: if isAdmin();
    }
    
    match /backups/{fileName} {
      allow read: if isAdmin();
      allow write: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // === ملفات مؤقتة ===
    match /temp/{userId}/{fileName} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId) &&
                      isValidSize(10 * 1024 * 1024); // 10MB
      allow delete: if isOwner(userId) || isAdmin();
    }
    
    // === صور مصغرة (thumbnails) ===
    match /thumbnails/{path=**} {
      allow read: if true;
      allow write: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // === ملفات الدعم الفني ===
    match /support/{ticketId}/{fileName} {
      allow read: if isAdmin() || 
                     resource.metadata['uploadedBy'] == request.auth.uid;
      allow write: if isAuthenticated() &&
                      isValidSize(20 * 1024 * 1024) && // 20MB
                      request.resource.metadata['uploadedBy'] == request.auth.uid;
      allow delete: if isAdmin();
    }
    
    // === ملفات التصدير ===
    match /exports/{userId}/{fileName} {
      allow read: if isOwner(userId);
      allow write: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
`
}
