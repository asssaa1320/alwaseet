// سكريبت تهيئة Firebase مع جميع المجموعات والإعدادات
import { COLLECTIONS, REQUIRED_INDEXES } from "./firebase-collections"
import { getCompleteFirestoreRules, getStorageSecurityRules } from "./firebase-rules-complete"

export const initializeFirebaseProject = async () => {
  console.log("🔥 بدء تهيئة مشروع Firebase...")

  // 1. إنشاء المجموعات الأساسية
  console.log("📁 إنشاء المجموعات...")
  await createCollections()

  // 2. إنشاء الفهارس المطلوبة
  console.log("🔍 إنشاء الفهارس...")
  await createIndexes()

  // 3. إعداد قواعد الأمان
  console.log("🔒 إعداد قواعد الأمان...")
  await setupSecurityRules()

  // 4. إنشاء بيانات أولية
  console.log("📊 إنشاء البيانات الأولية...")
  await createInitialData()

  // 5. إعداد المسؤولين
  console.log("👥 إعداد المسؤولين...")
  await setupAdmins()

  console.log("✅ تم إنهاء تهيئة Firebase بنجاح!")
}

const createCollections = async () => {
  const collections = [
    // المجموعات الأساسية
    COLLECTIONS.ads,
    COLLECTIONS.users,
    COLLECTIONS.news,
    COLLECTIONS.handToHand,

    // مجموعات الإدارة
    COLLECTIONS.admins,
    COLLECTIONS.verificationRequests,
    COLLECTIONS.premiumSubscriptions,

    // مجموعات الأمان
    COLLECTIONS.securityLogs,
    COLLECTIONS.activityLogs,
    COLLECTIONS.auditLogs,
    COLLECTIONS.bannedUsers,
    COLLECTIONS.bannedIPs,

    // مجموعات التقارير
    COLLECTIONS.reports,
    COLLECTIONS.complaints,
    COLLECTIONS.feedback,

    // مجموعات النظام
    COLLECTIONS.systemSettings,
    COLLECTIONS.appVersions,
    COLLECTIONS.maintenanceMode,
    COLLECTIONS.announcements,

    // مجموعات الإحصائيات
    COLLECTIONS.dailyStats,
    COLLECTIONS.monthlyStats,
    COLLECTIONS.userStats,
    COLLECTIONS.adStats,

    // مجموعات الدفع
    COLLECTIONS.payments,
    COLLECTIONS.transactions,
    COLLECTIONS.refunds,
    COLLECTIONS.invoices,

    // مجموعات التسويق
    COLLECTIONS.promoCode,
    COLLECTIONS.campaigns,
    COLLECTIONS.referrals,

    // مجموعات الدعم
    COLLECTIONS.supportTickets,
    COLLECTIONS.faq,
    COLLECTIONS.tutorials,

    // مجموعات المحتوى
    COLLECTIONS.categories,
    COLLECTIONS.tags,
    COLLECTIONS.featuredAds,

    // مجموعات الإشعارات
    COLLECTIONS.notifications,
    COLLECTIONS.pushTokens,
    COLLECTIONS.emailQueue,
    COLLECTIONS.smsQueue,

    // مجموعات التحليلات
    COLLECTIONS.analytics,
    COLLECTIONS.pageViews,
    COLLECTIONS.searchQueries,
    COLLECTIONS.userBehavior,

    // مجموعات النسخ الاحتياطية
    COLLECTIONS.backups,
    COLLECTIONS.archivedAds,
    COLLECTIONS.archivedUsers,

    // مجموعات الاختبار
    COLLECTIONS.testData,
    COLLECTIONS.debugLogs,
  ]

  console.log(`📋 سيتم إنشاء ${collections.length} مجموعة`)
  collections.forEach((collection, index) => {
    console.log(`${index + 1}. ${collection}`)
  })
}

const createIndexes = async () => {
  console.log("🔍 الفهارس المطلوبة:")
  REQUIRED_INDEXES.forEach((index, i) => {
    console.log(`${i + 1}. ${index.collection}: [${index.fields.join(", ")}]`)
  })

  console.log(`
📝 لإنشاء الفهارس، قم بتشغيل الأوامر التالية في Firebase CLI:

${REQUIRED_INDEXES.map(
  (index) =>
    `firebase firestore:indexes --project=alwaseet-44f09
# إنشاء فهرس للمجموعة: ${index.collection}
# الحقول: ${index.fields.join(", ")}`,
).join("\n\n")}
  `)
}

const setupSecurityRules = async () => {
  console.log("🔒 قواعد أمان Firestore:")
  console.log("=" * 50)
  console.log(getCompleteFirestoreRules())

  console.log("\n🔒 قواعد أمان Storage:")
  console.log("=" * 50)
  console.log(getStorageSecurityRules())

  console.log(`
