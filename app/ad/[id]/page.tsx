"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, MessageCircle, Clock, Share2, Flag, Shield, Star, ArrowRight, Phone } from "lucide-react"
import { getAdById, incrementAdViews } from "@/lib/firebase"
import type { Ad } from "@/types"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

// بيانات تجريبية للاختبار
const DEMO_ADS: Ad[] = [
  {
    id: "demo-1",
    title: "حساب تيك توك 100k متابع",
    description:
      "حساب تيك توك نشط بـ 100 ألف متابع حقيقي، محتوى متنوع وتفاعل عالي. الحساب موثق ولا يوجد عليه أي مخالفات.",
    accountType: "تيك توك",
    price: 1500,
    currency: "ج.م",
    duration: 24,
    phoneNumber: "+20 1234567890",
    imageUrl: "/placeholder.svg?height=400&width=600",
    userId: "demo-user-1",
    userEmail: "demo@example.com",
    userName: "أحمد محمد",
    createdAt: new Date("2024-01-15"),
    expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    views: 245,
    isActive: true,
    isPremium: true,
    isVerified: true,
  },
  {
    id: "demo-2",
    title: "حساب يوتيوب 50k مشترك",
    description: "قناة يوتيوب متخصصة في الألعاب مع 50 ألف مشترك حقيقي. محتوى عالي الجودة ومشاهدات ممتازة.",
    accountType: "يوتيوب",
    price: 2500,
    currency: "ج.م",
    duration: 24,
    phoneNumber: "+20 1987654321",
    imageUrl: "/placeholder.svg?height=400&width=600",
    userId: "demo-user-2",
    userEmail: "demo2@example.com",
    userName: "سارة أحمد",
    createdAt: new Date("2024-01-14"),
    expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
    views: 189,
    isActive: true,
    isPremium: false,
    isVerified: true,
  },
  {
    id: "demo-3",
    title: "حساب انستجرام 25k متابع",
    description: "حساب انستجرام للموضة والأزياء مع 25 ألف متابع. تفاعل عالي وجمهور مستهدف.",
    accountType: "انستجرام",
    price: 800,
    currency: "ج.م",
    duration: 12,
    phoneNumber: "+20 1122334455",
    imageUrl: "/placeholder.svg?height=400&width=600",
    userId: "demo-user-3",
    userEmail: "demo3@example.com",
    userName: "مريم علي",
    createdAt: new Date("2024-01-13"),
    expiryDate: new Date(Date.now() + 6 * 60 * 60 * 1000),
    views: 156,
    isActive: true,
    isPremium: false,
    isVerified: false,
  },
]

