"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { testFirebaseConnection } from "@/lib/firebase-connection-test"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function TestFirebasePage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    try {
      const results = await testFirebaseConnection()
      setTestResults(results)
    } catch (error) {
      console.error("Error running tests:", error)
      setTestResults({
        error: error.message,
        firebaseInitialized: false,
        firestoreConnected: false,
        authInitialized: false,
        storageConnected: false,
        adsReadable: false,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? <CheckCircle className="w-6 h-6 text-green-500" /> : <XCircle className="w-6 h-6 text-red-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">اختبار اتصال Firebase</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>نتائج الاختبار</span>
              <Button
                variant="outline"
                size="sm"
                onClick={runTests}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                إعادة الاختبار
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mb-4" />
                <p>جاري اختبار الاتصال...</p>
              </div>
            ) : testResults ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>تهيئة Firebase</span>
                    <StatusIcon status={testResults.firebaseInitialized} />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>اتصال Firestore</span>
                    <StatusIcon status={testResults.firestoreConnected} />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>تهيئة Authentication</span>
                    <StatusIcon status={testResults.authInitialized} />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>اتصال Storage</span>
                    <StatusIcon status={testResults.storageConnected} />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg md:col-span-2">
                    <span>قراءة الإعلانات</span>
                    <StatusIcon status={testResults.adsReadable} />
                  </div>
                </div>

                {testResults.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>خطأ</AlertTitle>
                    <AlertDescription>{testResults.error}</AlertDescription>
                  </Alert>
                )}

                {!testResults.adsReadable && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>مشكلة في قواعد الأمان</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        لا يمكن قراءة الإعلانات بسبب قواعد الأمان. قم بتشغيل السكريبت التالي لإصلاح المشكلة:
                      </p>
                      <div className="bg-gray-900 text-gray-100 p-2 rounded text-sm font-mono mb-2">
                        node scripts/setup-basic-rules.js
                      </div>
                      <p>أو قم بتعديل قواعد الأمان يدوياً للسماح بقراءة الإعلانات.</p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p>لا توجد نتائج</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>خطوات إصلاح مشاكل الاتصال</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-4">
              <li>
                <strong>تأكد من تكوين Firebase:</strong>
                <p className="text-gray-600 mr-6 mt-1">تحقق من وجود متغيرات البيئة الصحيحة في ملف .env.local</p>
              </li>

              <li>
                <strong>تحديث قواعد الأمان:</strong>
                <p className="text-gray-600 mr-6 mt-1">قم بتشغيل سكريبت إعداد قواعد الأمان الأساسية:</p>
                <div className="bg-gray-900 text-gray-100 p-2 rounded text-sm font-mono mr-6 mt-1">
                  node scripts/setup-basic-rules.js
                </div>
              </li>

              <li>
                <strong>تثبيت Firebase CLI:</strong>
                <p className="text-gray-600 mr-6 mt-1">إذا لم يكن مثبتاً بالفعل:</p>
                <div className="bg-gray-900 text-gray-100 p-2 rounded text-sm font-mono mr-6 mt-1">
                  npm install -g firebase-tools
                </div>
              </li>

              <li>
                <strong>تسجيل الدخول إلى Firebase:</strong>
                <div className="bg-gray-900 text-gray-100 p-2 rounded text-sm font-mono mr-6 mt-1">firebase login</div>
              </li>

              <li>
                <strong>ربط المشروع:</strong>
                <div className="bg-gray-900 text-gray-100 p-2 rounded text-sm font-mono mr-6 mt-1">
                  firebase use --add
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
