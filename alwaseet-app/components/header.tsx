"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, Settings, Menu, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function Header() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleNavigation = (path: string) => {
    setMobileMenuOpen(false)
    router.push(path)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">و</span>
            </div>
            <span className="text-xl font-bold text-gray-900">الوسيط</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`font-medium transition-colors ${
                isActive("/") ? "text-orange-500" : "text-gray-700 hover:text-orange-500"
              }`}
            >
              الرئيسية
            </Link>
            <Link
              href="/hand-to-hand"
              className={`font-medium transition-colors ${
                isActive("/hand-to-hand") ? "text-orange-500" : "text-gray-700 hover:text-orange-500"
              }`}
            >
              يد بيد
            </Link>
            <Link
              href="/news"
              className={`font-medium transition-colors ${
                isActive("/news") ? "text-orange-500" : "text-gray-700 hover:text-orange-500"
              }`}
            >
              الأخبار
            </Link>
            {(user?.email === "admin@alwaseet.com" || user?.email === "asssaa1320@gmail.com") && (
              <Link
                href="/admin"
                className={`font-medium transition-colors flex items-center gap-1 ${
                  isActive("/admin") ? "text-orange-500" : "text-gray-700 hover:text-orange-500"
                }`}
              >
                <Settings className="w-4 h-4" />
                الإدارة
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/create-ad">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                    إنشاء إعلان
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="border-gray-300 hidden sm:flex">
                    <User className="w-4 h-4 ml-1" />
                    حسابي
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/login">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  تسجيل الدخول
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              <button
                onClick={() => handleNavigation("/")}
                className={`text-right font-medium transition-colors ${
                  isActive("/") ? "text-orange-500" : "text-gray-700 hover:text-orange-500"
                }`}
              >
                الرئيسية
              </button>
              <button
                onClick={() => handleNavigation("/hand-to-hand")}
                className={`text-right font-medium transition-colors ${
                  isActive("/hand-to-hand") ? "text-orange-500" : "text-gray-700 hover:text-orange-500"
                }`}
              >
                يد بيد
              </button>
              <button
                onClick={() => handleNavigation("/news")}
                className={`text-right font-medium transition-colors ${
                  isActive("/news") ? "text-orange-500" : "text-gray-700 hover:text-orange-500"
                }`}
              >
                الأخبار
              </button>
              {(user?.email === "admin@alwaseet.com" || user?.email === "asssaa1320@gmail.com") && (
                <button
                  onClick={() => handleNavigation("/admin")}
                  className={`text-right font-medium transition-colors flex items-center gap-1 ${
                    isActive("/admin") ? "text-orange-500" : "text-gray-700 hover:text-orange-500"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  الإدارة
                </button>
              )}
              {user && (
                <button
                  onClick={() => handleNavigation("/profile")}
                  className={`text-right font-medium transition-colors flex items-center gap-1 sm:hidden ${
                    isActive("/profile") ? "text-orange-500" : "text-gray-700 hover:text-orange-500"
                  }`}
                >
                  <User className="w-4 h-4" />
                  حسابي
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
