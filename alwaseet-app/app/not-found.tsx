import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4" dir="rtl">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">الصفحة غير موجودة</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها أو حذفها.
        </p>
        <Button asChild>
          <Link href="/">العودة إلى الصفحة الرئيسية</Link>
        </Button>
      </div>
    </div>
  )
}
