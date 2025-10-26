import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth"
import { NotificationProvider } from "@/lib/notifications/NotificationContext"
import { Header } from "@/components/layout/header"
import { Banner } from "@/components/layout/banner"
import { Footer } from "@/components/layout/footer"
import { ProfileModalWrapper } from "@/components/profile/profile-modal-wrapper"
import { Suspense } from "react"
import { HotToastToaster } from "@/components/ui/hot-toaster"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "JobPlatform - Find Your Next Opportunity",
  description: "Connect employers with talented candidates",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.veriff.me/sdk/js/1.5/veriff.min.js"></script>
        <script src="https://cdn.veriff.me/incontext/js/v1/veriff.js"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <NotificationProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <Banner />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <ProfileModalWrapper />
              </div>
            </NotificationProvider>
          </AuthProvider>
        </Suspense>
        <HotToastToaster />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
