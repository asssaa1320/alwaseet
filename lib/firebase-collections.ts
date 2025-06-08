// تعريف أسماء المجموعات في Firebase
export const COLLECTIONS = {
  // المجموعات الأساسية
  ads: "ads", // الإعلانات
  users: "users", // المستخدمين
  news: "news", // الأخبار
  handToHand: "handToHand", // طلبات يد بيد

  // مجموعات الإدارة
  admins: "admins", // المسؤولين
  verificationRequests: "verificationRequests", // طلبات التوثيق
  premiumSubscriptions: "premiumSubscriptions", // اشتراكات البريميوم

  // مجموعات الأمان والسجلات
  securityLogs: "securityLogs", // سجلات الأمان
  activityLogs: "activityLogs", // سجلات النشاطات
  auditLogs: "auditLogs", // سجلات المراجعة
  bannedUsers: "bannedUsers", // المستخدمين المحظورين
  bannedIPs: "bannedIPs", // عناوين IP المحظورة

  // مجموعات التقارير والشكاوى
  reports: "reports", // التقارير
  complaints: "complaints", // الشكاوى
  feedback: "feedback", // التقييمات والملاحظات

  // مجموعات النظام
  systemSettings: "systemSettings", // إعدادات النظام
  appVersions: "appVersions", // إصدارات التطبيق
  maintenanceMode: "maintenanceMode", // وضع الصيانة
  announcements: "announcements", // الإعلانات الإدارية

  // مجموعات الإحصائيات
  dailyStats: "dailyStats", // إحصائيات يومية
  monthlyStats: "monthlyStats", // إحصائيات شهرية
  userStats: "userStats", // إحصائيات المستخدمين
  adStats: "adStats", // إحصائيات الإعلانات

  // مجموعات الدفع والمالية
  payments: "payments", // المدفوعات
  transactions: "transactions", // المعاملات المالية
  refunds: "refunds", // المبالغ المستردة
  invoices: "invoices", // الفواتير

  // مجموعات التسويق
  promoCode: "promoCodes", // أكواد الخصم
  campaigns: "campaigns", // الحملات الإعلانية
  referrals: "referrals", // الإحالات

  // مجموعات الدعم الفني
  supportTickets: "supportTickets", // تذاكر الدعم الفني
  faq: "faq", // الأسئلة الشائعة
  tutorials: "tutorials", // الدروس التعليمية

  // مجموعات المحتوى
  categories: "categories", // التصنيفات
  tags: "tags", // العلامات
  featuredAds: "featuredAds", // الإعلانات المميزة

  // مجموعات الإشعارات
  notifications: "notifications", // الإشعارات
  pushTokens: "pushTokens", // رموز الإشعارات
  emailQueue: "emailQueue", // قائمة انتظار الإيميلات
  smsQueue: "smsQueue", // قائمة انتظار الرسائل النصية

  // مجموعات التحليلات
  analytics: "analytics", // التحليلات
  pageViews: "pageViews", // مشاهدات الصفحات
  searchQueries: "searchQueries", // استعلامات البحث
  userBehavior: "userBehavior", // سلوك المستخدمين

  // مجموعات النسخ الاحتياطية
  backups: "backups", // النسخ الاحتياطية
  archivedAds: "archivedAds", // الإعلانات المؤرشفة
  archivedUsers: "archivedUsers", // المستخدمين المؤرشفين

  // مجموعات الاختبار (للتطوير)
  testData: "testData", // بيانات الاختبار
  debugLogs: "debugLogs", // سجلات التصحيح
} as const

