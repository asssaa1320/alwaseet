"use client"

import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Shield, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DebugUserPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const adminEmails = ["admin@alwaseet.com", "asssaa1320@gmail.com"]
  const isAdmin = user?.email && adminEmails.includes(user.email)

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-2xl">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <User className="w-6 h-6" />
              معلومات المستخدم
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {!user ? (
              <div className="text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">لم يتم تسجيل الدخول</h3>
                <Link href="/login">
                  <Button className="bg-orange-500 hover:bg-orange-600">تسجيل الدخول</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">حالة المستخدم</h3>
                  <Badge className={isAdmin ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    <Shield className="w-4 h-4 ml-1" />
                    {isAdmin ? "مسؤول" : "مستخدم عادي"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">الاسم</span>
                    </div>
                    <p className="text-gray-800">{user.displayName || "غير محدد"}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">البريد الإلكتروني</span>
                    </div>
                    <p className="text-gray-800 font-mono">{user.email}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">تاريخ التسجيل</span>
                    </div>
                    <p className="text-gray-800">
                      {user.metadata.creationTime
                        ? new Date(user.metadata.creationTime).toLocaleDateString("ar-SA")
                        : "غير متاح"}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-700">صلاحيات المسؤول</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-800">
                        <strong>الحالة:</strong> {isAdmin ? "✅ مسؤول" : "❌ مستخدم عادي"}
                      </p>
                      <p className="text-gray-600 text-sm">
                        البريد الإلكتروني موجود في قائمة المسؤولين:{" "}
                        {adminEmails.includes(user.email || "") ? "نعم" : "لا"}
                      </p>
                      <div className="text-xs text-gray-500">
                        <p>قائمة المسؤولين المسموح لهم:</p>
                        <ul className="list-disc list-inside mt-1">
                          {adminEmails.map((email) => (
                            <li key={email} className={user.email === email ? "text-green-600 font-medium" : ""}>
                              {email} {user.email === email && "(أنت)"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full">
                      العودة للرئيسية
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="flex-1">
                      <Button className="w-full bg-orange-500 hover:bg-orange-600">لوحة التحكم</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
