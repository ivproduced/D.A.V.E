import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'D.A.V.E - Document Analysis & Validation Engine',
  description: 'AI-Powered Compliance Automation using Google Gemini',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="w-full">
      <body className={`${inter.className} w-full`}>{children}</body>
    </html>
  )
}
