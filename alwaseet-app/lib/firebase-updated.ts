import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  Timestamp,
  setDoc,
  limit,
  orderBy,
} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { COLLECTIONS } from "./firebase-collections"

// تكوين Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBW0h3eoOmUMKDlWI6arzj48oC39uNJQxQ",
  authDomain: "alwaseet-44f09.firebaseapp.com",
  projectId: "alwaseet-44f09",
  storageBucket: "alwaseet-44f09.appspot.com",
  messagingSenderId: "496053790776",
  appId: "1:496053790776:web:fc85e42e26ee86f4f81ecd",
  measurementId: "G-MCTRHJBSJR",
}

// تهيئة Firebase
let app: any
let auth: any
let db: any
let storage: any

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
} catch (error) {
  console.error("Error initializing Firebase:", error)
}

export { auth, db, storage }

// استيراد الأنواع
import type { Ad, User as UserType } from "@/types"

// دوال مساعدة للتاريخ الميلادي
const formatDateGregorian = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

const formatDateTimeGregorian = (date: Date) => {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

// إنشاء إعلان جديد مع التاريخ الميلادي
export const createAd = async (adData: Omit<Ad, "id">) => {
  if (!db) {
    throw new Error("Firebase not configured")
  }

  try {
    if (!auth.currentUser) {
      throw new Error("يجب تسجيل الدخول أولاً")
    }

    // إنشاء تاريخ انتهاء الصلاحية
    const expiryDate = new Date()
    expiryDate.setHours(expiryDate.getHours() + adData.duration)

    const sanitizedData = {
      ...adData,
      title: adData.title.trim().substring(0, 30),
      description: adData.description.trim().substring(0, 200),
      createdAt: serverTimestamp(),
      expiryDate: expiryDate,
      views: 0,
      isActive: true,
      isVerified: false,
      isFeatured: false,
      status: "pending", // الإعلانات تحتاج موافقة
      riskScore: 0,
      lastModified: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.ads), sanitizedData)
    await updateUserAdsCount(adData.userId, 1)

    // إضافة سجل نشاط
    await logActivity(adData.userId, "ad_created", {
      adId: docRef.id,
      title: sanitizedData.title,
    })

    return docRef.id
  } catch (error) {
    console.error("Error creating ad:", error)
    throw error
  }
}

// الحصول على الإعلانات مع التاريخ الميلادي
export const getAds = async (page = 1, pageSize = 10) => {
  if (!db) {
    throw new Error("Firebase not configured")
  }

  try {
    const adsRef = collection(db, COLLECTIONS.ads)
    const q = query(adsRef, where("isActive", "==", true), orderBy("createdAt", "desc"), limit(pageSize * 2))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return []
    }

    const allAds = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        // تحويل التاريخ إلى ميلادي
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        expiryDate:
          data.expiryDate instanceof Timestamp ? data.expiryDate.toDate() : new Date(Date.now() + 24 * 60 * 60 * 1000),
        // إضافة تاريخ منسق
        formattedCreatedAt: data.createdAt
          ? formatDateGregorian(data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date())
          : formatDateGregorian(new Date()),
        formattedExpiryDate: data.expiryDate
          ? formatDateTimeGregorian(data.expiryDate instanceof Timestamp ? data.expiryDate.toDate() : new Date())
          : formatDateTimeGregorian(new Date()),
      }
    }) as Ad[]

    // فلترة الإعلانات النشطة
    const now = new Date()
    const activeAds = allAds.filter((ad) => ad.isActive === true && new Date(ad.expiryDate) > now).slice(0, pageSize)

    return activeAds
  } catch (error) {
    console.error("Error getting ads:", error)
    throw new Error("Failed to load ads from database")
  }
}

