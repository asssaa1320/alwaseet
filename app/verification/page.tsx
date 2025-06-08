"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { requestVerification, getUserProfile } from "@/lib/firebase"
import { ImageIcon, AlertCircle, CheckCircle, Upload, ArrowRight, Shield } from "lucide-react"
import Link from "next/link"

export default function VerificationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVerified, setIsVerified] = useState(false)

  // بيانات التوثيق
  const [verificationData, setVerificationData] = useState({
    fullName: "",
    idNumber: "",
    phoneNumber: "",
    reason: "",
    additionalInfo: "",
  })

  // ملفات التوثيق
  const [idImage, setIdImage] = useState<File | null>(null)
  const [idImagePreview, setIdImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    loadUserProfile()
  }, [user])

  const loadUserProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // محاولة تحميل بيانات المستخدم من Firebase
      const userData = await getUserProfile(user.uid)

      if (userData) {
        setIsVerified(userData.isVerified || false)

        // تعبئة بيانات النموذج
        setVerificationData({
          ...verificationData,
          fullName: userData.name || user.displayName || "",
          phoneNumber: userData.phoneNumber || "",
        })
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
      setError("حدث خطأ أثناء تحميل بيانات المستخدم")
    } finally {
      setLoading(false)
    }
  }

  const handleIdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("يرجى اختيار صورة صحيحة")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("حجم الصورة يجب ألا يزيد عن 2 ميجابايت")
      return
    }

    setIdImage(file)
    setError(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      setIdImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push("/login")
      return
    }

    // التحقق من البيانات المطلوبة
    if (!verificationData.fullName || !verificationData.idNumber || !verificationData.phoneNumber || !idImage) {
      setError("يرجى ملء جميع الحقول المطلوبة وإرفاق صورة الهوية")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // رفع صورة الهوية وإرسال طلب التوثيق
      // في الحالة الحقيقية، سنقوم برفع الصورة إلى Firebase Storage
      // ثم إرسال طلب التوثيق مع رابط الصورة

      // محاكاة رفع الصورة
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // إرسال طلب التوثيق
      await requestVerification(user.uid, {
        ...verificationData,
        idImageUrl: "https://example.com/id-image.jpg", // في الحالة الحقيقية، سيكون هذا رابط الصورة المرفوعة
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/profile")
      }, 3000)
    } catch (error) {
      console.error("Error submitting verification request:", error)
      setError("حدث خطأ أثناء إرسال طلب التوثيق")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="max-w-2xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="border-0 shadow-lg rounded-xl">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5 text-green-600" />
                حسابك موثق
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">تهانينا!</h2>
              <p className="text-gray-600 mb-6">حسابك موثق بالفعل. يمكنك الاستمتاع بجميع مزايا الحسابات الموثقة.</p>
              <Link href="/profile">
                <Button className="bg-green-600 hover:bg-green-700">
                  <ArrowRight className="w-4 h-4 ml-2" />
                  العودة للملف الشخصي
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="border-0 shadow-lg rounded-xl">
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5 text-green-600" />
                تم إرسال طلب التوثيق
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">تم إرسال طلبك بنجاح!</h2>
              <p className="text-gray-600 mb-6">
                سيتم مراجعة طلب التوثيق الخاص بك من قبل فريق الإدارة. سيتم إعلامك بالنتيجة قريبًا.
              </p>
              <p className="text-sm text-gray-500 mb-6">جاري تحويلك إلى الملف الشخصي...</p>
              <Link href="/profile">
                <Button className="bg-green-600 hover:bg-green-700">
                  <ArrowRight className="w-4 h-4 ml-2" />
                  العودة للملف الشخصي
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">طلب توثيق الحساب</h1>
          <Link href="/profile">
            <Button variant="outline">العودة للملف الشخصي</Button>
          </Link>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border-0 shadow-lg rounded-xl">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Shield className="w-5 h-5 text-blue-600" />
              توثيق الحساب
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-medium mb-2">ما هو توثيق الحساب؟</p>
              <p className="text-blue-700 text-sm">
                توثيق الحساب يمنحك شارة التوثيق التي تظهر بجانب اسمك وإعلاناتك، مما يزيد من مصداقيتك ويعزز ثقة
                المستخدمين الآخرين في التعامل معك.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">الاسم الكامل *</Label>
                <Input
                  id="fullName"
                  value={verificationData.fullName}
                  onChange={(e) => setVerificationData({ ...verificationData, fullName: e.target.value })}
                  placeholder="الاسم الكامل كما في الهوية"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">رقم الهوية *</Label>
                <Input
                  id="idNumber"
                  value={verificationData.idNumber}
                  onChange={(e) => setVerificationData({ ...verificationData, idNumber: e.target.value })}
                  placeholder="رقم الهوية الوطنية"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">رقم الهاتف *</Label>
                <Input
                  id="phoneNumber"
                  value={verificationData.phoneNumber}
                  onChange={(e) => setVerificationData({ ...verificationData, phoneNumber: e.target.value })}
                  placeholder="+20 1234567890"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">سبب طلب التوثيق *</Label>
                <Textarea
                  id="reason"
                  value={verificationData.reason}
                  onChange={(e) => setVerificationData({ ...verificationData, reason: e.target.value })}
                  placeholder="اشرح سبب رغبتك في توثيق حسابك"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">معلومات إضافية (اختياري)</Label>
                <Textarea
                  id="additionalInfo"
                  value={verificationData.additionalInfo}
                  onChange={(e) => setVerificationData({ ...verificationData, additionalInfo: e.target.value })}
                  placeholder="أي معلومات إضافية ترغب في إضافتها"
                />
              </div>

              <div className="space-y-2">
                <Label>صورة الهوية *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  {idImagePreview ? (
                    <div className="space-y-3">
                      <img
                        src={idImagePreview || "/placeholder.svg"}
                        alt="معاينة صورة الهوية"
                        className="max-w-full h-32 object-cover mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIdImage(null)
                          setIdImagePreview(null)
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
                        <Label htmlFor="idImage" className="cursor-pointer">
                          <span className="text-blue-500 hover:text-blue-600 font-medium">اختر صورة</span>
                          <span className="text-gray-500"> أو اسحب الصورة هنا</span>
                        </Label>
                        <Input
                          id="idImage"
                          type="file"
                          accept="image/*"
                          onChange={handleIdImageUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-sm text-gray-500">PNG, JPG حتى 2MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <p className="text-yellow-800 font-medium mb-2">ملاحظة هامة</p>
                <p className="text-yellow-700 text-sm">
                  سيتم التعامل مع جميع البيانات المقدمة بسرية تامة ولن يتم مشاركتها مع أي طرف ثالث. يرجى التأكد من صحة
                  جميع البيانات المقدمة.
                </p>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button variant="outline" onClick={() => router.push("/profile")}>
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      إرسال طلب التوثيق
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
