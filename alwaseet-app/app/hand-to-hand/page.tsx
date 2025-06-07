"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HandHeart, ShoppingCart, DollarSign } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"

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

export default function HandToHandPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [requestType, setRequestType] = useState<"buyer" | "seller" | null>(null)
  const [loading, setLoading] = useState(false)

  const [sellerData, setSellerData] = useState({
    accountType: "",
    price: "",
    accountUrl: "",
    phoneNumber: "+20",
    description: "",
  })

  const [buyerData, setBuyerData] = useState({
    accountType: "",
    minFollowers: "",
    maxFollowers: "",
    maxPrice: "",
    phoneNumber: "+20",
    description: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!requestType) {
      newErrors.type = "يرجى اختيار نوع الطلب"
      setErrors(newErrors)
      return false
    }

    if (requestType === "seller") {
      if (!sellerData.accountType) newErrors.accountType = "نوع الحساب مطلوب"
      if (!sellerData.price || isNaN(Number(sellerData.price))) newErrors.price = "السعر يجب أن يكون رقم صحيح"
      if (!sellerData.accountUrl.trim()) newErrors.accountUrl = "رابط الحساب مطلوب"
      if (!sellerData.phoneNumber || sellerData.phoneNumber.length < 10) newErrors.phoneNumber = "رقم الهاتف غير صحيح"
      if (sellerData.description.length > 200) newErrors.description = "الوصف يجب ألا يزيد عن 200 حرف"
    } else {
      if (!buyerData.accountType) newErrors.accountType = "نوع الحساب مطلوب"
      if (!buyerData.minFollowers || isNaN(Number(buyerData.minFollowers)))
        newErrors.minFollowers = "الحد الأدنى للمتابعين مطلوب"
      if (!buyerData.maxFollowers || isNaN(Number(buyerData.maxFollowers)))
        newErrors.maxFollowers = "الحد الأقصى للمتابعين مطلوب"
      if (!buyerData.maxPrice || isNaN(Number(buyerData.maxPrice))) newErrors.maxPrice = "الحد الأقصى للسعر مطلوب"
      if (!buyerData.phoneNumber || buyerData.phoneNumber.length < 10) newErrors.phoneNumber = "رقم الهاتف غير صحيح"
      if (buyerData.description.length > 200) newErrors.description = "الوصف يجب ألا يزيد عن 200 حرف"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push("/login")
      return
    }

    if (!validateForm()) return

    try {
      setLoading(true)

      const requestData = {
        type: requestType,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || "مستخدم",
        createdAt: new Date(),
        ...(requestType === "seller" ? sellerData : buyerData),
      }

      console.log("Hand-to-hand request:", requestData)

      alert("تم إرسال طلبك بنجاح! سيتم مراجعته من قبل الإدارة.")

      // Reset form
      setRequestType(null)
      setSellerData({
        accountType: "",
        price: "",
        accountUrl: "",
        phoneNumber: "+20",
        description: "",
      })
      setBuyerData({
        accountType: "",
        minFollowers: "",
        maxFollowers: "",
        maxPrice: "",
        phoneNumber: "+20",
        description: "",
      })
    } catch (error) {
      console.error("Error submitting request:", error)
      alert("حدث خطأ أثناء إرسال الطلب")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string, isSellerData = true) => {
    const sanitizedValue = value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")

    if (isSellerData) {
      setSellerData((prev) => ({ ...prev, [field]: sanitizedValue }))
    } else {
      setBuyerData((prev) => ({ ...prev, [field]: sanitizedValue }))
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="flex items-center justify-center py-16">
          <Card className="max-w-md w-full mx-4 simple-card">
            <CardContent className="p-6 text-center">
              <HandHeart className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-gray-900 mb-4">تسجيل الدخول مطلوب</h2>
              <p className="text-gray-600 mb-6">يجب تسجيل الدخول للوصول إلى خدمة يد بيد</p>
              <Link href="/login">
                <Button className="w-full simple-button">تسجيل الدخول</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />

      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <HandHeart className="w-8 h-8 text-orange-500" />
              <h1 className="text-2xl font-bold text-gray-900">يد بيد</h1>
            </div>
            <p className="text-gray-600 mb-6">خدمة التواصل المباشر بين البائعين والمشترين</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <h3 className="font-medium text-blue-800 mb-2">كيف تعمل الخدمة؟</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• اختر إذا كنت بائع أو مشتري</li>
                <li>• املأ البيانات المطلوبة</li>
                <li>• سيتم إرسال طلبك للإدارة</li>
                <li>• ستتم مراجعة الطلب والتواصل معك</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {!requestType ? (
          /* Type Selection */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card
              className="simple-card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setRequestType("seller")}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">أنا بائع</h3>
                <p className="text-gray-600 mb-4">لديك حساب تريد بيعه؟ أضف تفاصيل حسابك وسعرك المطلوب</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="font-medium text-green-800 mb-2">ما تحتاج لتقديمه:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• نوع الحساب</li>
                    <li>• السعر المطلوب بالجنيه</li>
                    <li>• رابط الحساب</li>
                    <li>• رقم التواصل</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card
              className="simple-card cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setRequestType("buyer")}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">أنا مشتري</h3>
                <p className="text-gray-600 mb-4">تبحث عن حساب معين؟ حدد مواصفاتك وميزانيتك</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-800 mb-2">ما تحتاج لتحديده:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• نوع الحساب المطلوب</li>
                    <li>• عدد المتابعين المطلوب</li>
                    <li>• الميزانية المتاحة بالجنيه</li>
                    <li>• رقم التواصل</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Form */
          <Card className="max-w-2xl mx-auto simple-card">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                {requestType === "seller" ? (
                  <>
                    <DollarSign className="w-6 h-6" />
                    طلب بيع
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" />
                    طلب شراء
                  </>
                )}
              </CardTitle>
              <p className="text-gray-600 text-sm">
                {requestType === "seller" ? "املأ بيانات الحساب الذي تريد بيعه" : "حدد مواصفات الحساب الذي تريد شراءه"}
              </p>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Type */}
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">نوع الحساب *</Label>
                  <Select
                    value={requestType === "seller" ? sellerData.accountType : buyerData.accountType}
                    onValueChange={(value) => handleInputChange("accountType", value, requestType === "seller")}
                  >
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

                {requestType === "seller" ? (
                  /* Seller Fields */
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-gray-700 font-medium">
                        السعر المطلوب بالجنيه المصري *
                      </Label>
                      <div className="relative">
                        <Input
                          id="price"
                          type="number"
                          value={sellerData.price}
                          onChange={(e) => handleInputChange("price", e.target.value)}
                          placeholder="مثال: 500"
                          min="1"
                          className={`simple-input pl-12 ${errors.price ? "border-red-500" : ""}`}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          ج.م
                        </div>
                      </div>
                      {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountUrl" className="text-gray-700 font-medium">
                        رابط الحساب *
                      </Label>
                      <Input
                        id="accountUrl"
                        value={sellerData.accountUrl}
                        onChange={(e) => handleInputChange("accountUrl", e.target.value)}
                        placeholder="https://..."
                        className={`simple-input ${errors.accountUrl ? "border-red-500" : ""}`}
                      />
                      {errors.accountUrl && <p className="text-red-500 text-sm">{errors.accountUrl}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sellerPhone" className="text-gray-700 font-medium">
                        رقم التواصل *
                      </Label>
                      <Input
                        id="sellerPhone"
                        value={sellerData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        placeholder="+20 1234567890"
                        className={`simple-input ${errors.phoneNumber ? "border-red-500" : ""}`}
                      />
                      {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sellerDescription" className="text-gray-700 font-medium">
                        وصف إضافي (اختياري){" "}
                        <span className="text-sm text-gray-500">({sellerData.description.length}/200)</span>
                      </Label>
                      <Textarea
                        id="sellerDescription"
                        value={sellerData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="معلومات إضافية عن الحساب..."
                        maxLength={200}
                        rows={3}
                        className={`simple-input resize-none ${errors.description ? "border-red-500" : ""}`}
                      />
                      {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                    </div>
                  </>
                ) : (
                  /* Buyer Fields */
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minFollowers" className="text-gray-700 font-medium">
                          الحد الأدنى للمتابعين *
                        </Label>
                        <Input
                          id="minFollowers"
                          type="number"
                          value={buyerData.minFollowers}
                          onChange={(e) => handleInputChange("minFollowers", e.target.value, false)}
                          placeholder="1000"
                          min="0"
                          className={`simple-input ${errors.minFollowers ? "border-red-500" : ""}`}
                        />
                        {errors.minFollowers && <p className="text-red-500 text-sm">{errors.minFollowers}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxFollowers" className="text-gray-700 font-medium">
                          الحد الأقصى للمتابعين *
                        </Label>
                        <Input
                          id="maxFollowers"
                          type="number"
                          value={buyerData.maxFollowers}
                          onChange={(e) => handleInputChange("maxFollowers", e.target.value, false)}
                          placeholder="100000"
                          min="0"
                          className={`simple-input ${errors.maxFollowers ? "border-red-500" : ""}`}
                        />
                        {errors.maxFollowers && <p className="text-red-500 text-sm">{errors.maxFollowers}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxPrice" className="text-gray-700 font-medium">
                        الحد الأقصى للسعر بالجنيه المصري *
                      </Label>
                      <div className="relative">
                        <Input
                          id="maxPrice"
                          type="number"
                          value={buyerData.maxPrice}
                          onChange={(e) => handleInputChange("maxPrice", e.target.value, false)}
                          placeholder="مثال: 1000"
                          min="1"
                          className={`simple-input pl-12 ${errors.maxPrice ? "border-red-500" : ""}`}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          ج.م
                        </div>
                      </div>
                      {errors.maxPrice && <p className="text-red-500 text-sm">{errors.maxPrice}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buyerPhone" className="text-gray-700 font-medium">
                        رقم التواصل *
                      </Label>
                      <Input
                        id="buyerPhone"
                        value={buyerData.phoneNumber}
                        onChange={(e) => handleInputChange("phoneNumber", e.target.value, false)}
                        placeholder="+20 1234567890"
                        className={`simple-input ${errors.phoneNumber ? "border-red-500" : ""}`}
                      />
                      {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buyerDescription" className="text-gray-700 font-medium">
                        متطلبات إضافية (اختياري){" "}
                        <span className="text-sm text-gray-500">({buyerData.description.length}/200)</span>
                      </Label>
                      <Textarea
                        id="buyerDescription"
                        value={buyerData.description}
                        onChange={(e) => handleInputChange("description", e.target.value, false)}
                        placeholder="متطلبات خاصة أو معلومات إضافية..."
                        maxLength={200}
                        rows={3}
                        className={`simple-input resize-none ${errors.description ? "border-red-500" : ""}`}
                      />
                      {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setRequestType(null)} className="flex-1">
                    العودة
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1 simple-button">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        جاري الإرسال...
                      </div>
                    ) : (
                      "إرسال الطلب"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  )
}
