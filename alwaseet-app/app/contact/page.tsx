import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">تواصل معنا</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            نحن هنا للإجابة على استفساراتك ومساعدتك في أي وقت. يمكنك التواصل معنا من خلال النموذج أدناه أو عبر وسائل
            التواصل المتاحة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>أرسل رسالة</CardTitle>
              <CardDescription>املأ النموذج أدناه وسنرد عليك في أقرب وقت ممكن.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      الاسم
                    </label>
                    <Input id="name" placeholder="أدخل اسمك" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      البريد الإلكتروني
                    </label>
                    <Input id="email" type="email" placeholder="أدخل بريدك الإلكتروني" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    الموضوع
                  </label>
                  <Input id="subject" placeholder="أدخل موضوع الرسالة" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    الرسالة
                  </label>
                  <Textarea id="message" placeholder="اكتب رسالتك هنا" rows={5} />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button className="w-full md:w-auto bg-orange-500 hover:bg-orange-600">إرسال الرسالة</Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات التواصل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <Mail className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">البريد الإلكتروني</h3>
                    <p className="text-sm text-gray-600">
                      <Link href="mailto:support@alwaseet.com" className="hover:text-orange-500">
                        support@alwaseet.com
                      </Link>
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <Phone className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">رقم الهاتف</h3>
                    <p className="text-sm text-gray-600">
                      <Link href="tel:+201234567890" className="hover:text-orange-500">
                        +20 123 456 7890
                      </Link>
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium">العنوان</h3>
                    <p className="text-sm text-gray-600">القاهرة، مصر</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ساعات العمل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">الأحد - الخميس</span>
                    <span className="text-sm">9:00 ص - 5:00 م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">الجمعة</span>
                    <span className="text-sm">9:00 ص - 1:00 م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">السبت</span>
                    <span className="text-sm">مغلق</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
