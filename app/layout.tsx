import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Banner } from "@/components/layout/banner"
import { Footer } from "@/components/layout/footer"
import { Suspense } from "react"
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
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <Banner />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
