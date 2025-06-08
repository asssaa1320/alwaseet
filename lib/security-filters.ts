// نظام شامل للحماية من الثغرات الأمنية

import DOMPurify from "isomorphic-dompurify"
import { createHash, randomBytes } from "crypto"

// 1. حماية من XSS (Cross-Site Scripting)
export class XSSProtection {
  // تنظيف HTML من الأكواد الضارة
  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    })
  }

  // تنظيف النصوص العادية
  static sanitizeText(input: string): string {
    return input
      .replace(/[<>]/g, "") // إزالة أقواس HTML
      .replace(/javascript:/gi, "") // إزالة JavaScript URLs
      .replace(/on\w+\s*=/gi, "") // إزالة event handlers
      .replace(/data:/gi, "") // إزالة data URLs
      .replace(/vbscript:/gi, "") // إزالة VBScript
      .replace(/expression\(/gi, "") // إزالة CSS expressions
      .replace(/eval\(/gi, "") // إزالة eval
      .replace(/script/gi, "") // إزالة كلمة script
      .trim()
  }

  // تشفير الأحرف الخاصة
  static encodeSpecialChars(input: string): string {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
  }
}

// 2. حماية من SQL Injection
export class SQLInjectionProtection {
  private static readonly SQL_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(--|\/\*|\*\/|;)/g,
    /(\b(CHAR|NCHAR|VARCHAR|NVARCHAR)\s*\()/gi,
    /(\b(CAST|CONVERT|SUBSTRING|ASCII|CHAR_LENGTH)\s*\()/gi,
  ]

  static detectSQLInjection(input: string): boolean {
    return this.SQL_PATTERNS.some((pattern) => pattern.test(input))
  }

  static sanitizeForDatabase(input: string): string {
    // إزالة الأحرف الخطيرة
    return input
      .replace(/['"\\;]/g, "") // إزالة علامات الاقتباس والفاصلة المنقوطة
      .replace(/--/g, "") // إزالة تعليقات SQL
      .replace(/\/\*|\*\//g, "") // إزالة تعليقات متعددة الأسطر
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, "") // إزالة كلمات SQL المحجوزة
      .trim()
  }
}

// 3. حماية من CSRF (Cross-Site Request Forgery)
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>()

  static generateToken(userId: string): string {
    const token = randomBytes(32).toString("hex")
    const expires = Date.now() + 60 * 60 * 1000 // ساعة واحدة

    this.tokens.set(userId, { token, expires })
    return token
  }

  static validateToken(userId: string, token: string): boolean {
    const stored = this.tokens.get(userId)
    if (!stored) return false

    if (Date.now() > stored.expires) {
      this.tokens.delete(userId)
      return false
    }

    return stored.token === token
  }

  static cleanExpiredTokens(): void {
    const now = Date.now()
    for (const [userId, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(userId)
      }
    }
  }
}

// 4. التحقق من صحة المدخلات
export class InputValidation {
  // التحقق من البريد الإلكتروني
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email) && email.length <= 254
  }

  // التحقق من رقم الهاتف المصري
  static isValidEgyptianPhone(phone: string): boolean {
    const phoneRegex = /^\+20(10|11|12|15)\d{8}$/
    return phoneRegex.test(phone)
  }

  // التحقق من قوة كلمة المرور
  static isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) errors.push("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    if (!/[A-Z]/.test(password)) errors.push("يجب أن تحتوي على حرف كبير")
    if (!/[a-z]/.test(password)) errors.push("يجب أن تحتوي على حرف صغير")
    if (!/\d/.test(password)) errors.push("يجب أن تحتوي على رقم")
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("يجب أن تحتوي على رمز خاص")

    return { isValid: errors.length === 0, errors }
  }

  // التحقق من الروابط
  static isValidURL(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return ["http:", "https:"].includes(urlObj.protocol)
    } catch {
      return false
    }
  }

  // التحقق من أنواع الملفات المسموحة
  static isAllowedFileType(filename: string, allowedTypes: string[]): boolean {
    const extension = filename.split(".").pop()?.toLowerCase()
    return extension ? allowedTypes.includes(extension) : false
  }

  // التحقق من حجم الملف
  static isValidFileSize(size: number, maxSizeMB: number): boolean {
    return size <= maxSizeMB * 1024 * 1024
  }
}