// البحث في الإعلانات
export const searchAds = async (searchTerm: string) => {
  if (!db) {
    throw new Error("Firebase not configured")
  }

  try {
    const sanitizedSearchTerm = searchTerm.trim().toLowerCase()
    const adsRef = collection(db, COLLECTIONS.ads)
    const q = query(adsRef, where("isActive", "==", true), limit(100))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return []
    }

    const allAds = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        expiryDate:
          data.expiryDate instanceof Timestamp ? data.expiryDate.toDate() : new Date(Date.now() + 24 * 60 * 60 * 1000),
        formattedCreatedAt: formatDateGregorian(
          data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        ),
      }
    }) as Ad[]

    const now = new Date()
    const filteredAds = allAds
      .filter(
        (ad) =>
          new Date(ad.expiryDate) > now &&
          (ad.title.toLowerCase().includes(sanitizedSearchTerm) ||
            ad.accountType.toLowerCase().includes(sanitizedSearchTerm) ||
            ad.description.toLowerCase().includes(sanitizedSearchTerm)),
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return filteredAds
  } catch (error) {
    console.error("Error searching ads:", error)
    throw new Error("Failed to search ads in database")
  }
}

// الحصول على إعلان بواسطة المعرف
export const getAdById = async (adId: string) => {
  try {
    if (!adId || typeof adId !== "string") {
      throw new Error("معرف الإعلان غير صالح")
    }

    if (!db) {
      throw new Error("Firebase not configured")
    }

    const adRef = doc(db, COLLECTIONS.ads, adId)
    const adDoc = await getDoc(adRef)

    if (!adDoc.exists()) {
      throw new Error("الإعلان غير موجود")
    }

    const data = adDoc.data()
    return {
      id: adDoc.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      expiryDate:
        data.expiryDate instanceof Timestamp ? data.expiryDate.toDate() : new Date(Date.now() + 24 * 60 * 60 * 1000),
      formattedCreatedAt: formatDateGregorian(
        data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      ),
      formattedExpiryDate: formatDateTimeGregorian(
        data.expiryDate instanceof Timestamp ? data.expiryDate.toDate() : new Date(),
      ),
    } as Ad
  } catch (error) {
    console.error("Error getting ad by ID:", error)
    throw error
  }
}

// زيادة عدد مشاهدات الإعلان
export const incrementAdViews = async (adId: string) => {
  try {
    if (!adId || typeof adId !== "string") {
      return
    }

    if (!db) return

    const adRef = doc(db, COLLECTIONS.ads, adId)
    await updateDoc(adRef, {
      views: increment(1),
      lastViewedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error incrementing views:", error)
  }
}

// تحديث عدد إعلانات المستخدم
const updateUserAdsCount = async (userId: string, incrementValue: number) => {
  if (!db || !userId) return

  try {
    const userRef = doc(db, COLLECTIONS.users, userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      await updateDoc(userRef, {
        adsCount: increment(incrementValue),
        lastModified: serverTimestamp(),
      })
    } else {
      await setDoc(userRef, {
        id: userId,
        email: auth.currentUser?.email || "",
        name: auth.currentUser?.displayName || "مستخدم",
        adsCount: Math.max(0, incrementValue),
        isPremium: false,
        isVerified: false,
        isBlocked: false,
        createdAt: serverTimestamp(),
        lastModified: serverTimestamp(),
        totalViews: 0,
        totalSales: 0,
        successfulDeals: 0,
        rating: 0,
        reviewsCount: 0,
        riskScore: 0,
        trustScore: 50, // نقطة البداية
        notificationsEnabled: true,
        privacySettings: {
          showEmail: false,
          showPhone: true,
          showLastSeen: false,
        },
        preferences: {
          language: "ar",
          theme: "light",
          currency: "EGP",
        },
        securitySettings: {
          twoFactorEnabled: false,
          loginNotifications: true,
          suspiciousActivityAlerts: true,
        },
      })
    }
  } catch (error) {
    console.error("Error updating user ads count:", error)
  }
}

// تسجيل نشاط المستخدم
export const logActivity = async (userId: string, action: string, details: any = {}) => {
  if (!db || !userId) return

  try {
    await addDoc(collection(db, COLLECTIONS.activityLogs), {
      userId,
      action,
      details,
      timestamp: serverTimestamp(),
      ipAddress: "unknown", // يمكن الحصول عليه من الخادم
      userAgent: navigator.userAgent,
      sessionId: `session_${Date.now()}`,
    })
  } catch (error) {
    console.error("Error logging activity:", error)
  }
}

// الحصول على إعلانات المستخدم
export const getUserAds = async (userId: string) => {
  try {
    if (!db || !userId) {
      return []
    }

    if (auth.currentUser?.uid !== userId) {
      throw new Error("غير مصرح لك بالوصول")
    }

    const adsRef = collection(db, COLLECTIONS.ads)
    const q = query(adsRef, where("userId", "==", userId), orderBy("createdAt", "desc"))

    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return []
    }

    const userAds = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        expiryDate:
          data.expiryDate instanceof Timestamp ? data.expiryDate.toDate() : new Date(Date.now() + 24 * 60 * 60 * 1000),
        formattedCreatedAt: formatDateGregorian(
          data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        ),
        formattedExpiryDate: formatDateTimeGregorian(
          data.expiryDate instanceof Timestamp ? data.expiryDate.toDate() : new Date(),
        ),
      }
    }) as Ad[]

    return userAds
  } catch (error) {
    console.error("Error getting user ads:", error)
    return []
  }
}