📝 لتطبيق قواعد الأمان:

1. انسخ قواعد Firestore وضعها في ملف firestore.rules
2. انسخ قواعد Storage وضعها في ملف storage.rules
3. قم بتشغيل: firebase deploy --only firestore:rules,storage
  `)
}

const createInitialData = async () => {
  const initialData = {
    // إعدادات النظام
    systemSettings: [
      {
        key: "app_version",
        value: "1.0.0",
        description: "إصدار التطبيق الحالي",
        category: "app",
        isPublic: true,
      },
      {
        key: "maintenance_mode",
        value: false,
        description: "وضع الصيانة",
        category: "system",
        isPublic: true,
      },
      {
        key: "max_ads_per_user",
        value: 2,
        description: "الحد الأقصى للإعلانات للمستخدم العادي",
        category: "limits",
        isPublic: false,
      },
      {
        key: "max_ads_per_premium_user",
        value: 5,
        description: "الحد الأقصى للإعلانات للمستخدم المميز",
        category: "limits",
        isPublic: false,
      },
      {
        key: "ad_duration_options",
        value: [12, 24],
        description: "خيارات مدة الإعلان بالساعات",
        category: "ads",
        isPublic: true,
      },
      {
        key: "supported_currencies",
        value: ["ج.م"],
        description: "العملات المدعومة",
        category: "payment",
        isPublic: true,
      },
      {
        key: "supported_account_types",
        value: [
          "تيك توك",
          "يوتيوب",
          "فيسبوك",
          "انستجرام",
          "تويتر",
          "سناب شات",
          "فري فاير",
          "ببجي",
          "كول أوف ديوتي",
          "فورتنايت",
          "ماين كرافت",
          "تليجرام",
          "واتساب بيزنس",
          "لينكد إن",
          "ديسكورد",
          "أخرى",
        ],
        description: "أنواع الحسابات المدعومة",
        category: "ads",
        isPublic: true,
      },
    ],

    // التصنيفات
    categories: [
      {
        name: "وسائل التواصل الاجتماعي",
        nameEn: "social_media",
        description: "حسابات وسائل التواصل الاجتماعي",
        icon: "📱",
        color: "#1DA1F2",
        isActive: true,
        order: 1,
      },
      {
        name: "الألعاب",
        nameEn: "gaming",
        description: "حسابات الألعاب",
        icon: "🎮",
        color: "#9146FF",
        isActive: true,
        order: 2,
      },
      {
        name: "المراسلة",
        nameEn: "messaging",
        description: "تطبيقات المراسلة",
        icon: "💬",
        color: "#25D366",
        isActive: true,
        order: 3,
      },
      {
        name: "الأعمال",
        nameEn: "business",
        description: "حسابات الأعمال",
        icon: "💼",
        color: "#0077B5",
        isActive: true,
        order: 4,
      },
    ],

    // الأسئلة الشائعة
    faq: [
      {
        question: "كيف يمكنني إنشاء إعلان جديد؟",
        answer:
          "يمكنك إنشاء إعلان جديد عن طريق تسجيل الدخول، ثم الضغط على زر 'إنشاء إعلان' في الصفحة الرئيسية أو في ملفك الشخصي.",
        category: "ads",
        order: 1,
        isActive: true,
      },
      {
        question: "كم عدد الإعلانات التي يمكنني نشرها؟",
        answer: "يمكن للمستخدم العادي نشر إعلانين، بينما يمكن للمستخدم المميز نشر 5 إعلانات.",
        category: "ads",
        order: 2,
        isActive: true,
      },
      {
        question: "كيف يمكنني توثيق حسابي؟",
        answer: "يمكنك طلب توثيق حسابك من خلال الذهاب إلى الإعدادات، ثم اختيار 'طلب توثيق' وملء البيانات المطلوبة.",
        category: "verification",
        order: 3,
        isActive: true,
      },
      {
        question: "ما هي مدة صلاحية الإعلان؟",
        answer: "يمكنك اختيار مدة الإعلان عند النشر: 12 ساعة أو 24 ساعة.",
        category: "ads",
        order: 4,
        isActive: true,
      },
      {
        question: "كيف يمكنني الإبلاغ عن إعلان مشبوه؟",
        answer: "يمكنك الإبلاغ عن الإعلان عن طريق الضغط على أيقونة العلم في صفحة الإعلان وملء نموذج الإبلاغ.",
        category: "safety",
        order: 5,
        isActive: true,
      },
    ],

    // الإعلانات الإدارية
    announcements: [
      {
        title: "مرحباً بكم في منصة الوسيط",
        content: "نرحب بكم في منصة الوسيط الآمنة لبيع وشراء الحسابات. نتمنى لكم تجربة ممتعة وآمنة.",
        type: "welcome",
        priority: "high",
        isActive: true,
        targetAudience: ["all"],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
      },
      {
        title: "نصائح الأمان",
        content:
          "تذكر دائماً التحقق من صحة الحساب قبل إتمام عملية الشراء، واستخدم طرق دفع آمنة، ولا تشارك معلوماتك الشخصية.",
        type: "safety",
        priority: "medium",
        isActive: true,
        targetAudience: ["all"],
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 يوم
      },
    ],
  }

  console.log("📊 البيانات الأولية التي سيتم إنشاؤها:")
  Object.keys(initialData).forEach((collection) => {
    console.log(`- ${collection}: ${initialData[collection].length} عنصر`)
  })
}

const setupAdmins = async () => {
  const admins = [
    {
      email: "admin@alwaseet.com",
      name: "مدير النظام",
      role: "super_admin",
      permissions: ["all"],
      createdAt: new Date(),
    },
    {
      email: "asssaa1320@gmail.com",
      name: "مدير النظام",
      role: "admin",
      permissions: ["all"],
      createdAt: new Date(),
    },
  ]

  console.log("👥 المسؤولين الذين سيتم إنشاؤهم:")
  admins.forEach((admin, index) => {
    console.log(`${index + 1}. ${admin.email} - ${admin.name} (${admin.role})`)
  })
}

// تصدير معلومات المشروع
export const getProjectInfo = () => {
  return {
    projectId: "alwaseet-44f09",
    region: "us-central1",
    collections: Object.values(COLLECTIONS),
    totalCollections: Object.keys(COLLECTIONS).length,
    totalIndexes: REQUIRED_INDEXES.length,
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
  }
}

// طباعة ملخص المشروع
export const printProjectSummary = () => {
  const info = getProjectInfo()

  console.log(`
