import type { Metadata, Viewport } from 'next'
import { Unbounded, Manrope, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: { default: '4CLOSERS — Студия звукозаписи', template: '%s | 4CLOSERS' },
  description: 'Две студии, один подход к звуку. Запись вокала и рэпа, сведение, мастеринг. Москва и Санкт-Петербург.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const fontSans = Manrope({ subsets: ['latin', 'cyrillic'], variable: '--font-sans', display: 'swap', weight: ['400', '500', '600'] })
const fontDisplay = Unbounded({ subsets: ['latin', 'cyrillic'], variable: '--font-display', display: 'swap', weight: ['300', '400', '500'] })
const fontMono = JetBrains_Mono({ subsets: ['latin', 'cyrillic'], variable: '--font-mono', display: 'swap', weight: ['400', '500'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`} suppressHydrationWarning>
      <body className="font-sans bg-void text-bone min-h-screen">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}