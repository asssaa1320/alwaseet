"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Chrome, Facebook, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { signInWithGoogle, signInWithFacebook, error } = useAuth()
  const router = useRouter()

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <div className="flex items-center justify-center py-16">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">خطأ في الإعداد</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link href="/firebase-setup">
                <Button className="bg-orange-500 hover:bg-orange-600">إعداد Firebase</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
      router.push("/")
    } catch (error: any) {
      console.error("Error signing in with Google:", error)
      alert(error.message || "حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    try {
      setLoading(true)
      await signInWithFacebook()
      router.push("/")
    } catch (error: any) {
      console.error("Error signing in with Facebook:", error)
      alert(error.message || "حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />

      <div className="flex items-center justify-center py-16">
        <div className="w-full max-w-md mx-4">
          {/* Back Link */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500">
              <ArrowRight className="w-4 h-4" />
              <span>العودة للرئيسية</span>
            </Link>
          </div>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">و</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">الوسيط</h1>
            </div>
            <p className="text-gray-600">منصة آمنة لبيع وشراء الحسابات</p>
          </div>

          <Card className="simple-card">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold text-gray-900">تسجيل الدخول</CardTitle>
              <p className="text-gray-600 text-sm">اختر طريقة تسجيل الدخول</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">حماية متقدمة</p>
                  <p className="text-blue-600">نستخدم أحدث تقنيات الأمان لحماية حسابك</p>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-11 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Chrome className="w-4 h-4 ml-2 text-blue-500" />
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول بـ Google"}
                </Button>

                <Button
                  onClick={handleFacebookSignIn}
                  disabled={loading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Facebook className="w-4 h-4 ml-2" />
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول بـ Facebook"}
                </Button>
              </div>

              {/* Terms */}
              <div className="text-center text-xs text-gray-600">
                <p>
                  بتسجيل الدخول، أنت توافق على{" "}
                  <Link href="/terms" className="text-orange-500 hover:underline">
                    الشروط والأحكام
                  </Link>{" "}
                  و{" "}
                  <Link href="/privacy" className="text-orange-500 hover:underline">
                    سياسة الخصوصية
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              تحتاج مساعدة؟{" "}
              <Link href="/help" className="text-orange-500 hover:underline">
                تواصل معنا
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
