"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { updateUserProfile, getUserProfile } from "@/lib/firebase"
import { User, Shield, Bell, Lock, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ProfileSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // بيانات المستخدم
  const [profile, setProfile] = useState({
    displayName: "",
    phoneNumber: "",
    notificationsEnabled: true,
    privacySettings: {
      showEmail: false,
      showPhone: true,
    },
    isVerified: false,
    isPremium: false,
    isBlocked: false,
  })

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
        setProfile({
          displayName: userData.name || user.displayName || "",
          phoneNumber: userData.phoneNumber || "",
          notificationsEnabled: userData.notificationsEnabled !== false,
          privacySettings: userData.privacySettings || {
            showEmail: false,
            showPhone: true,
          },
          isVerified: userData.isVerified || false,
          isPremium: userData.isPremium || false,
          isBlocked: userData.isBlocked || false,
        })
      } else {
        // إذا لم تكن هناك بيانات، استخدم البيانات من مصادقة Firebase
        setProfile({
          displayName: user.displayName || "",
          phoneNumber: "",
          notificationsEnabled: true,
          privacySettings: {
            showEmail: false,
            showPhone: true,
          },
          isVerified: false,
          isPremium: false,
          isBlocked: false,
        })
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
      setError("حدث خطأ أثناء تحميل بيانات المستخدم")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      await updateUserProfile(user.uid, {
        name: profile.displayName,
        phoneNumber: profile.phoneNumber,
        notificationsEnabled: profile.notificationsEnabled,
        privacySettings: profile.privacySettings,
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setError("حدث خطأ أثناء حفظ البيانات")
    } finally {
      setSaving(false)
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

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">إعدادات الحساب</h1>
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

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">تم حفظ التغييرات بنجاح</AlertDescription>
          </Alert>
        )}

        {/* حالة الحساب */}
        <Card className="mb-6 border-0 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              حالة الحساب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profile.isVerified ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 ml-1" />
                  حساب موثق
                </Badge>
              ) : (
                <Badge variant="outline" className="border-gray-300 text-gray-600">
                  غير موثق
                </Badge>
              )}

              {profile.isPremium ? (
                <Badge className="bg-yellow-100 text-yellow-800">
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
                    className="w-3 h-3 ml-1"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  عضوية مميزة
                </Badge>
              ) : (
                <Badge variant="outline" className="border-gray-300 text-gray-600">
                  عضوية عادية
                </Badge>
              )}

              {profile.isBlocked && (
                <Badge className="bg-red-100 text-red-800">
                  <AlertCircle className="w-3 h-3 ml-1" />
                  محظور
                </Badge>
              )}
            </div>

            {profile.isBlocked && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  تم حظر حسابك. يرجى التواصل مع الإدارة للمزيد من المعلومات.
                </AlertDescription>
              </Alert>
            )}

            {!profile.isVerified && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium mb-2">توثيق الحساب</p>
                <p className="text-blue-700 text-sm mb-3">
                  قم بتوثيق حسابك للحصول على شارة التوثيق وزيادة مصداقية إعلاناتك.
                </p>
                <Link href="/verification">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    طلب توثيق
                  </Button>
                </Link>
              </div>
            )}

            {!profile.isPremium && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium mb-2">ترقية للعضوية المميزة</p>
                <p className="text-yellow-700 text-sm mb-3">
                  احصل على مزايا إضافية مثل المزيد من الإعلانات وظهور مميز في نتائج البحث.
                </p>
                <Link href="/premium">
                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                    ترقية الحساب
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* المعلومات الشخصية */}
        <Card className="mb-6 border-0 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              المعلومات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">الاسم</Label>
              <Input
                id="displayName"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                placeholder="اسمك الكامل"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" value={user?.email || ""} disabled className="bg-gray-50" />
              <p className="text-sm text-gray-500">لا يمكن تغيير البريد الإلكتروني</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">رقم الهاتف</Label>
              <Input
                id="phoneNumber"
                value={profile.phoneNumber}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                placeholder="+20 1234567890"
              />
            </div>
          </CardContent>
        </Card>

        {/* إعدادات الخصوصية */}
        <Card className="mb-6 border-0 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              إعدادات الخصوصية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">إظهار البريد الإلكتروني</p>
                <p className="text-sm text-gray-500">السماح للآخرين برؤية بريدك الإلكتروني</p>
              </div>
              <Switch
                checked={profile.privacySettings.showEmail}
                onCheckedChange={(checked) =>
                  setProfile({
                    ...profile,
                    privacySettings: { ...profile.privacySettings, showEmail: checked },
                  })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">إظهار رقم الهاتف</p>
                <p className="text-sm text-gray-500">السماح للآخرين برؤية رقم هاتفك</p>
              </div>
              <Switch
                checked={profile.privacySettings.showPhone}
                onCheckedChange={(checked) =>
                  setProfile({
                    ...profile,
                    privacySettings: { ...profile.privacySettings, showPhone: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* إعدادات الإشعارات */}
        <Card className="mb-6 border-0 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              إعدادات الإشعارات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">تفعيل الإشعارات</p>
                <p className="text-sm text-gray-500">استلام إشعارات عن الرسائل والتحديثات</p>
              </div>
              <Switch
                checked={profile.notificationsEnabled}
                onCheckedChange={(checked) => setProfile({ ...profile, notificationsEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* أزرار الحفظ */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => router.push("/profile")}>
            إلغاء
          </Button>
          <Button onClick={handleSaveProfile} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </div>
    </div>
  )
}
