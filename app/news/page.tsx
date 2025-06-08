"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Eye, User } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"

interface NewsItem {
  id: string
  title: string
  content: string
  imageUrl?: string
  createdAt: Date
  isActive: boolean
  views: number
  author: string
}

async function getNews(): Promise<NewsItem[]> {
  // Replace with your actual data fetching logic
  // This is just a placeholder
  return [
    {
      id: "news-1",
      title: "تحديث جديد على منصة الوسيط - ميزات محسنة للأمان",
      content:
        "أعلنت منصة الوسيط عن إطلاق تحديث جديد يتضمن ميزات أمان محسنة وواجهة مستخدم أكثر سهولة. التحديث يشمل نظام توثيق ثنائي العامل وحماية متقدمة ضد الاحتيال.",
      imageUrl: "/placeholder.svg?height=200&width=400",
      createdAt: new Date("2024-01-15"),
      isActive: true,
      views: 245,
      author: "فريق الوسيط",
    },
    {
      id: "news-2",
      title: "نصائح مهمة لحماية حسابك عند البيع والشراء",
      content:
        "مع تزايد عمليات البيع والشراء على المنصة، نقدم لكم أهم النصائح لحماية حساباتكم وتجنب عمليات الاحتيال. تعرف على العلامات التحذيرية وطرق التحقق من صحة الحسابات.",
      imageUrl: "/placeholder.svg?height=200&width=400",
      createdAt: new Date("2024-01-12"),
      isActive: true,
      views: 189,
      author: "قسم الأمان",
    },
    {
      id: "news-3",
      title: "إحصائيات المنصة لشهر يناير 2024",
      content:
        "شهدت منصة الوسيط نمواً ملحوظاً خلال شهر يناير بزيادة 40% في عدد الإعلانات المنشورة و 60% في عدد المستخدمين الجدد. كما تم إتمام أكثر من 500 عملية بيع ناجحة.",
      imageUrl: "/placeholder.svg?height=200&width=400",
      createdAt: new Date("2024-01-10"),
      isActive: true,
      views: 156,
      author: "قسم الإحصائيات",
    },
    {
      id: "news-4",
      title: "قواعد جديدة لضمان جودة الإعلانات",
      content:
        "تم تطبيق قواعد جديدة لضمان جودة الإعلانات المنشورة على المنصة. هذه القواعد تهدف إلى تحسين تجربة المستخدمين وضمان مصداقية المحتوى المعروض.",
      imageUrl: "/placeholder.svg?height=200&width=400",
      createdAt: new Date("2024-01-08"),
      isActive: true,
      views: 134,
      author: "إدارة المحتوى",
    },
  ]
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      setLoading(true)
      const newsData = await getNews()
      setNews(newsData)
    } catch (error) {
      console.error("Error loading news:", error)
      // Show error message instead of demo data
      setNews([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />

      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الأخبار والتحديثات</h1>
            <p className="text-gray-600">آخر الأخبار والتحديثات من منصة الوسيط</p>
          </div>
        </div>
      </section>

      {/* News Content */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          {loading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="simple-card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📰</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">لا توجد أخبار متاحة</h3>
              <p className="text-gray-500">سيتم نشر الأخبار والتحديثات هنا قريباً</p>
            </div>
          ) : (
            <div className="space-y-6">
              {news.map((item) => (
                <Card key={item.id} className="simple-card hover:shadow-md transition-shadow fade-in">
                  {item.imageUrl && (
                    <div className="h-48 bg-gray-100 overflow-hidden rounded-t-lg">
                      <img
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                        أخبار
                      </Badge>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{item.views} مشاهدة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{item.author}</span>
                        </div>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h2>

                    <p className="text-gray-700 leading-relaxed mb-4">{item.content}</p>

                    <div className="flex items-center justify-between">
                      <Link
                        href={`/news/${item.id}`}
                        className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                      >
                        اقرأ المزيد ←
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
