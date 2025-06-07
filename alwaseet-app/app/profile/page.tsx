"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Eye, Clock, Trash2, Star } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { getUserAds, deleteAd } from "@/lib/firebase"
import type { Ad } from "@/types"
import Link from "next/link"

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [userAds, setUserAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    loadUserAds()
  }, [user])

  const loadUserAds = async () => {
    if (!user) return

    try {
      setLoading(true)
      const ads = await getUserAds(user.uid)
      setUserAds(ads)
    } catch (error) {
      console.error("Error loading user ads:", error)
      // Set empty array to avoid errors
      setUserAds([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAd = async (adId: string) => {
    if (!user) return

    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return

    try {
      await deleteAd(adId, user.uid)
      setUserAds((prev) => prev.filter((ad) => ad.id !== adId))
      alert("تم حذف الإعلان بنجاح")
    } catch (error) {
      console.error("Error deleting ad:", error)
      alert("حدث خطأ أثناء حذف الإعلان")
    }
  }

  const handleSignOut = async () => {
    if (confirm("هل أنت متأكد من تسجيل الخروج؟")) {
      await signOut()
      router.push("/")
    }
  }

  // Update formatPrice function to use unified currency
  const formatPrice = (price: number, currency: string) => {
    return `${price} ج.م`
  }

  const getTimeRemaining = (expiryDate: Date) => {
    const now = new Date()
    const diff = expiryDate.getTime() - now.getTime()

    if (diff <= 0) return "منتهي الصلاحية"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    return hours > 0 ? `${hours} ساعة متبقية` : "أقل من ساعة"
  }

  const activeAds = userAds.filter((ad) => ad.isActive && new Date(ad.expiryDate) > new Date())
  const expiredAds = userAds.filter((ad) => !ad.isActive || new Date(ad.expiryDate) <= new Date())

  if (!user) {
    return <div>جاري التحميل...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || "م"}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{user.displayName || "مستخدم"}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/create-ad">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg">إنشاء إعلان جديد</Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">{userAds.length}</div>
              <p className="text-gray-600">إجمالي الإعلانات</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">{activeAds.length}</div>
              <p className="text-gray-600">إعلانات نشطة</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {userAds.reduce((sum, ad) => sum + (ad.views || 0), 0)}
              </div>
              <p className="text-gray-600">إجمالي المشاهدات</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-xl">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-500 mb-2">{2 - activeAds.length}</div>
              <p className="text-gray-600">إعلانات متاحة</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-xl shadow-sm">
            <TabsTrigger value="active" className="rounded-lg">
              الإعلانات النشطة ({activeAds.length})
            </TabsTrigger>
            <TabsTrigger value="expired" className="rounded-lg">
              الإعلانات المنتهية ({expiredAds.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* Active Ads */}
          <TabsContent value="active" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse border-0 shadow-lg rounded-xl">
                    <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : activeAds.length === 0 ? (
              <Card className="border-0 shadow-lg rounded-xl">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">📢</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد إعلانات نشطة</h3>
                  <p className="text-gray-500 mb-6">ابدأ بإنشاء إعلانك الأول لعرض منتجاتك</p>
                  <Link href="/create-ad">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg">
                      إنشاء إعلان جديد
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeAds.map((ad) => (
                  <Card
                    key={ad.id}
                    className="border-0 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {ad.imageUrl && (
                      <div className="h-48 bg-gray-100 relative">
                        <img
                          src={ad.imageUrl || "/placeholder.svg"}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                        {ad.isPremium && (
                          <Badge className="absolute top-3 right-3 bg-yellow-500 text-white">
                            <Star className="w-3 h-3 ml-1" />
                            مميز
                          </Badge>
                        )}
                      </div>
                    )}

                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                          {ad.accountType}
                        </Badge>
                        {ad.isVerified && (
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
                            className="w-4 h-4 text-green-500"
                          >
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                            <path d="m9 12 2 2 4-4"></path>
                          </svg>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{ad.title}</h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ad.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-orange-500">{formatPrice(ad.price, ad.currency)}</span>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Eye className="w-3 h-3" />
                          <span>{ad.views || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{getTimeRemaining(new Date(ad.expiryDate))}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/ad/${ad.id}`} className="flex-1">
                          <Button variant="outline" className="w-full rounded-lg">
                            عرض
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-200 hover:bg-red-50 rounded-lg"
                          onClick={() => handleDeleteAd(ad.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Expired Ads */}
          <TabsContent value="expired" className="space-y-6">
            {expiredAds.length === 0 ? (
              <Card className="border-0 shadow-lg rounded-xl">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">⏰</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد إعلانات منتهية الصلاحية</h3>
                  <p className="text-gray-500">جميع إعلاناتك لا تزال نشطة</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expiredAds.map((ad) => (
                  <Card key={ad.id} className="border-0 shadow-lg rounded-xl overflow-hidden opacity-75">
                    {ad.imageUrl && (
                      <div className="h-48 bg-gray-100 relative">
                        <img
                          src={ad.imageUrl || "/placeholder.svg"}
                          alt={ad.title}
                          className="w-full h-full object-cover grayscale"
                        />
                        <Badge className="absolute top-3 right-3 bg-red-500 text-white">منتهي</Badge>
                      </div>
                    )}

                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                          {ad.accountType}
                        </Badge>
                      </div>

                      <h3 className="font-semibold text-gray-600 mb-2 line-clamp-2">{ad.title}</h3>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-bold text-gray-500">{formatPrice(ad.price, ad.currency)}</span>
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Eye className="w-3 h-3" />
                          <span>{ad.views || 0}</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-500 border-red-200 hover:bg-red-50 rounded-lg"
                        onClick={() => handleDeleteAd(ad.id)}
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Info */}
              <Card className="border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    معلومات الحساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">الاسم</label>
                    <p className="text-gray-800">{user.displayName || "غير محدد"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                    <p className="text-gray-800">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">تاريخ التسجيل</label>
                    <p className="text-gray-800">
                      {user.metadata.creationTime
                        ? new Date(user.metadata.creationTime).toLocaleDateString("ar-SA")
                        : "غير متاح"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Premium */}
              <Card className="border-0 shadow-lg rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    العضوية المميزة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">اشترك في العضوية المميزة</h4>
                    <ul className="text-sm text-yellow-700 space-y-1 mb-4">
                      <li>• إعلانات أكثر (4-6 إعلانات)</li>
                      <li>• مدة أطول للإعلانات</li>
                      <li>• ظهور في المقدمة</li>
                      <li>• علامة التوثيق</li>
                    </ul>
                    <Link href="/premium">
                      <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg">
                        اشترك الآن
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
