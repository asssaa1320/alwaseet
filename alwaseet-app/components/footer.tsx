import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">منصة الوسيط</h3>
            <p className="text-gray-600 text-sm mb-4">منصة آمنة لبيع وشراء الحسابات</p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-orange-500">
                    الشروط والأحكام
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-orange-500">
                    سياسة الخصوصية
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-gray-600 hover:text-orange-500">
                    المساعدة
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">الخدمات</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/hand-to-hand" className="text-gray-600 hover:text-orange-500">
                    يد بيد
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="text-gray-600 hover:text-orange-500">
                    الأخبار
                  </Link>
                </li>
                <li>
                  <Link href="/premium" className="text-gray-600 hover:text-orange-500">
                    العضوية المميزة
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} منصة الوسيط. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