// الحصول على عدد إعلانات المستخدم
export const getUserAdsCount = async (userId: string) => {
  try {
    if (!db || !userId) return 0

    if (auth.currentUser?.uid !== userId) {
      return 0
    }

    const userRef = doc(db, COLLECTIONS.users, userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      return userDoc.data().adsCount || 0
    }

    return 0
  } catch (error) {
    console.error("Error getting user ads count:", error)
    return 0
  }
}

// حذف إعلان
export const deleteAd = async (adId: string, userId: string) => {
  try {
    if (!db || !userId) {
      throw new Error("Firebase not configured or user not authenticated")
    }

    if (auth.currentUser?.uid !== userId) {
      throw new Error("غير مصرح لك بالوصول")
    }

    const adDoc = await getDoc(doc(db, COLLECTIONS.ads, adId))
    if (!adDoc.exists()) {
      throw new Error("الإعلان غير موجود")
    }

    const adData = adDoc.data()
    if (adData.userId !== userId) {
      throw new Error("غير مصرح لك بحذف هذا الإعلان")
    }

    // نقل الإعلان إلى الأرشيف بدلاً من حذفه
    await addDoc(collection(db, COLLECTIONS.archivedAds), {
      ...adData,
      originalId: adId,
      deletedAt: serverTimestamp(),
      deletedBy: userId,
    })

    await deleteDoc(doc(db, COLLECTIONS.ads, adId))
    await updateUserAdsCount(userId, -1)

    // تسجيل النشاط
    await logActivity(userId, "ad_deleted", {
      adId,
      title: adData.title,
    })
  } catch (error) {
    console.error("Error deleting ad:", error)
    throw error
  }
}

