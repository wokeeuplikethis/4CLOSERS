import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: {
    default: '4CLOSERS Studio — Профессиональная запись, сведение и мастеринг',
    template: '%s | 4CLOSERS Studio',
  },
  description: 'Студия звукозаписи 4CLOSERS. Москва и Санкт-Петербург. Запись вокала и рэпа, сведение, мастеринг, автотюн, продакшн, саунд-дизайн.',
  keywords: ['студия звукозаписи', 'запись вокала', 'запись рэпа', 'сведение', 'мастеринг', 'автотюн', 'продакшн', 'Москва', 'Санкт-Петербург'],
  authors: [{ name: '4CLOSERS Studio' }],
  creator: '4CLOSERS Studio',
  publisher: '4CLOSERS Studio',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://4closers.studio',
    siteName: '4CLOSERS Studio',
    title: '4CLOSERS Studio — Профессиональная запись, сведение и мастеринг',
    description: 'Студия звукозаписи 4CLOSERS. Москва и Санкт-Петербург. Запись вокала и рэпа, сведение, мастеринг, автотюн, продакшн, саунд-дизайн.',
    images: [
      {
        url: '/images/moscow/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '4CLOSERS Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '4CLOSERS Studio',
    description: 'Профессиональная студия звукозаписи в Москве и СПБ',
    images: ['/images/moscow/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const fontSans = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
})

const fontDisplay = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-graphite-700 text-white font-sans min-h-screen">
        <div className="relative z-10 flex flex-col min-h-screen">
          <Providers>{children}</Providers>
        </div>
        <div
          className="fixed inset-0 -z-10 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'var(--tw-gradient-from)' }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%270%200%20256%20256%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter%20id=%27noise%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.9%27%20numOctaves=%274%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23noise)%27/%3E%3C/svg%3E')] animate-grain" />
        </div>
      </body>
    </html>
  )
}