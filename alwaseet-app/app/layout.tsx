import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { Toaster } from "@/components/ui/toaster"

// Fix the font configuration by properly specifying the subsets
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "الوسيط - منصة بيع وشراء الحسابات الآمنة",
  description: "منصة الوسيط الآمنة والموثوقة لبيع وشراء حسابات التواصل الاجتماعي والألعاب في مصر والوطن العربي",
  keywords: [
    "بيع حسابات",
    "شراء حسابات",
    "تيك توك",
    "يوتيوب",
    "فيسبوك",
    "انستجرام",
    "ببجي",
    "فري فاير",
    "الوسيط",
    "منصة آمنة",
    "حسابات موثقة",
    "مصر",
    "العربية",
  ],
  authors: [{ name: "فريق الوسيط", url: "https://alwaseet.com" }],
  creator: "الوسيط",
  publisher: "الوسيط",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  robots: "index, follow",

  // Open Graph metadata for social sharing
  openGraph: {
    title: "الوسيط - منصة بيع وشراء الحسابات الآمنة",
    description: "منصة الوسيط الآمنة والموثوقة لبيع وشراء حسابات التواصل الاجتماعي والألعاب",
    type: "website",
    locale: "ar_SA",
    url: "https://alwaseet.com",
    siteName: "الوسيط",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "الوسيط - منصة بيع وشراء الحسابات",
      },
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "الوسيط - منصة بيع وشراء الحسابات الآمنة",
    description: "منصة الوسيط الآمنة والموثوقة لبيع وشراء حسابات التواصل الاجتماعي والألعاب",
    images: ["/twitter-image.png"],
    creator: "@alwaseet",
    site: "@alwaseet",
  },

  // App-specific metadata
  applicationName: "الوسيط",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "الوسيط",
  },

  // Icons and manifest
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/apple-touch-icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
      { url: "/apple-touch-icon-114x114.png", sizes: "114x114", type: "image/png" },
      { url: "/apple-touch-icon-76x76.png", sizes: "76x76", type: "image/png" },
      { url: "/apple-touch-icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/apple-touch-icon-60x60.png", sizes: "60x60", type: "image/png" },
      { url: "/apple-touch-icon-57x57.png", sizes: "57x57", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.png", color: "#f97316" },
      { rel: "shortcut icon", url: "/favicon.ico" },
    ],
  },

  manifest: "/manifest.json",

  // Theme colors
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f97316" },
    { media: "(prefers-color-scheme: dark)", color: "#ea580c" },
  ],

  // Additional meta tags
  other: {
    "msapplication-TileColor": "#f97316",
    "msapplication-TileImage": "/mstile-144x144.png",
    "msapplication-config": "/browserconfig.xml",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Additional meta tags for better SEO and functionality */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="الوسيط" />

        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for Firebase */}
        <link rel="dns-prefetch" href="https://alwaseet-44f09.firebaseapp.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />

        {/* Structured data for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "الوسيط",
              description: "منصة آمنة لبيع وشراء حسابات التواصل الاجتماعي والألعاب",
              url: "https://alwaseet.com",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                category: "Digital Accounts Trading",
              },
              author: {
                "@type": "Organization",
                name: "الوسيط",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
