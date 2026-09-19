'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, MessageCircle, Clock, Map, Music, Users, Star } from 'lucide-react'
import { getStudio } from '@/data/studios'
import { STUDIO_LABELS } from '@/types'
import { useStudio } from '@/components/StudioProvider'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function Footer() {
  const { currentStudio } = useStudio()
  const studio = getStudio(currentStudio)

  const footerLinks = [
    { label: 'Студия', href: '#studio' },
    { label: 'Услуги', href: '#services' },
    { label: 'Портфолио', href: '#portfolio' },
    { label: 'Оборудование', href: '#equipment' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Контакты', href: '#contacts' },
  ]

  const legalLinks = [
    { label: 'Политика конфиденциальности', href: '/privacy' },
    { label: 'Условия использования', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ]

  const socialLinks = [
    { icon: MessageCircle, label: 'Telegram', href: studio.telegram, external: true },
    { icon: Music, label: 'VK', href: studio.vk, external: true },
    { icon: Mail, label: 'Email', href: `mailto:${studio.email}`, external: false },
  ]

  return (
    <footer
      id="contacts"
      className="relative border-t border-graphite-200/10 bg-graphite-700/50 backdrop-blur-sm"
      role="contentinfo"
    >
      <div className="container-custom py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-graphite-700 rounded-md"
              aria-label="4CLOSERS Studio — главная"
            >
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                4CLOSERS
              </span>
              <span className="text-caption text-accent font-medium">STUDIO</span>
            </Link>
            <p className="text-body text-graphite-200 mb-8 max-w-xs">
              Профессиональная студия звукозаписи в Москве и Санкт-Петербурге.
              Запись вокала и рэпа, сведение, мастеринг, автотюн, продакшн и саунд-дизайн.
            </p>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.external ? '_blank' : undefined}
                  rel={social.external ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-graphite-200/10 border border-graphite-200/20
                             text-body-sm font-medium text-graphite-100 hover:border-accent/50 hover:text-accent
                             transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                  <span>{social.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-white mb-6">Контакты</h3>
            <address className="not-italic space-y-4 text-body text-graphite-200">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-white">{studio.city}</p>
                  <p>{studio.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent flex-shrink-0" aria-hidden="true" />
                <a href={`tel:${studio.phone.replace(/\s/g, '')}`} className="hover:text-accent transition-colors">
                  {studio.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent flex-shrink-0" aria-hidden="true" />
                <a href={`mailto:${studio.email}`} className="hover:text-accent transition-colors">
                  {studio.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-accent flex-shrink-0" aria-hidden="true" />
                <span>{studio.hours}</span>
              </div>
            </address>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-white mb-6">Навигация</h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body text-graphite-200 hover:text-accent transition-colors
                                 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-graphite-700 rounded"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-graphite-200/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-body-sm text-graphite-300">
              © {new Date().getFullYear()} 4CLOSERS Studio. Все права защищены.
            </p>
            <div className="flex items-center gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-caption text-graphite-300 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 text-caption text-graphite-300">
                <Star className="h-4 w-4 text-accent" aria-hidden="true" />
                <span>Сделано с любовью к музыке</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}