// رفع صورة
export const uploadImage = async (file: File, path: string) => {
  try {
    if (!storage) {
      throw new Error("Firebase Storage not configured")
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("يجب أن يكون الملف صورة")
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error("حجم الصورة يجب ألا يزيد عن 2 ميجابايت")
    }

    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    return downloadURL
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

// الحصول على بيانات المستخدم
export const getUserProfile = async (userId: string) => {
  try {
    if (!db || !userId) {
      throw new Error("Firebase not configured or invalid user ID")
    }

    const userRef = doc(db, COLLECTIONS.users, userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      return null
    }

    const userData = userDoc.data()
    return {
      ...userData,
      createdAt: userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : new Date(),
      formattedCreatedAt: formatDateGregorian(
        userData.createdAt instanceof Timestamp ? userData.createdAt.toDate() : new Date(),
      ),
      lastLoginAt: userData.lastLoginAt
        ? userData.lastLoginAt instanceof Timestamp
          ? userData.lastLoginAt.toDate()
          : new Date()
        : null,
      formattedLastLogin: userData.lastLoginAt
        ? formatDateTimeGregorian(
            userData.lastLoginAt instanceof Timestamp ? userData.lastLoginAt.toDate() : new Date(),
          )
        : "لم يسجل دخول من قبل",
    } as UserType
  } catch (error) {
    console.error("Error getting user profile:", error)
    throw error
  }
}

// تحديث بيانات المستخدم
export const updateUserProfile = async (userId: string, userData: Partial<UserType>) => {
  try {
    if (!db || !userId) {
      throw new Error("Firebase not configured or invalid user ID")
    }

    if (auth.currentUser?.uid !== userId) {
      throw new Error("غير مصرح لك بتحديث هذا الملف الشخصي")
    }

    const sanitizedData: any = {
      lastModified: serverTimestamp(),
    }

    if (userData.name) {
      sanitizedData.name = userData.name.trim()
    }

    if (userData.phoneNumber) {
      sanitizedData.phoneNumber = userData.phoneNumber.trim()
    }

    if (userData.notificationsEnabled !== undefined) {
      sanitizedData.notificationsEnabled = userData.notificationsEnabled
    }

    if (userData.privacySettings) {
      sanitizedData.privacySettings = userData.privacySettings
    }

    if (userData.preferences) {
      sanitizedData.preferences = userData.preferences
    }

    const userRef = doc(db, COLLECTIONS.users, userId)
    await updateDoc(userRef, sanitizedData)

    // تسجيل النشاط
    await logActivity(userId, "profile_updated", {
      updatedFields: Object.keys(sanitizedData),
    })

    return true
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// طلب توثيق الحساب
export const requestVerification = async (userId: string, verificationData: any) => {
  try {
    if (!db || !userId) {
      throw new Error("Firebase not configured or invalid user ID")
    }

    if (auth.currentUser?.uid !== userId) {
      throw new Error("غير مصرح لك بطلب التوثيق لهذا الحساب")
    }

    const verificationRef = collection(db, COLLECTIONS.verificationRequests)
    await addDoc(verificationRef, {
      userId,
      userEmail: auth.currentUser?.email || "",
      userName: auth.currentUser?.displayName || "مستخدم",
      ...verificationData,
      status: "pending",
      priority: 1,
      submittedAt: serverTimestamp(),
    })

    // تسجيل النشاط
    await logActivity(userId, "verification_requested", {
      fullName: verificationData.fullName,
    })

    return true
  } catch (error) {
    console.error("Error requesting verification:", error)
    throw error
  }
}

// التحقق من المسؤول
export const isAdmin = async (userId: string) => {
  try {
    if (auth.currentUser?.email === "admin@alwaseet.com" || auth.currentUser?.email === "asssaa1320@gmail.com") {
      return true
    }

    if (!db || !userId) return false

    const adminRef = doc(db, COLLECTIONS.admins, userId)
    const adminDoc = await getDoc(adminRef)

    return adminDoc.exists()
  } catch (error) {
    console.error("Error checking admin status:", error)
    return auth.currentUser?.email === "admin@alwaseet.com" || auth.currentUser?.email === "asssaa1320@gmail.com"
  }
}

// إنشاء أخبار جديدة (للمسؤولين)
export const createNews = async (newsData: any) => {
  try {
    if (!db) {
      throw new Error("Firebase not configured")
    }

    const isUserAdmin = await isAdmin(auth.currentUser?.uid || "")
    if (!isUserAdmin) {
      throw new Error("غير مصرح لك بإنشاء الأخبار")
    }

    const sanitizedData = {
      ...newsData,
      title: newsData.title.trim(),
      content: newsData.content.trim(),
      category: newsData.category || "عام",
      tags: newsData.tags || [],
      authorId: auth.currentUser?.uid,
      authorName: auth.currentUser?.displayName || "الإدارة",
      createdAt: serverTimestamp(),
      publishedAt: serverTimestamp(),
      isActive: true,
      isFeatured: false,
      views: 0,
      likes: 0,
      commentsCount: 0,
      priority: 1,
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.news), sanitizedData)

    // إرسال إشعار للمستخدمين
    await sendNewsNotification(sanitizedData.title)

    return docRef.id
  } catch (error) {
    console.error("Error creating news:", error)
    throw error
  }
}

// إرسال إشعار للمستخدمين عن خبر جديد
const sendNewsNotification = async (newsTitle: string) => {
  try {
    if (!db) return

    // هنا يمكن إضافة منطق إرسال الإشعارات
    await addDoc(collection(db, COLLECTIONS.notifications), {
      type: "news",
      title: "خبر جديد",
      message: `تم نشر خبر جديد: ${newsTitle}`,
      isGlobal: true,
      createdAt: serverTimestamp(),
      isRead: false,
    })
  } catch (error) {
    console.error("Error sending news notification:", error)
  }
}

// إحصائيات النظام
export const getSystemStats = async () => {
  try {
    if (!db) return null

    const isUserAdmin = await isAdmin(auth.currentUser?.uid || "")
    if (!isUserAdmin) {
      throw new Error("غير مصرح لك بالوصول")
    }

    // هنا يمكن إضافة منطق جمع الإحصائيات الفعلية
    const stats = {
      totalUsers: 0,
      activeUsers: 0,
      totalAds: 0,
      activeAds: 0,
      totalViews: 0,
      totalRevenue: 0,
      lastUpdated: new Date(),
    }

    return stats
  } catch (error) {
    console.error("Error getting system stats:", error)
    return null
  }
}

// تسجيل سجل أمني
export const logSecurityEvent = async (eventType: string, userId: string, details: any) => {
  try {
    if (!db) return

    await addDoc(collection(db, COLLECTIONS.securityLogs), {
      eventType,
      userId,
      userEmail: auth.currentUser?.email || "unknown",
      ipAddress: "unknown", // يمكن الحصول عليه من الخادم
      userAgent: navigator.userAgent,
      action: eventType,
      resource: details.resource || "unknown",
      status: details.status || "unknown",
      riskLevel: details.riskLevel || "low",
      timestamp: serverTimestamp(),
      details,
      location: {
        country: "unknown",
        city: "unknown",
      },
      deviceInfo: {
        platform: navigator.platform,
        language: navigator.language,
      },
      sessionId: `session_${Date.now()}`,
    })
  } catch (error) {
    console.error("Error logging security event:", error)
  }
}

// الدوال الإدارية الجديدة

// الحصول على جميع الإعلانات (للمسؤولين)
export const getAllAds = async () => {
  try {
    if (!db) return []

    const isUserAdmin = await isAdmin(auth.currentUser?.uid || "")
    if (!isUserAdmin) {
      throw new Error("غير مصرح لك بالوصول")
    }

    const adsRef = collection(db, COLLECTIONS.ads)
    const q = query(adsRef, orderBy("createdAt", "desc"), limit(200))
    const snapshot = await getDocs(q)

    const allAds = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        expiryDate:
          data.expiryDate instanceof Timestamp ? data.expiryDate.toDate() : new Date(Date.now() + 24 * 60 * 60 * 1000),
        formattedCreatedAt: formatDateGregorian(
          data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        ),
      }
    }) as Ad[]

    return allAds
  } catch (error) {
    console.error("Error getting all ads:", error)
    return []
  }
}

