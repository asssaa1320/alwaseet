"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">حدث خطأ</h1>
        <p className="text-gray-600 mb-6">نعتذر، حدث خطأ أثناء تحميل الصفحة</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} className="bg-orange-500 hover:bg-orange-600">
            إعادة المحاولة
          </Button>
          <Link href="/">
            <Button variant="outline">العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
