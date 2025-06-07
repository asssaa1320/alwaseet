"use server"

import { db } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { isAdmin } from "@/lib/firebase"

// إضافة مسؤول جديد
export async function addAdmin(adminEmail: string, adminName = "مسؤول") {
  try {
    // يمكنك إضافة تحقق من المستخدم الحالي هنا إذا كنت تريد تقييد هذه العملية
    // للمسؤولين الحاليين فقط

    // إنشاء معرف للمسؤول (في الحالة المثالية، يجب أن يكون هذا هو UID من Firebase Auth)
    // لكن للتبسيط، سنستخدم البريد الإلكتروني مع إزالة الأحرف غير المسموح بها
    const adminId = adminEmail.replace(/[.@]/g, "_")

    // إضافة المسؤول إلى مجموعة admins
    await setDoc(doc(db, "admins", adminId), {
      email: adminEmail,
      name: adminName,
      role: "admin",
      createdAt: serverTimestamp(),
    })

    return { success: true, message: `تمت إضافة ${adminEmail} كمسؤول بنجاح` }
  } catch (error) {
    console.error("Error adding admin:", error)
    return { success: false, message: "حدث خطأ أثناء إضافة المسؤول" }
  }
}

// التحقق من صلاحيات المسؤول
export async function checkAdminStatus(email: string) {
  try {
    // استخدام الدالة الموجودة للتحقق من حالة المسؤول
    const adminId = email.replace(/[.@]/g, "_")
    const isUserAdmin = await isAdmin(adminId)

    return {
      success: true,
      isAdmin: isUserAdmin,
      message: isUserAdmin ? "المستخدم مسؤول" : "المستخدم ليس مسؤولاً",
    }
  } catch (error) {
    console.error("Error checking admin status:", error)
    return { success: false, message: "حدث خطأ أثناء التحقق من حالة المسؤول" }
  }
}