// الحصول على جميع المستخدمين (للمسؤولين)
export const getAllUsers = async () => {
  try {
    if (!db) return []

    const isUserAdmin = await isAdmin(auth.currentUser?.uid || "")
    if (!isUserAdmin) {
      throw new Error("غير مصرح لك بالوصول")
    }

    const usersRef = collection(db, COLLECTIONS.users)
    const q = query(usersRef, orderBy("createdAt", "desc"), limit(100))
    const snapshot = await getDocs(q)

    const allUsers = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        formattedCreatedAt: formatDateGregorian(
          data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        ),
        lastLoginAt: data.lastLoginAt
          ? data.lastLoginAt instanceof Timestamp
            ? data.lastLoginAt.toDate()
            : new Date()
          : null,
        formattedLastLogin: data.lastLoginAt
          ? formatDateTimeGregorian(data.lastLoginAt instanceof Timestamp ? data.lastLoginAt.toDate() : new Date())
          : "لم يسجل دخول من قبل",
      }
    })

    return allUsers
  } catch (error) {
    console.error("Error getting all users:", error)
    return []
  }
}

// تحديث حالة الإعلان (للمسؤولين)
export const updateAdStatus = async (adId: string, updates: Partial<Ad>) => {
  try {
    if (!db) throw new Error("Firebase not configured")

    const isUserAdmin = await isAdmin(auth.currentUser?.uid || "")
    if (!isUserAdmin) {
      throw new Error("غير مصرح لك بالوصول")
    }

    const adRef = doc(db, COLLECTIONS.ads, adId)
    await updateDoc(adRef, {
      ...updates,
      lastModified: serverTimestamp(),
      moderatorId: auth.currentUser?.uid,
    })

    // تسجيل النشاط
    await logActivity(auth.currentUser?.uid || "", "admin_ad_updated", {
      adId,
      updates: Object.keys(updates),
    })
  } catch (error) {
    console.error("Error updating ad status:", error)
    throw error
  }
}

