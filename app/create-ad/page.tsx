"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ImageIcon, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { createAd, uploadImage, getUserAdsCount } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"

const ACCOUNT_TYPES = [
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
]

export default function CreateAdPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userAdsCount, setUserAdsCount] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    accountType: "",
    price: "",
    duration: "12",
    phoneNumber: "+20",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    loadUserAdsCount()
  }, [user])

  const loadUserAdsCount = async () => {
    if (!user) return

    try {
      const count = await getUserAdsCount(user.uid)
      setUserAdsCount(count)
    } catch (error) {
      console.error("Error loading user ads count:", error)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "عنوان الإعلان مطلوب"
    } else if (formData.title.length > 30) {
      newErrors.title = "عنوان الإعلان يجب ألا يزيد عن 30 حرف"
    }

    if (!formData.description.trim()) {
      newErrors.description = "وصف الإعلان مطلوب"
    } else if (formData.description.length > 200) {
      newErrors.description = "وصف الإعلان يجب ألا يزيد عن 200 حرف"
    }

    if (!formData.accountType) {
      newErrors.accountType = "نوع الحساب مطلوب"
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "السعر يجب أن يكون رقم صحيح أكبر من صفر"
    }

    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      newErrors.phoneNumber = "رقم الهاتف غير صحيح"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار صورة صحيحة")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("حجم الصورة يجب ألا يزيد عن 2 ميجابايت")
      return
    }

    setImageFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push("/login")
      return
    }

    if (userAdsCount >= 2) {
      alert("لا يمكنك نشر أكثر من إعلانين. يرجى حذف إعلان سابق أولاً.")
      return
    }

    if (!validateForm()) return

    try {
      setLoading(true)

      let imageUrl = ""
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, `ads/${user.uid}/${Date.now()}`)
      }

      const adData = {
        ...formData,
        imageUrl,
        price: Number(formData.price),
        duration: Number(formData.duration),
        currency: "جنيه",
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || "مستخدم",
        createdAt: new Date(),
        expiryDate: new Date(Date.now() + Number(formData.duration) * 60 * 60 * 1000),
        views: 0,
        isActive: true,
      }

      await createAd(adData)

      alert("تم نشر الإعلان بنجاح!")
      router.push("/profile")
    } catch (error) {
      console.error("Error creating ad:", error)
      alert("حدث خطأ أثناء نشر الإعلان")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")

    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (!user) {
    return <div>جاري التحميل...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="simple-card">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-gray-900">إنشاء إعلان جديد</CardTitle>
            <p className="text-gray-600 text-sm">املأ البيانات التالية لنشر إعلانك</p>
          </CardHeader>

          <CardContent className="p-6">
            {/* Ads Limit Warning */}
            {userAdsCount >= 2 && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  لقد وصلت للحد الأقصى من الإعلانات (2 إعلانات). يرجى حذف إعلان سابق لنشر إعلان جديد.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700 font-medium">
                  عنوان الإعلان *<span className="text-sm text-gray-500 mr-2">({formData.title.length}/30)</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="مثال: حساب تيك توك 100k متابع"
                  maxLength={30}
                  className={`simple-input ${errors.title ? "border-red-500" : ""}`}
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
              </div>

              {/* Account Type */}
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">نوع الحساب *</Label>
                <Select value={formData.accountType} onValueChange={(value) => handleInputChange("accountType", value)}>
                  <SelectTrigger className={`${errors.accountType ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="اختر نوع الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.accountType && <p className="text-red-500 text-sm">{errors.accountType}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700 font-medium">
                  وصف الإعلان *<span className="text-sm text-gray-500 mr-2">({formData.description.length}/200)</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="اكتب وصف مفصل للحساب..."
                  maxLength={200}
                  rows={4}
                  className={`simple-input resize-none ${errors.description ? "border-red-500" : ""}`}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price" className="text-gray-700 font-medium">
                  السعر بالجنيه المصري *
                </Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="100"
                    min="1"
                    className={`simple-input pl-12 ${errors.price ? "border-red-500" : ""}`}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">ج.م</div>
                </div>
                {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">مدة الإعلان</Label>
                <RadioGroup
                  value={formData.duration}
                  onValueChange={(value) => handleInputChange("duration", value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="12" id="12h" />
                    <Label htmlFor="12h" className="cursor-pointer">
                      12 ساعة
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="24" id="24h" />
                    <Label htmlFor="24h" className="cursor-pointer">
                      24 ساعة
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  رقم التواصل *
                </Label>
                <Input
                  id="phone"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="+20 1234567890"
                  className={`simple-input ${errors.phoneNumber ? "border-red-500" : ""}`}
                />
                <p className="text-sm text-gray-500">سيتم توجيه المهتمين لواتساب هذا الرقم</p>
                {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">صورة الحساب (اختيارية)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="معاينة الصورة"
                        className="max-w-full h-32 object-cover mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                        size="sm"
                      >
                        إزالة الصورة
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
                      <div>
                        <Label htmlFor="image" className="cursor-pointer">
                          <span className="text-orange-500 hover:text-orange-600 font-medium">اختر صورة</span>
                          <span className="text-gray-500"> أو اسحب الصورة هنا</span>
                        </Label>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-sm text-gray-500">PNG, JPG حتى 2MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={loading || userAdsCount >= 2} className="w-full h-12 simple-button">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري النشر...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ml-2" />
                    نشر الإعلان
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
