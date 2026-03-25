import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Roboto_Mono } from "next/font/google"
import "./globals.css"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"

// Validate required environment variables at startup
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is not set. Please configure it in your .env.local or Vercel settings."
  )
}

if (!process.env.ENCRYPTION_KEY) {
  throw new Error(
    "ENCRYPTION_KEY environment variable is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
  )
}

const geistSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Horaire SSIV - Gestion des horaires de pompiers",
  description: "Application de gestion des horaires pour les pompiers",
  generator: "v0.app",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <head />
      <body className={`font-sans ${geistSans.variable} ${geistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Toaster />
      </body>
    </html>
  )
}
