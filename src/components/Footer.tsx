'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getStudio } from '@/data/studios'
import { useStudio } from '@/components/StudioProvider'

export function Footer() {
  const { currentStudio } = useStudio()
  const studio = getStudio(currentStudio)

  const navLinks = [
    { label: 'Студия', href: '#studio' },
    { label: 'Услуги', href: '#services' },
    { label: 'Работы', href: '#portfolio' },
    { label: 'Оборудование', href: '#equipment' },
    { label: 'Вопросы', href: '#faq' },
    { label: 'Записаться', href: '/bookings' },
  ]

  const socialLinks = [
    { label: 'Telegram', href: studio.telegram.startsWith('http') ? studio.telegram : `https://t.me/${studio.telegram.replace('@', '')}` },
    { label: 'VK', href: studio.vk.startsWith('http') ? studio.vk : `https://${studio.vk}` },
    { label: 'Почта', href: `mailto:${studio.email}` },
  ]

  const legalLinks = [
    { label: 'Политика конфиденциальности', href: '/privacy' },
    { label: 'Условия', href: '/terms' },
  ]

  return (
    <footer className="border-t border-ash" role="contentinfo">
      <div className="shell py-16 lg:py-20">
        {/* Верхний блок: лого + дескриптор слева, три колонки справа. */}
        <div className="grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-5">
            <Link
              href="/"
              className="inline-flex items-baseline gap-2 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
              aria-label="4CLOSERS — на главную"
            >
              <span className="font-display text-lg font-medium tracking-tight text-bone">
                4CLOSERS
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/40">
                rec · mix · master
              </span>
            </Link>
            <p className="mt-5 text-sm text-bone/50 max-w-[44ch] leading-relaxed">
              Две студии, один подход к звуку. Москва и Санкт-Петербург.
            </p>
          </div>

          <div className="col-span-6 sm:col-span-4 lg:col-span-3">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-4">
              навигация
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-bone/70 hover:text-bone transition-colors
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-6 sm:col-span-4 lg:col-span-2">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-4">
              соцсети
            </h3>
            <ul className="space-y-2">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-bone/70 hover:text-bone transition-colors
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 sm:col-span-4 lg:col-span-2">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-4">
              контакт
            </h3>
            <ul className="space-y-2 text-sm text-bone/70">
              <li>
                <a
                  href={`tel:${studio.phone.replace(/\s/g, '')}`}
                  className="hover:text-bone transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
                >
                  {studio.phone}
                </a>
              </li>
              <li className="text-bone/50 leading-snug">{studio.address}</li>
              <li className="text-bone/50">{studio.hours}</li>
            </ul>
          </div>
        </div>

        {/* Нижняя строка: копирайт + легал + кнопка "наверх". */}
        <div className="mt-16 pt-6 border-t border-ash flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35">
            © {new Date().getFullYear()} 4CLOSERS · {currentStudio === 'moscow' ? 'мск' : 'спб'}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35 hover:text-bone/70 transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="#hero"
              className="group inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35 hover:text-signal transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
            >
              наверх
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}