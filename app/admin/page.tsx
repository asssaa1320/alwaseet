"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase-config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, FileText, Shield, Eye, Trash2, Search, Plus, Activity, BarChart3 } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import type { User, Ad, News, HandToHand } from "@/types"

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [news, setNews] = useState<News[]>([])
  const [handToHand, setHandToHand] = useState<HandToHand[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Search states
  const [userSearch, setUserSearch] = useState("")
  const [adSearch, setAdSearch] = useState("")

  // News form state
  const [newsForm, setNewsForm] = useState({
    title: "",
    content: "",
    imageUrl: "",
  })
  const [creatingNews, setCreatingNews] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      checkAdminAccess()
      loadData()
    }
  }, [user, loading])

  const checkAdminAccess = () => {
    const adminEmails = ["admin@alwaseet.com", "asssaa1320@gmail.com"]
    if (!adminEmails.includes(user?.email || "")) {
      router.push("/")
      return
    }
  }

  const loadData = async () => {
    try {
      setLoadingData(true)

      // Load users
      const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"))
      const usersSnapshot = await getDocs(usersQuery)
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        premiumExpiryDate: doc.data().premiumExpiryDate?.toDate() || null,
      })) as User[]
      setUsers(usersData)

      // Load ads
      const adsQuery = query(collection(db, "ads"), orderBy("createdAt", "desc"))
      const adsSnapshot = await getDocs(adsQuery)
      const adsData = adsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        expiryDate: doc.data().expiryDate?.toDate() || new Date(),
      })) as Ad[]
      setAds(adsData)

      // Load news
      const newsQuery = query(collection(db, "news"), orderBy("createdAt", "desc"))
      const newsSnapshot = await getDocs(newsQuery)
      const newsData = newsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as News[]
      setNews(newsData)

      // Load hand to hand requests
      const handToHandQuery = query(collection(db, "handToHand"), orderBy("createdAt", "desc"))
      const handToHandSnapshot = await getDocs(handToHandQuery)
      const handToHandData = handToHandSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as HandToHand[]
      setHandToHand(handToHandData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  // User management functions
  const handleUserVerification = async (userId: string, isVerified: boolean) => {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        isVerified,
        ...(isVerified && { verifiedAt: Timestamp.now() }),
      })

      setUsers(users.map((u) => (u.id === userId ? { ...u, isVerified } : u)))
    } catch (error) {
      console.error("Error updating user verification:", error)
      alert("حدث خطأ أثناء تحديث حالة التوثيق")
    }
  }

  const handleUserPremium = async (userId: string, isPremium: boolean) => {
    try {
      const userRef = doc(db, "users", userId)
      const premiumExpiryDate = isPremium
        ? Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30 days
        : null

      await updateDoc(userRef, {
        isPremium,
        premiumExpiryDate,
      })

      setUsers(
        users.map((u) =>
          u.id === userId
            ? {
                ...u,
                isPremium,
                premiumExpiryDate: premiumExpiryDate?.toDate() || null,
              }
            : u,
        ),
      )
    } catch (error) {
      console.error("Error updating user premium status:", error)
      alert("حدث خطأ أثناء تحديث حالة البريميوم")
    }
  }

  // Ad management functions
  const handleAdVerification = async (adId: string, isVerified: boolean) => {
    try {
      const adRef = doc(db, "ads", adId)
      await updateDoc(adRef, { isVerified })

      setAds(ads.map((a) => (a.id === adId ? { ...a, isVerified } : a)))
    } catch (error) {
      console.error("Error updating ad verification:", error)
      alert("حدث خطأ أثناء تحديث حالة توثيق الإعلان")
    }
  }

  const handleAdStatusChange = async (adId: string, isActive: boolean) => {
    try {
      const adRef = doc(db, "ads", adId)
      await updateDoc(adRef, { isActive })

      setAds(ads.map((a) => (a.id === adId ? { ...a, isActive } : a)))
    } catch (error) {
      console.error("Error updating ad status:", error)
      alert("حدث خطأ أثناء تحديث حالة الإعلان")
    }
  }

  const handleDeleteAd = async (adId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return

    try {
      await deleteDoc(doc(db, "ads", adId))
      setAds(ads.filter((a) => a.id !== adId))
    } catch (error) {
      console.error("Error deleting ad:", error)
      alert("حدث خطأ أثناء حذف الإعلان")
    }
  }

  // News management functions
  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsForm.title.trim() || !newsForm.content.trim()) {
      alert("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    try {
      setCreatingNews(true)

      const newsData = {
        title: newsForm.title.trim(),
        content: newsForm.content.trim(),
        imageUrl: newsForm.imageUrl.trim() || "",
        author: user?.name || "الإدارة",
        isActive: true,
        views: 0,
        createdAt: Timestamp.now(),
      }

      const docRef = await collection(db, "news").add(newsData)

      const newNews = {
        id: docRef.id,
        ...newsData,
        createdAt: new Date(),
      } as News

      setNews([newNews, ...news])
      setNewsForm({ title: "", content: "", imageUrl: "" })
      alert("تم إنشاء الخبر بنجاح!")
    } catch (error) {
      console.error("Error creating news:", error)
      alert("حدث خطأ أثناء إنشاء الخبر")
    } finally {
      setCreatingNews(false)
    }
  }

  const handleDeleteNews = async (newsId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return

    try {
      await deleteDoc(doc(db, "news", newsId))
      setNews(news.filter((n) => n.id !== newsId))
    } catch (error) {
      console.error("Error deleting news:", error)
      alert("حدث خطأ أثناء حذف الخبر")
    }
  }

  const handleNewsStatusChange = async (newsId: string, isActive: boolean) => {
    try {
      const newsRef = doc(db, "news", newsId)
      await updateDoc(newsRef, { isActive })

      setNews(news.map((n) => (n.id === newsId ? { ...n, isActive } : n)))
    } catch (error) {
      console.error("Error updating news status:", error)
      alert("حدث خطأ أثناء تحديث حالة الخبر")
    }
  }

  // Delete hand to hand request
  const handleDeleteHandToHand = async (requestId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return

    try {
      await deleteDoc(doc(db, "handToHand", requestId))
      setHandToHand(handToHand.filter((h) => h.id !== requestId))
    } catch (error) {
      console.error("Error deleting hand to hand request:", error)
      alert("حدث خطأ أثناء حذف الطلب")
    }
  }

  // Filter functions
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()),
  )

  const filteredAds = ads.filter(
    (ad) =>
      ad.title.toLowerCase().includes(adSearch.toLowerCase()) ||
      ad.accountType.toLowerCase().includes(adSearch.toLowerCase()) ||
      ad.userName.toLowerCase().includes(adSearch.toLowerCase()),
  )

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">يجب تسجيل الدخول أولاً</p>
        </div>
      </div>
    )
  }

  const adminEmails = ["admin@alwaseet.com", "asssaa1320@gmail.com"]
  if (!adminEmails.includes(user.email || "")) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-16">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-gray-900 mb-4">غير مصرح لك بالوصول</h2>
              <p className="text-gray-600 mb-6">هذه الصفحة مخصصة للمديرين فقط</p>
              <Button onClick={() => router.push("/")} className="w-full">
                العودة للرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    verifiedUsers: users.filter((u) => u.isVerified).length,
    premiumUsers: users.filter((u) => u.isPremium).length,
    totalAds: ads.length,
    activeAds: ads.filter((a) => a.isActive).length,
    verifiedAds: ads.filter((a) => a.isVerified).length,
    totalNews: news.length,
    activeNews: news.filter((n) => n.isActive).length,
    totalHandToHand: handToHand.length,
    totalViews: ads.reduce((sum, ad) => sum + (ad.views || 0), 0),
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />

      {/* Admin Header */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم الإدارة</h1>
              <p className="text-gray-600">إدارة شاملة للمستخدمين والإعلانات</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800">
                <Shield className="w-4 h-4 ml-1" />
                مدير
              </Badge>
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                <Activity className="w-4 h-4 ml-1" />
                متصل
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.verifiedUsers} موثق • {stats.premiumUsers} بريميوم
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإعلانات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAds}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeAds} نشط • {stats.verifiedAds} موثق
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الأخبار</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNews}</div>
              <p className="text-xs text-muted-foreground">{stats.activeNews} نشط</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المشاهدات</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.totalHandToHand} طلب يد بيد</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
            <TabsTrigger value="ads">الإعلانات</TabsTrigger>
            <TabsTrigger value="news">الأخبار</TabsTrigger>
            <TabsTrigger value="handtohand">يد بيد</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>إدارة المستخدمين ({filteredUsers.length})</CardTitle>
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="البحث في المستخدمين..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>البريد الإلكتروني</TableHead>
                        <TableHead>عدد الإعلانات</TableHead>
                        <TableHead>موثق</TableHead>
                        <TableHead>بريميوم</TableHead>
                        <TableHead>تاريخ التسجيل</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.adsCount || 0}</TableCell>
                          <TableCell>
                            <Switch
                              checked={user.isVerified}
                              onCheckedChange={(checked) => handleUserVerification(user.id, checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={user.isPremium}
                              onCheckedChange={(checked) => handleUserPremium(user.id, checked)}
                            />
                          </TableCell>
                          <TableCell>{user.createdAt.toLocaleDateString("ar-SA")}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Badge variant={user.isVerified ? "default" : "secondary"}>
                                {user.isVerified ? "موثق" : "غير موثق"}
                              </Badge>
                              {user.isPremium && <Badge className="bg-yellow-100 text-yellow-800">بريميوم</Badge>}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ads Management */}
          <TabsContent value="ads">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>إدارة الإعلانات ({filteredAds.length})</CardTitle>
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <Input
                      placeholder="البحث في الإعلانات..."
                      value={adSearch}
                      onChange={(e) => setAdSearch(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>العنوان</TableHead>
                        <TableHead>المعلن</TableHead>
                        <TableHead>نوع الحساب</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>المشاهدات</TableHead>
                        <TableHead>نشط</TableHead>
                        <TableHead>موثق</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAds.map((ad) => (
                        <TableRow key={ad.id}>
                          <TableCell className="font-medium">{ad.title}</TableCell>
                          <TableCell>{ad.userName}</TableCell>
                          <TableCell>{ad.accountType}</TableCell>
                          <TableCell>
                            {ad.price} {ad.currency}
                          </TableCell>
                          <TableCell>{ad.views || 0}</TableCell>
                          <TableCell>
                            <Switch
                              checked={ad.isActive}
                              onCheckedChange={(checked) => handleAdStatusChange(ad.id, checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={ad.isVerified}
                              onCheckedChange={(checked) => handleAdVerification(ad.id, checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="text-blue-600">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handleDeleteAd(ad.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Management */}
          <TabsContent value="news">
            <div className="space-y-6">
              {/* Create News Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    إضافة خبر جديد
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateNews} className="space-y-4">
                    <div>
                      <Label htmlFor="title">عنوان الخبر *</Label>
                      <Input
                        id="title"
                        value={newsForm.title}
                        onChange={(e) => setNewsForm((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="اكتب عنوان الخبر..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="content">محتوى الخبر *</Label>
                      <Textarea
                        id="content"
                        value={newsForm.content}
                        onChange={(e) => setNewsForm((prev) => ({ ...prev, content: e.target.value }))}
                        placeholder="اكتب محتوى الخبر..."
                        rows={4}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="imageUrl">رابط الصورة (اختياري)</Label>
                      <Input
                        id="imageUrl"
                        value={newsForm.imageUrl}
                        onChange={(e) => setNewsForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <Button type="submit" disabled={creatingNews}>
                      {creatingNews ? "جاري الإنشاء..." : "نشر الخبر"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* News List */}
              <Card>
                <CardHeader>
                  <CardTitle>إدارة الأخبار ({news.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>العنوان</TableHead>
                          <TableHead>الكاتب</TableHead>
                          <TableHead>المشاهدات</TableHead>
                          <TableHead>نشط</TableHead>
                          <TableHead>تاريخ النشر</TableHead>
                          <TableHead>الإجراءات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {news.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.title}</TableCell>
                            <TableCell>{item.author}</TableCell>
                            <TableCell>{item.views || 0}</TableCell>
                            <TableCell>
                              <Switch
                                checked={item.isActive}
                                onCheckedChange={(checked) => handleNewsStatusChange(item.id, checked)}
                              />
                            </TableCell>
                            <TableCell>{item.createdAt.toLocaleDateString("ar-SA")}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handleDeleteNews(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Hand to Hand Management */}
          <TabsContent value="handtohand">
            <Card>
              <CardHeader>
                <CardTitle>إدارة طلبات يد بيد ({handToHand.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>النوع</TableHead>
                        <TableHead>نوع الحساب</TableHead>
                        <TableHead>المستخدم</TableHead>
                        <TableHead>السعر</TableHead>
                        <TableHead>رقم الهاتف</TableHead>
                        <TableHead>تاريخ الإنشاء</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {handToHand.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <Badge variant={request.type === "buyer" ? "default" : "secondary"}>
                              {request.type === "buyer" ? "مشتري" : "بائع"}
                            </Badge>
                          </TableCell>
                          <TableCell>{request.accountType || "-"}</TableCell>
                          <TableCell>{request.userName}</TableCell>
                          <TableCell>
                            {request.price ? `${request.price}` : "-"}
                            {request.maxPrice && ` - ${request.maxPrice}`}
                          </TableCell>
                          <TableCell>{request.phoneNumber}</TableCell>
                          <TableCell>{request.createdAt.toLocaleDateString("ar-SA")}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => handleDeleteHandToHand(request.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
