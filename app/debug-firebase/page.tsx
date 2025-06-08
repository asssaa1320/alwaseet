"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Shield, Settings } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { debugFirebaseConnection, testFirebaseRules } from "@/lib/firebase-debug"

export default function DebugFirebasePage() {
  const [debugResults, setDebugResults] = useState<any>(null)
  const [ruleTests, setRuleTests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const results = await debugFirebaseConnection()
      const tests = await testFirebaseRules()

      setDebugResults(results)
      setRuleTests(tests)
    } catch (error) {
      console.error("Error running diagnostics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تشخيص Firebase</h1>
          <p className="text-gray-600">فحص شامل لحالة قاعدة البيانات والصلاحيات</p>
        </div>

        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                حالة الاتصال
              </CardTitle>
            </CardHeader>
            <CardContent>
              {debugResults ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {debugResults.connection ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span>اتصال Firebase: </span>
                    <Badge
                      className={debugResults.connection ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {debugResults.connection ? "متصل" : "غير متصل"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {debugResults.permissions ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span>صلاحيات القراءة: </span>
                    <Badge
                      className={debugResults.permissions ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {debugResults.permissions ? "مفعلة" : "محظورة"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    <span>عدد الإعلانات: </span>
                    <Badge className="bg-blue-100 text-blue-800">{debugResults.adsCount}</Badge>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري الفحص...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rule Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                اختبار قواعد الأمان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ruleTests.map((test, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {test.success ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="flex-1">{test.name}</span>
                    <Badge className={test.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {test.success ? "نجح" : "فشل"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {debugResults?.errors?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  الأخطاء المكتشفة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {debugResults.errors.map((error: string, index: number) => (
                    <Alert key={index} className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {debugResults?.suggestions?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Settings className="w-5 h-5" />
                  اقتراحات الإصلاح
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {debugResults.suggestions.map((suggestion: string, index: number) => (
                    <Alert key={index} className="border-blue-200 bg-blue-50">
                      <AlertDescription className="text-blue-700">{suggestion}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات الإصلاح</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button onClick={runDiagnostics} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                      جاري الفحص...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2" />
                      إعادة فحص
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