// 5. تحديد معدل الطلبات (Rate Limiting)
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number; blocked: boolean }>()

  static checkLimit(
    identifier: string,
    maxRequests: number,
    windowMs: number,
    blockDurationMs = 300000, // 5 دقائق حظر افتراضي
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const key = identifier
    const current = this.requests.get(key)

    // إذا كان المستخدم محظوراً
    if (current?.blocked && now < current.resetTime) {
      return { allowed: false, remaining: 0, resetTime: current.resetTime }
    }

    // إذا انتهت فترة النافذة أو لا توجد طلبات سابقة
    if (!current || now > current.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs,
        blocked: false,
      })
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs }
    }

    // زيادة عدد الطلبات
    current.count++

    // إذا تم تجاوز الحد المسموح
    if (current.count > maxRequests) {
      current.blocked = true
      current.resetTime = now + blockDurationMs
      return { allowed: false, remaining: 0, resetTime: current.resetTime }
    }

    return {
      allowed: true,
      remaining: maxRequests - current.count,
      resetTime: current.resetTime,
    }
  }

  static resetUser(identifier: string): void {
    this.requests.delete(identifier)
  }

  static cleanExpired(): void {
    const now = Date.now()
    for (const [key, data] of this.requests.entries()) {
      if (now > data.resetTime && !data.blocked) {
        this.requests.delete(key)
      }
    }
  }
}

// 6. حماية رفع الملفات
export class FileUploadSecurity {
  private static readonly DANGEROUS_EXTENSIONS = [
    "exe",
    "bat",
    "cmd",
    "com",
    "pif",
    "scr",
    "vbs",
    "js",
    "jar",
    "php",
    "asp",
    "aspx",
    "jsp",
  ]

  private static readonly ALLOWED_IMAGE_TYPES = ["jpg", "jpeg", "png", "gif", "webp"]

  static validateImageFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      errors.push("يجب أن يكون الملف صورة")
    }

    // التحقق من امتداد الملف
    const extension = file.name.split(".").pop()?.toLowerCase()
    if (!extension || !this.ALLOWED_IMAGE_TYPES.includes(extension)) {
      errors.push("نوع الصورة غير مدعوم")
    }

    // التحقق من الامتدادات الخطيرة
    if (extension && this.DANGEROUS_EXTENSIONS.includes(extension)) {
      errors.push("نوع الملف غير مسموح")
    }

    // التحقق من حجم الملف (2MB)
    if (file.size > 2 * 1024 * 1024) {
      errors.push("حجم الصورة يجب ألا يزيد عن 2 ميجابايت")
    }

    // التحقق من اسم الملف
    if (this.containsSuspiciousContent(file.name)) {
      errors.push("اسم الملف يحتوي على أحرف غير مسموحة")
    }

    return { isValid: errors.length === 0, errors }
  }

  private static containsSuspiciousContent(filename: string): boolean {
    const suspiciousPatterns = [
      /[<>:"/\\|?*]/g, // أحرف غير مسموحة في أسماء الملفات
      /\.\./g, // محاولة الوصول للمجلدات الأعلى
      /script/gi, // كلمة script
      /javascript/gi, // كلمة javascript
    ]

    return suspiciousPatterns.some((pattern) => pattern.test(filename))
  }
}

// 7. تشفير البيانات الحساسة
export class DataEncryption {
  static hashSensitiveData(data: string, salt?: string): string {
    const actualSalt = salt || randomBytes(16).toString("hex")
    return createHash("sha256")
      .update(data + actualSalt)
      .digest("hex")
  }

  static generateSalt(): string {
    return randomBytes(16).toString("hex")
  }

  // تشفير معرفات المستخدمين للسجلات
  static hashUserId(userId: string): string {
    return createHash("sha256")
      .update(userId + "user_salt_2024")
      .digest("hex")
      .substring(0, 16)
  }
}

// 8. فئة شاملة للحماية
export class SecurityManager {
  static sanitizeUserInput(input: string, type: "text" | "html" | "email" | "phone" | "url" = "text"): string {
    // تنظيف أساسي
    let sanitized = input.trim()

    // إزالة الأحرف الضارة
    sanitized = XSSProtection.sanitizeText(sanitized)
    sanitized = SQLInjectionProtection.sanitizeForDatabase(sanitized)

    // تنظيف حسب النوع
    switch (type) {
      case "html":
        sanitized = XSSProtection.sanitizeHTML(sanitized)
        break
      case "email":
        sanitized = sanitized.toLowerCase().replace(/[^a-z0-9@._-]/g, "")
        break
      case "phone":
        sanitized = sanitized.replace(/[^+0-9]/g, "")
        break
      case "url":
        // التحقق من صحة الرابط
        if (!InputValidation.isValidURL(sanitized)) {
          sanitized = ""
        }
        break
    }

    return sanitized
  }

