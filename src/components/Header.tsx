'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, MapPin, ChevronDown } from 'lucide-react'
import { useStudio } from '@/components/StudioProvider'
import { STUDIO_SLUGS, STUDIO_LABELS } from '@/types'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '#studio', label: 'Студия' },
  { href: '#services', label: 'Услуги' },
  { href: '#portfolio', label: 'Портфолио' },
  { href: '#equipment', label: 'Оборудование' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contacts', label: 'Контакты' },
]

export function Header() {
  const { currentStudio, setCurrentStudio, labels } = useStudio()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!mounted) return null

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-graphite-700/80 backdrop-blur-md border-b border-graphite-200/10 shadow-[0_0_40px_rgba(255,61,0,0.05)]'
          : 'bg-transparent'
      )}
    >
      <nav className="container-custom" aria-label="Main navigation">
        <div className="flex h-18 items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-graphite-700 rounded-md"
            aria-label="4CLOSERS Studio — главная"
          >
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              4CLOSERS
            </span>
            <span className="hidden sm:block text-caption text-accent font-medium">
              STUDIO
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-body-sm font-medium text-graphite-100 transition-colors hover:text-accent
                           after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-accent
                           after:transition-all after:duration-300 hover:after:w-full
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-graphite-700 rounded-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCityMenuOpen(!isCityMenuOpen)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-300',
                  'bg-graphite-200/10 border border-graphite-200/20 hover:border-accent/50',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-graphite-700'
                )}
                aria-expanded={isCityMenuOpen}
                aria-haspopup="listbox"
                aria-label={`Текущий город: ${labels[currentStudio]}. Нажмите для смены`}
              >
                <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                <span className="text-white">{labels[currentStudio]}</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-graphite-200 transition-transform duration-200',
                    isCityMenuOpen && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              </button>

              <AnimatePresence>
                {isCityMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-40 rounded-xl bg-graphite-100/95 backdrop-blur-md border border-graphite-200/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)] py-2"
                    role="listbox"
                    aria-label="Выбор города"
                  >
                    {STUDIO_SLUGS.map((slug) => (
                      <button
                        key={slug}
                        onClick={() => {
                          setCurrentStudio(slug)
                          setIsCityMenuOpen(false)
                        }}
                        role="option"
                        aria-selected={currentStudio === slug}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors',
                          currentStudio === slug
                            ? 'bg-accent/10 text-accent'
                            : 'text-graphite-100 hover:bg-graphite-200/10 hover:text-white'
                        )}
                      >
                        <span className="text-caption text-graphite-300">{labels[slug]}</span>
                        {currentStudio === slug && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-2 w-2 rounded-full bg-accent"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/profile"
              className="hidden sm:flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-graphite-100
                         bg-graphite-200/10 border border-graphite-200/20 hover:border-accent/50 hover:text-white
                         transition-all duration-300
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-graphite-700"
            >
              <User className="h-4 w-4" aria-hidden="true" />
              <span>Профиль</span>
            </Link>

            <Link
              href="/bookings"
              className="btn-primary text-sm px-6 py-2.5"
            >
              Записаться
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 rounded-md text-graphite-100 hover:text-accent transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-graphite-700"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-graphite-200/10 bg-graphite-700/95 backdrop-blur-md"
            >
              <div className="container-custom py-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-body font-medium text-graphite-100
                               rounded-lg bg-graphite-200/10 hover:bg-accent/10 hover:text-accent
                               transition-all duration-300"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-graphite-200/10 space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-graphite-200/10">
                    <MapPin className="h-5 w-5 text-accent" aria-hidden="true" />
                    <span className="text-body font-medium text-white">{labels[currentStudio]}</span>
                  </div>
                  {STUDIO_SLUGS.filter((s) => s !== currentStudio).map((slug) => (
                    <button
                      key={slug}
                      onClick={() => {
                        setCurrentStudio(slug)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-graphite-200/10
                                 text-body font-medium text-graphite-100 hover:bg-accent/10 hover:text-accent
                                 transition-all duration-300"
                    >
                      <span className="text-caption text-graphite-300">{labels[slug]}</span>
                    </button>
                  ))}
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg
                               bg-graphite-200/10 border border-graphite-200/20 text-body font-medium text-graphite-100
                               hover:border-accent/50 hover:text-white transition-all duration-300"
                  >
                    <User className="h-5 w-5" aria-hidden="true" />
                    Профиль
                  </Link>
                  <Link
                    href="/bookings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-primary w-full justify-center py-3"
                  >
                    Записаться на сессию
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}