export default function AdDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [ad, setAd] = useState<Ad | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewIncremented, setViewIncremented] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      loadAd(params.id as string)
    }
  }, [params.id])

  const loadAd = async (adId: string) => {
    try {
      setLoading(true)
      setError(null)

      // محاولة تحميل الإعلان من Firebase أولاً
      try {
        const adData = await getAdById(adId)
        setAd(adData)

        // زيادة عدد المشاهدات إذا لم يتم زيادتها من قبل
        // هذا لا يجب أن يؤثر على تحميل الإعلان إذا فشل
        if (!viewIncremented && adData.userId !== user?.uid) {
          incrementAdViews(adId).catch(() => {
            // تجاهل أخطاء تحديث المشاهدات
            console.log("Views increment failed, but continuing normally")
          })
          setViewIncremented(true)
        }
      } catch (firebaseError) {
        console.log("Firebase error, trying demo data:", firebaseError)
        throw firebaseError // إعادة رمي الخطأ للتعامل معه في الخارج
      }
    } catch (error) {
      console.error("Error loading ad:", error)
      setError("الإعلان غير موجود أو تم حذفه")
      setAd(null)
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppContact = () => {
    if (!ad) return

    const message = encodeURIComponent(`مرحباً، أنا مهتم بإعلانك: ${ad.title}\n\nرابط الإعلان: ${window.location.href}`)
    const whatsappUrl = `https://wa.me/${ad.phoneNumber.replace(/[^0-9]/g, "")}?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad?.title,
          text: ad?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("تم نسخ رابط الإعلان")
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return `${price} ج.م`
  }

  const getTimeRemaining = (expiryDate: Date) => {
    const now = new Date()
    const diff = expiryDate.getTime() - now.getTime()

    if (diff <= 0) return "منتهي الصلاحية"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days} يوم و ${hours} ساعة متبقية`
    if (hours > 0) return `${hours} ساعة و ${minutes} دقيقة متبقية`
    return `${minutes} دقيقة متبقية`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-96 bg-gray-200"></div>
              <div className="p-8 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">404 - الإعلان غير موجود</h1>
          <p className="text-gray-600 mb-6">الإعلان الذي تبحث عنه غير موجود أو تم حذفه</p>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600">العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isExpired = new Date(ad.expiryDate) <= new Date()

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-orange-500 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <span className="text-gray-800">{ad.title}</span>
        </div>

        {/* Demo Mode Notice */}
        {ad.id.startsWith("demo-") && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-blue-800">وضع العرض التوضيحي</p>
                <p className="text-blue-600 text-sm">
                  هذا إعلان تجريبي للعرض فقط. لرؤية الإعلانات الحقيقية، يرجى إعداد Firebase.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
              {/* Image */}
              {ad.imageUrl && (
                <div className="relative h-96 bg-gray-100">
                  <img src={ad.imageUrl || "/placeholder.svg"} alt={ad.title} className="w-full h-full object-cover" />
                  {ad.isPremium && (
                    <Badge className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1">
                      <Star className="w-4 h-4 ml-1" />
                      مميز
                    </Badge>
                  )}
                  {isExpired && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Badge className="bg-red-500 text-white px-4 py-2 text-lg">منتهي الصلاحية</Badge>
                    </div>
                  )}
                </div>
              )}

              <CardContent className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        {ad.accountType}
                      </Badge>
                      {ad.isVerified && (
                        <div className="flex items-center gap-1 text-green-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                          >
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                            <path d="m9 12 2 2 4-4"></path>
                          </svg>
                          <span className="text-sm font-medium">موثق</span>
                        </div>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{ad.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{ad.views} مشاهدة</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(ad.createdAt).toLocaleDateString("ar-SA")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleShare} className="rounded-lg">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50 rounded-lg"
                    >
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">وصف الإعلان</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{ad.description}</p>
                </div>

                {/* Details */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">تفاصيل الإعلان</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">نوع الحساب:</span>
                      <span className="font-medium text-gray-800 mr-2">{ad.accountType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">السعر:</span>
                      <span className="font-bold text-orange-500 mr-2">{formatPrice(ad.price, ad.currency)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">تاريخ النشر:</span>
                      <span className="font-medium text-gray-800 mr-2">
                        {new Date(ad.createdAt).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">ينتهي في:</span>
                      <span className={`font-medium mr-2 ${isExpired ? "text-red-500" : "text-green-600"}`}>
                        {getTimeRemaining(new Date(ad.expiryDate))}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-orange-500 mb-2">{formatPrice(ad.price, ad.currency)}</div>
                  <p className="text-gray-600">السعر المطلوب</p>
                </div>

                {!isExpired ? (
                  <div className="space-y-4">
                    <Button
                      onClick={handleWhatsAppContact}
                      className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-all duration-200"
                    >
                      <MessageCircle className="w-5 h-5 ml-2" />
                      تواصل عبر واتساب
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>رقم التواصل: {ad.phoneNumber}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-red-500 font-medium mb-2">انتهت صلاحية هذا الإعلان</p>
                    <p className="text-gray-600 text-sm">لا يمكن التواصل مع المعلن</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card className="shadow-lg border-0 rounded-2xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات المعلن</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{ad.userName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{ad.userName}</p>
                    <div className="flex items-center gap-2">
                      {ad.isVerified && (
                        <div className="flex items-center gap-1 text-green-500 text-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-3 h-3"
                          >
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                            <path d="m9 12 2 2 4-4"></path>
                          </svg>
                          <span>موثق</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-800 mb-1">نصائح للأمان</p>
                      <ul className="text-blue-600 space-y-1">
                        <li>• تأكد من صحة الحساب قبل الدفع</li>
                        <li>• استخدم طرق دفع آمنة</li>
                        <li>• لا تشارك معلوماتك الشخصية</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2 rounded-lg">
            <ArrowRight className="w-4 h-4" />
            العودة
          </Button>
        </div>
      </div>
    </div>
  )
}