// تحديث حالة المستخدم (للمسؤولين)
export const updateUserStatus = async (userId: string, updates: any) => {
  try {
    if (!db) throw new Error("Firebase not configured")

    const isUserAdmin = await isAdmin(auth.currentUser?.uid || "")
    if (!isUserAdmin) {
      throw new Error("غير مصرح لك بالوصول")
    }

    const userRef = doc(db, COLLECTIONS.users, userId)
    await updateDoc(userRef, {
      ...updates,
      lastModified: serverTimestamp(),
      moderatorId: auth.currentUser?.uid,
    })

    // تسجيل النشاط
    await logActivity(auth.currentUser?.uid || "", "admin_user_updated", {
      targetUserId: userId,
      updates: Object.keys(updates),
    })
  } catch (error) {
    console.error("Error updating user status:", error)
    throw error
  }
}

// حظر مستخدم (للمسؤولين)
export const blockUser = async (userId: string, reason: string) => {
  try {
    if (!db) throw new Error("Firebase not configured")

    const isUserAdmin = await isAdmin(auth.currentUser?.uid || "")
    if (!isUserAdmin) {
      throw new Error("غير مصرح لك بالوصول")
    }

    const userRef = doc(db, COLLECTIONS.users, userId)
    await updateDoc(userRef, {
      isBlocked: true,
      blockReason: reason,
      blockedAt: serverTimestamp(),
      blockedBy: auth.currentUser?.uid,
      lastModified: serverTimestamp(),
    })

    // إضافة إلى قائمة المحظورين
    await addDoc(collection(db, COLLECTIONS.bannedUsers), {
      userId,
      reason,
      bannedAt: serverTimestamp(),
      bannedBy: auth.currentUser?.uid,
      isActive: true,
    })

    // تسجيل حدث الحظر
    await logSecurityEvent("user_blocked", userId, {
      reason,
      blockedBy: auth.currentUser?.uid,
      status: "success",
      riskLevel: "high",
    })

    return true
  } catch (error) {
    console.error("Error blocking user:", error)
    throw error
  }
}

// إلغاء حظر مستخدم (للمسؤولين)
export const unblockUser = async (userId: string) => {
  try {
    if (!db) throw new Error("Firebase not configured")

    const isUserAdmin = await isAdmin(auth.currentUser?.uid || "")
    if (!isUserAdmin) {
      throw new Error("غير مصرح لك بالوصول")
    }

    const userRef = doc(db, COLLECTIONS.users, userId)
    await updateDoc(userRef, {
      isBlocked: false,
      blockReason: null,
      unblockedAt: serverTimestamp(),
      unblockedBy: auth.currentUser?.uid,
      lastModified: serverTimestamp(),
    })

    // تسجيل حدث إلغاء الحظر
    await logSecurityEvent("user_unblocked", userId, {
      unblockedBy: auth.currentUser?.uid,
      status: "success",
      riskLevel: "low",
    })

    return true
  } catch (error) {
    console.error("Error unblocking user:", error)
    throw error
  }
}

// توثيق مستخدم (للمسؤولين)
export const verifyUser = async (userId: string) => {
  try {
    if (!db) throw new Error("Firebase not configured")

    const isUserAdmin = await isAdmin(auth.currentUser?.uid || "")
    if (!isUserAdmin) {
      throw new Error("غير مصرح لك بالوصول")
    }

    const userRef = doc(db, COLLECTIONS.users, userId)
    await updateDoc(userRef, {
      isVerified: true,
      verifiedAt: serverTimestamp(),
      verifiedBy: auth.currentUser?.uid,
      lastModified: serverTimestamp(),
    })

    // إرسال إشعار للمستخدم
    await addDoc(collection(db, COLLECTIONS.notifications), {
      userId,
      type: "verification",
      title: "تم توثيق حسابك",
      message: "تهانينا! تم توثيق حسابك بنجاح",
      createdAt: serverTimestamp(),
      isRead: false,
    })

    return true
  } catch (error) {
    console.error("Error verifying user:", error)
    throw error
  }
}

