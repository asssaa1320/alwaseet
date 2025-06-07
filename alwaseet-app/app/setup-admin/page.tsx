"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addAdmin, checkAdminStatus } from "@/lib/admin-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function SetupAdminPage() {
  const [email, setEmail] = useState("asssaa1320@gmail.com")
  const [name, setName] = useState("مسؤول")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [checkResult, setCheckResult] = useState<{ success: boolean; isAdmin?: boolean; message: string } | null>(null)

  const handleAddAdmin = async () => {
    if (!email) return

    setLoading(true)
    try {
      const response = await addAdmin(email, name)
      setResult(response)
    } catch (error) {
      setResult({ success: false, message: "حدث خطأ غير متوقع" })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckAdmin = async () => {
    if (!email) return

    setLoading(true)
    try {
      const response = await checkAdminStatus(email)
      setCheckResult(response)
    } catch (error) {
      setCheckResult({ success: false, message: "حدث خطأ غير متوقع" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="shadow-lg border-0 rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl">
            <CardTitle className="text-2xl font-bold text-center">إعداد المسؤول</CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني للمسؤول</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">اسم المسؤول</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="مسؤول" />
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddAdmin}
                  disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {loading ? "جاري التنفيذ..." : "إضافة كمسؤول"}
                </Button>

                <Button onClick={handleCheckAdmin} disabled={loading} variant="outline" className="flex-1">
                  التحقق من الصلاحيات
                </Button>
              </div>
            </div>

            {result && (
              <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                  {result.message}
                </AlertDescription>
              </Alert>
            )}

            {checkResult && (
              <Alert className={checkResult.success ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"}>
                {checkResult.success ? (
                  checkResult.isAdmin ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <AlertDescription
                  className={
                    checkResult.success ? (checkResult.isAdmin ? "text-green-800" : "text-yellow-800") : "text-red-800"
                  }
                >
                  {checkResult.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
