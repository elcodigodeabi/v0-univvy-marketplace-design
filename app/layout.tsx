import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { UserSelector } from "@/components/user-selector"
import { Toaster } from "@/components/ui/sonner"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Univvy - Plataforma de Asesoría Académica",
  description:
    "Conecta con asesores académicos verificados. Encuentra apoyo académico personalizado de estudiantes avanzados y profesores calificados de tu universidad.",
  generator: "v0.app",
  icons: {
    icon: "/univvy-logo.jpg",
    apple: "/univvy-logo.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <UserSelector />
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  )
}
