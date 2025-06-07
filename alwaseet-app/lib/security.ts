// ملف جديد للأمان والحماية

import { hash, compare } from "bcryptjs"
import { createHash } from "crypto"

// تشفير البيانات الحساسة
export const encryptSensitiveData = (data: string): string => {
  return createHash("sha256").update(data).digest("hex")
}

// تشفير كلمة المرور
export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, 12)
}

// التحقق من كلمة المرور
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await compare(password, hashedPassword)
}

// تنظيف المدخلات من الأكواد الضارة
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/data:/gi, "")
    .replace(/eval\(/gi, "")
    .replace(/expression\(/gi, "")
}

// التحقق من صحة رقم الهاتف
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // تحقق من أن رقم الهاتف يبدأ بـ +20 ويتكون من 12-13 رقم
  const phoneRegex = /^\+20\d{9,10}$/
  return phoneRegex.test(phoneNumber)
}

// التحقق من صحة البريد الإلكتروني
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// التحقق من صحة الروابط
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// تحويل النص إلى HTML آمن
export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// التحقق من الجلسة
export const validateSession = (sessionToken: string, userId: string): boolean => {
  // هنا يمكن إضافة منطق التحقق من صلاحية الجلسة
  return sessionToken.length > 0 && userId.length > 0
}

// تحديد معدل الطلبات (Rate Limiting)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export const checkRateLimit = (userId: string, action: string, maxRequests = 5, windowMs = 60000): boolean => {
  const now = Date.now()
  const key = `${userId}:${action}`
  const userLimit = rateLimitMap.get(key)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (userLimit.count >= maxRequests) {
    return false
  }

  userLimit.count++
  return true
}

// التحقق من صلاحيات المستخدم
export const hasPermission = (userId: string, resourceOwnerId: string, isAdmin: boolean): boolean => {
  return userId === resourceOwnerId || isAdmin
}

// تسجيل محاولات الوصول غير المصرح بها
export const logSecurityEvent = (
  eventType: "unauthorized_access" | "login_failure" | "suspicious_activity",
  userId: string,
  details: Record<string, any>,
): void => {
  console.error(`Security Event: ${eventType}`, {
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  })

  // هنا يمكن إضافة منطق لتخزين سجلات الأمان في قاعدة البيانات
}