// إلغاء توثيق مستخدم (للمسؤولين)
export const unverifyUser = async (userId: string) => {
  try {
    if (!db) throw new Error("Firebase not configured")

    const isUserAdmin = await isAdmin(auth.currentUser?.uid || "")
    if (!isUserAdmin) {
      throw new Error("غير مصرح لك بالوصول")
    }

    const userRef = doc(db, COLLECTIONS.users, userId)
    await updateDoc(userRef, {
      isVerified: false,
      unverifiedAt: serverTimestamp(),
      unverifiedBy: auth.currentUser?.uid,
      lastModified: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Error unverifying user:", error)
    throw error
  }
}

// الحصول على سجلات الأمان (للمسؤولين)
export const getSecurityLogs = async (limit = 100) => {
  try {
    if (!db) return []

    const isUserAdmin = await isAdmin(auth.currentUser?.uid || "")
    if (!isUserAdmin) {
      throw new Error("غير مصرح لك بالوصول")
    }

    const logsRef = collection(db, COLLECTIONS.securityLogs)
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(limit))
    const snapshot = await getDocs(q)

    const logs = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
        formattedTimestamp: formatDateTimeGregorian(
          data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(),
        ),
      }
    })

    return logs
  } catch (error) {
    console.error("Error getting security logs:", error)
    return []
  }
}

// إنشاء تقرير (للمستخدمين)
export const createReport = async (reportData: any) => {
  try {
    if (!db) throw new Error("Firebase not configured")

    if (!auth.currentUser) {
      throw new Error("يجب تسجيل الدخول أولاً")
    }

    const sanitizedData = {
      ...reportData,
      reporterUserId: auth.currentUser.uid,
      reporterEmail: auth.currentUser.email || "",
      status: "pending",
      priority: "medium",
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.reports), sanitizedData)

    // تسجيل النشاط
    await logActivity(auth.currentUser.uid, "report_created", {
      reportId: docRef.id,
      type: reportData.type,
      reportedUserId: reportData.reportedUserId,
    })

    return docRef.id
  } catch (error) {
    console.error("Error creating report:", error)
    throw error
  }
}

// إنشاء طلب يد بيد
export const createHandToHandRequest = async (requestData: any) => {
  try {
    if (!db) throw new Error("Firebase not configured")

    if (!auth.currentUser) {
      throw new Error("يجب تسجيل الدخول أولاً")
    }

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30) // ينتهي بعد 30 يوم

    const sanitizedData = {
      ...requestData,
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email || "",
      userName: auth.currentUser.displayName || "مستخدم",
      createdAt: serverTimestamp(),
      expiryDate: expiryDate,
      status: "pending",
      isActive: true,
      priority: 1,
      contactCount: 0,
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.handToHand), sanitizedData)

    // تسجيل النشاط
    await logActivity(auth.currentUser.uid, "hand_to_hand_created", {
      requestId: docRef.id,
      type: requestData.type,
      accountType: requestData.accountType,
    })

    return docRef.id
  } catch (error) {
    console.error("Error creating hand to hand request:", error)
    throw error
  }
}

// الحصول على طلبات يد بيد
export const getHandToHandRequests = async () => {
  try {
    if (!db) return []

    const requestsRef = collection(db, COLLECTIONS.handToHand)
    const q = query(requestsRef, where("isActive", "==", true), orderBy("createdAt", "desc"), limit(50))
    const snapshot = await getDocs(q)

    const requests = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        expiryDate:
          data.expiryDate instanceof Timestamp
            ? data.expiryDate.toDate()
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        formattedCreatedAt: formatDateGregorian(
          data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        ),
      }
    })

    return requests
  } catch (error) {
    console.error("Error getting hand to hand requests:", error)
    return []
  }
}

// الحصول على الأخبار
export const getNews = async () => {
  try {
    if (!db) return []

    const newsRef = collection(db, COLLECTIONS.news)
    const q = query(newsRef, where("isActive", "==", true), orderBy("publishedAt", "desc"), limit(20))
    const snapshot = await getDocs(q)

    const news = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        publishedAt: data.publishedAt instanceof Timestamp ? data.publishedAt.toDate() : new Date(),
        formattedCreatedAt: formatDateGregorian(
          data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        ),
        formattedPublishedAt: formatDateGregorian(
          data.publishedAt instanceof Timestamp ? data.publishedAt.toDate() : new Date(),
        ),
      }
    })

    return news
  } catch (error) {
    console.error("Error getting news:", error)
    return []
  }
}