// تعريف هيكل البيانات لكل مجموعة
export const COLLECTION_SCHEMAS = {
  ads: {
    id: "string",
    title: "string",
    description: "string",
    accountType: "string",
    price: "number",
    currency: "string",
    duration: "number",
    phoneNumber: "string",
    imageUrl: "string",
    userId: "string",
    userEmail: "string",
    userName: "string",
    createdAt: "timestamp",
    expiryDate: "timestamp",
    views: "number",
    isActive: "boolean",
    isPremium: "boolean",
    isVerified: "boolean",
    isFeatured: "boolean",
    status: "string", // pending, approved, rejected
    moderatorId: "string",
    moderatorNotes: "string",
    riskScore: "number",
    lastModified: "timestamp",
  },

  users: {
    id: "string",
    email: "string",
    name: "string",
    phoneNumber: "string",
    avatarUrl: "string",
    adsCount: "number",
    isPremium: "boolean",
    premiumExpiryDate: "timestamp",
    isVerified: "boolean",
    verifiedAt: "timestamp",
    isBlocked: "boolean",
    blockedAt: "timestamp",
    blockReason: "string",
    createdAt: "timestamp",
    lastLoginAt: "timestamp",
    totalViews: "number",
    totalSales: "number",
    successfulDeals: "number",
    rating: "number",
    reviewsCount: "number",
    notificationsEnabled: "boolean",
    privacySettings: {
      showEmail: "boolean",
      showPhone: "boolean",
      showLastSeen: "boolean",
    },
    preferences: {
      language: "string",
      theme: "string",
      currency: "string",
    },
    securitySettings: {
      twoFactorEnabled: "boolean",
      loginNotifications: "boolean",
      suspiciousActivityAlerts: "boolean",
    },
    riskScore: "number",
    trustScore: "number",
  },

  news: {
    id: "string",
    title: "string",
    content: "string",
    summary: "string",
    imageUrl: "string",
    category: "string",
    tags: "array",
    authorId: "string",
    authorName: "string",
    createdAt: "timestamp",
    publishedAt: "timestamp",
    isActive: "boolean",
    isFeatured: "boolean",
    views: "number",
    likes: "number",
    commentsCount: "number",
    priority: "number", // 1-5
    expiryDate: "timestamp",
    targetAudience: "array", // all, premium, verified
    seoTitle: "string",
    seoDescription: "string",
    seoKeywords: "array",
  },

  handToHand: {
    id: "string",
    type: "string", // buyer, seller
    accountType: "string",
    price: "number",
    accountUrl: "string",
    minFollowers: "number",
    maxFollowers: "number",
    phoneNumber: "string",
    description: "string",
    userId: "string",
    userEmail: "string",
    userName: "string",
    createdAt: "timestamp",
    expiryDate: "timestamp",
    status: "string", // pending, active, completed, cancelled
    isActive: "boolean",
    priority: "number",
    moderatorId: "string",
    moderatorNotes: "string",
    contactCount: "number",
    lastContactAt: "timestamp",
  },

  verificationRequests: {
    id: "string",
    userId: "string",
    userEmail: "string",
    userName: "string",
    fullName: "string",
    idNumber: "string",
    phoneNumber: "string",
    reason: "string",
    additionalInfo: "string",
    idImageUrl: "string",
    additionalDocsUrls: "array",
    status: "string", // pending, approved, rejected, under_review
    submittedAt: "timestamp",
    reviewedAt: "timestamp",
    reviewerId: "string",
    reviewerNotes: "string",
    priority: "number",
  },

  securityLogs: {
    id: "string",
    eventType: "string",
    userId: "string",
    userEmail: "string",
    ipAddress: "string",
    userAgent: "string",
    action: "string",
    resource: "string",
    status: "string", // success, failed, blocked
    riskLevel: "string", // low, medium, high, critical
    timestamp: "timestamp",
    details: "object",
    location: {
      country: "string",
      city: "string",
      coordinates: "geopoint",
    },
    deviceInfo: "object",
    sessionId: "string",
  },

  reports: {
    id: "string",
    reporterUserId: "string",
    reporterEmail: "string",
    reportedUserId: "string",
    reportedEmail: "string",
    adId: "string",
    type: "string", // spam, fraud, inappropriate, fake
    category: "string",
    description: "string",
    evidence: "array", // URLs or descriptions
    status: "string", // pending, investigating, resolved, dismissed
    priority: "string", // low, medium, high, urgent
    createdAt: "timestamp",
    resolvedAt: "timestamp",
    resolverId: "string",
    resolution: "string",
    actionTaken: "string",
  },

  systemSettings: {
    id: "string",
    key: "string",
    value: "any",
    description: "string",
    category: "string",
    isPublic: "boolean",
    lastModified: "timestamp",
    modifiedBy: "string",
    version: "number",
  },
} as const

// فهارس البحث المطلوبة
export const REQUIRED_INDEXES = [
  // إعلانات
  { collection: "ads", fields: ["isActive", "createdAt"] },
  { collection: "ads", fields: ["userId", "isActive"] },
  { collection: "ads", fields: ["accountType", "isActive"] },
  { collection: "ads", fields: ["isPremium", "isActive", "createdAt"] },
  { collection: "ads", fields: ["isActive", "expiryDate"] },
  { collection: "ads", fields: ["status", "createdAt"] },

  // مستخدمين
  { collection: "users", fields: ["email"] },
  { collection: "users", fields: ["isBlocked", "createdAt"] },
  { collection: "users", fields: ["isPremium", "premiumExpiryDate"] },
  { collection: "users", fields: ["isVerified", "verifiedAt"] },

  // أخبار
  { collection: "news", fields: ["isActive", "publishedAt"] },
  { collection: "news", fields: ["category", "isActive"] },
  { collection: "news", fields: ["isFeatured", "isActive"] },

  // سجلات الأمان
  { collection: "securityLogs", fields: ["userId", "timestamp"] },
  { collection: "securityLogs", fields: ["eventType", "timestamp"] },
  { collection: "securityLogs", fields: ["riskLevel", "timestamp"] },
  { collection: "securityLogs", fields: ["ipAddress", "timestamp"] },

  // تقارير
  { collection: "reports", fields: ["reporterUserId", "createdAt"] },
  { collection: "reports", fields: ["reportedUserId", "createdAt"] },
  { collection: "reports", fields: ["status", "priority"] },
  { collection: "reports", fields: ["type", "status"] },

  // طلبات التوثيق
  { collection: "verificationRequests", fields: ["userId"] },
  { collection: "verificationRequests", fields: ["status", "submittedAt"] },

  // يد بيد
  { collection: "handToHand", fields: ["userId", "createdAt"] },
  { collection: "handToHand", fields: ["type", "isActive"] },
  { collection: "handToHand", fields: ["accountType", "isActive"] },
]

// أسماء مجلدات التخزين
export const STORAGE_PATHS = {
  ads: "ads",
  users: "users",
  news: "news",
  documents: "documents",
  backups: "backups",
  temp: "temp",
  thumbnails: "thumbnails",
} as const