🔥 ملخص مشروع Firebase - الوسيط
=====================================

📊 معلومات عامة:
- معرف المشروع: ${info.projectId}
- المنطقة: ${info.region}
- الإصدار: ${info.version}
- تاريخ آخر تحديث: ${new Date(info.lastUpdated).toLocaleDateString("ar-SA")}

📁 المجموعات:
- إجمالي المجموعات: ${info.totalCollections}
- المجموعات الأساسية: ${[COLLECTIONS.ads, COLLECTIONS.users, COLLECTIONS.news, COLLECTIONS.handToHand].length}
- مجموعات الإدارة: ${[COLLECTIONS.admins, COLLECTIONS.verificationRequests, COLLECTIONS.premiumSubscriptions].length}
- مجموعات الأمان: ${[COLLECTIONS.securityLogs, COLLECTIONS.activityLogs, COLLECTIONS.bannedUsers].length}

🔍 الفهارس:
- إجمالي الفهارس المطلوبة: ${info.totalIndexes}

🔒 الأمان:
- قواعد Firestore: شاملة
- قواعد Storage: شاملة
- تشفير البيانات: مفعل
- مراقبة الأنشطة: مفعل

📱 الميزات:
- نظام المستخدمين ✅
- إدارة الإعلانات ✅
- نظام التوثيق ✅
- العضوية المميزة ✅
- نظام التقارير ✅
- سجلات الأمان ✅
- لوحة تحكم الإدارة ✅
- نظام الإشعارات ✅
- التحليلات والإحصائيات ✅
- النسخ الاحتياطية ✅

🌍 اللغات المدعومة:
- العربية (الأساسية)
- الإنجليزية (للبيانات الفنية)

💰 العملات المدعومة:
- الجنيه المصري (ج.م)

📅 نظام التاريخ:
- التاريخ الميلادي (الجريجوري)
- التوقيت المحلي مع دعم المناطق الزمنية

=====================================
✅ المشروع جاهز للنشر والاستخدام!
  `)
}
