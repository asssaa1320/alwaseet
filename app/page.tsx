import { getAds } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Clock, Phone } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function HomePage() {
  const ads = await getAds()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">مرحباً بك في الوسيط</h1>
        <p className="text-xl text-gray-600 mb-8">منصة موثوقة لبيع وشراء حسابات الألعاب والتطبيقات</p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/create-ad">نشر إعلان</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/hand-to-hand">طلبات يد بيد</Link>
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">أحدث الإعلانات</h2>
        {ads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد إعلانات متاحة حالياً</p>
            <Button asChild className="mt-4">
              <Link href="/create-ad">كن أول من ينشر إعلان</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <Card key={ad.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{ad.title}</CardTitle>
                    {ad.isVerified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        موثق
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline">{ad.accountType}</Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  {ad.imageUrl && (
                    <div className="relative h-48 w-full rounded-lg overflow-hidden">
                      <Image src={ad.imageUrl || "/placeholder.svg"} alt={ad.title} fill className="object-cover" />
                    </div>
                  )}

                  <p className="text-gray-600 line-clamp-3">{ad.description}</p>

                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-green-600">
                      {ad.price} {ad.currency}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {ad.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {ad.duration} يوم
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/ad/${ad.id}`}>عرض التفاصيل</Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`tel:${ad.phoneNumber}`}>
                        <Phone className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="text-sm text-gray-500 border-t pt-3">
                    <p>المعلن: {ad.userName}</p>
                    <p>تاريخ النشر: {ad.createdAt.toLocaleDateString("ar-SA")}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
