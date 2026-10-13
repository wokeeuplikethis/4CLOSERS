import type { Metadata, Viewport } from 'next'
import { Unbounded, Manrope, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { SiteDataProvider } from '@/components/SiteDataProvider'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { prisma } from '@/lib/prisma'
import type { StudioConfig, StudioSlug } from '@/types'

export const metadata: Metadata = {
  title: { default: 'БЛИЗКИЕ — Студия звукозаписи', template: '%s | БЛИЗКИЕ' },
  description:
    'Две студии, один подход к звуку. Запись вокала и рэпа, сведение, мастеринг. Москва и Санкт-Петербург.',
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

const fontSans = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600'],
})

const fontDisplay = Unbounded({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  display: 'swap',
  weight: ['300', '400', '500'],
})

const fontMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
})

async function loadStudios(): Promise<Record<StudioSlug, StudioConfig>> {
  const rows = await prisma.studio.findMany()

  const toConfig = (s: (typeof rows)[number]): StudioConfig => ({
    slug: s.slug as StudioSlug,
    name: s.name,
    city: s.city,
    shortName: s.slug === 'moscow' ? 'МСК' : 'СПБ',
    address: s.address,
    phone: s.phone,
    email: s.email,
    telegram: s.telegram,
    vk: s.vk,
    hours: s.hours,
    description: s.description,
    mapUrl: s.mapUrl,
    latitude: s.latitude,
    longitude: s.longitude,
    hero: {
      image: `/images/${s.slug}/hero.svg`,
      alt: `${s.city} — студия`,
    },
    images: {
      studio: [
        `/images/${s.slug}/studio/stu1.jpg`,
        `/images/${s.slug}/studio/stu2.jpg`,
        `/images/${s.slug}/studio/stu3.jpg`,
        `/images/${s.slug}/studio/stu4.jpg`,
        `/images/${s.slug}/studio/stu5.jpg`,
        `/images/${s.slug}/studio/stu6.jpg`,
      ],
      equipment: [],
      portfolio: [],
    },
    seo: {
      title: `БЛИЗКИЕ ${s.slug === 'moscow' ? 'Moscow' : 'SPB'}`,
      description: s.description,
      ogImage: `/images/${s.slug}/og-image.svg`,
    },
  })

  const map: Partial<Record<StudioSlug, StudioConfig>> = {}
  for (const row of rows) {
    map[row.slug as StudioSlug] = toConfig(row)
  }

  if (!map.moscow || !map.spb) {
    throw new Error('Both studios (moscow, spb) must exist in DB')
  }

  return map as Record<StudioSlug, StudioConfig>
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const studios = await loadStudios()

  return (
    <html
      lang="ru"
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans bg-void text-bone min-h-screen">
        <Providers>
          <SiteDataProvider value={studios}>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 pt-16">{children}</main>
              <Footer />
            </div>
          </SiteDataProvider>
        </Providers>
      </body>
    </html>
  )
}