  static validateAndSanitize(
    data: Record<string, any>,
    rules: Record<string, any>,
  ): {
    isValid: boolean
    sanitizedData: Record<string, any>
    errors: Record<string, string[]>
  } {
    const errors: Record<string, string[]> = {}
    const sanitizedData: Record<string, any> = {}

    for (const [field, value] of Object.entries(data)) {
      const rule = rules[field]
      if (!rule) continue

      const fieldErrors: string[] = []

      // التحقق من الحقول المطلوبة
      if (rule.required && (!value || value.toString().trim() === "")) {
        fieldErrors.push(`${field} مطلوب`)
        continue
      }

      if (value) {
        const stringValue = value.toString()

        // التحقق من الطول
        if (rule.minLength && stringValue.length < rule.minLength) {
          fieldErrors.push(`${field} يجب أن يكون ${rule.minLength} أحرف على الأقل`)
        }
        if (rule.maxLength && stringValue.length > rule.maxLength) {
          fieldErrors.push(`${field} يجب ألا يزيد عن ${rule.maxLength} حرف`)
        }

        // تنظيف البيانات
        sanitizedData[field] = this.sanitizeUserInput(stringValue, rule.type || "text")

        // التحقق من النوع
        if (rule.type === "email" && !InputValidation.isValidEmail(sanitizedData[field])) {
          fieldErrors.push("البريد الإلكتروني غير صحيح")
        }
        if (rule.type === "phone" && !InputValidation.isValidEgyptianPhone(sanitizedData[field])) {
          fieldErrors.push("رقم الهاتف غير صحيح")
        }
        if (rule.type === "url" && sanitizedData[field] && !InputValidation.isValidURL(sanitizedData[field])) {
          fieldErrors.push("الرابط غير صحيح")
        }

        // التحقق من الأنماط المخصصة
        if (rule.pattern && !rule.pattern.test(sanitizedData[field])) {
          fieldErrors.push(rule.patternMessage || `${field} لا يتطابق مع النمط المطلوب`)
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      sanitizedData,
      errors,
    }
  }
}

// 9. مراقبة الأنشطة المشبوهة
export class SecurityMonitor {
  private static suspiciousActivities = new Map<
    string,
    {
      count: number
      lastActivity: number
      activities: string[]
    }
  >()

  static logActivity(userId: string, activity: string, details?: any): void {
    const now = Date.now()
    const userActivities = this.suspiciousActivities.get(userId) || {
      count: 0,
      lastActivity: now,
      activities: [],
    }

    userActivities.count++
    userActivities.lastActivity = now
    userActivities.activities.push(`${new Date().toISOString()}: ${activity}`)

    // الاحتفاظ بآخر 50 نشاط فقط
    if (userActivities.activities.length > 50) {
      userActivities.activities = userActivities.activities.slice(-50)
    }

    this.suspiciousActivities.set(userId, userActivities)

    // تسجيل النشاط المشبوه
    if (this.isSuspiciousActivity(activity, userActivities)) {
      console.warn("Suspicious activity detected:", {
        userId: DataEncryption.hashUserId(userId),
        activity,
        details,
        timestamp: new Date().toISOString(),
      })
    }
  }

  private static isSuspiciousActivity(activity: string, userActivities: any): boolean {
    // أنشطة مشبوهة
    const suspiciousPatterns = [
      "multiple_failed_logins",
      "rapid_requests",
      "sql_injection_attempt",
      "xss_attempt",
      "unauthorized_access",
      "suspicious_file_upload",
    ]

    return suspiciousPatterns.some((pattern) => activity.includes(pattern)) || userActivities.count > 100 // أكثر من 100 نشاط
  }

  static getUserRiskScore(userId: string): number {
    const activities = this.suspiciousActivities.get(userId)
    if (!activities) return 0

    let score = 0
    const now = Date.now()
    const hourAgo = now - 60 * 60 * 1000

    // زيادة النقاط للأنشطة الحديثة
    if (activities.lastActivity > hourAgo) {
      score += activities.count * 0.1
    }

    // فحص الأنشطة المشبوهة
    const suspiciousCount = activities.activities.filter((activity) =>
      ["failed", "suspicious", "blocked", "unauthorized"].some((keyword) => activity.toLowerCase().includes(keyword)),
    ).length

    score += suspiciousCount * 2

    return Math.min(score, 100) // الحد الأقصى 100
  }
}

// تنظيف دوري للبيانات المؤقتة
setInterval(
  () => {
    CSRFProtection.cleanExpiredTokens()
    RateLimiter.cleanExpired()
  },
  5 * 60 * 1000,
) // كل 5 دقائق
