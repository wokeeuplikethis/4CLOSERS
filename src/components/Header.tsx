'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useStudio } from '@/components/StudioProvider'
import { CitySwitch } from '@/components/CitySwitch'
import { cn } from '@/lib/utils'
import type { UserLite } from '@/types'

const navItems = [
  { href: '/works', label: 'Работы' },
  { href: '/team', label: 'Команда' },
  { href: '/#contacts', label: 'Контакты' },
]

function Avatar({ user, size = 40 }: { user: UserLite; size?: number }) {
  const initial = (user.name?.trim() || user.email || '?').charAt(0).toUpperCase()
  return (
    <span
      className="inline-flex items-center justify-center overflow-hidden rounded-full bg-slate text-bone font-mono"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {user.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatar} alt="" className="h-full w-full object-cover" />
      ) : (
        initial
      )}
    </span>
  )
}

export function Header() {
  const pathname = usePathname()
  const { mounted, user, userLoading } = useStudio()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (!mounted) {
    return <header className="fixed top-0 left-0 right-0 z-50 h-16" aria-hidden="true" />
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
        isScrolled
          ? 'bg-void/85 backdrop-blur-xl border-b border-ash'
          : 'bg-void/60 backdrop-blur-md border-b border-transparent'
      )}
    >
      <nav className="shell" aria-label="Основная навигация">
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-6">
          {/* Лого */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-signal justify-self-start"
            aria-label="4CLOSERS — на главную"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.jpg"
              alt=""
              aria-hidden="true"
              className="h-8 w-8 rounded-full object-cover shrink-0"
            />
            <span className="font-display text-lg font-medium tracking-tight text-bone">
              4CLOSERS
            </span>
            <span className="hidden xl:block font-mono text-[10px] uppercase tracking-[0.18em] text-bone/40">
              rec · mix · master
            </span>
          </Link>

          {/* Центр: навигация */}
          <div className="hidden lg:flex items-center justify-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-bone/60 hover:text-bone transition-colors duration-200
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Правый блок */}
          <div className="flex items-center gap-3 justify-self-end">
            <CitySwitch compact className="lg:hidden" />

            {userLoading && !user ? (
              <span
                className="hidden sm:inline-block h-10 w-10 rounded-full border border-ash bg-slate/40 animate-pulse"
                aria-hidden="true"
              />
            ) : user ? (
              <>
                <Link
                  href="/profile"
                  className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full
                             border border-ash hover:border-signal
                             transition-colors duration-200
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                  aria-label="Профиль"
                >
                  <Avatar user={user} />
                </Link>

                <Link
                  href="/bookings"
                  className="hidden sm:inline-flex btn btn-solid text-sm h-10"
                >
                  Записаться
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex h-10 items-center px-3 text-sm text-bone/70 hover:text-bone
                             transition-colors duration-200
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
                >
                  Регистрация
                </Link>

                <Link
                  href="/login"
                  className="hidden sm:inline-flex h-10 items-center rounded-md px-5
                             border border-ash hover:border-signal
                             text-sm text-bone
                             transition-colors duration-200
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                >
                  Войти
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full
                         border border-ash text-bone/80 hover:text-bone hover:border-bone/40
                         transition-colors duration-200
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            className="lg:hidden border-t border-ash bg-void/95 backdrop-blur-xl"
          >
            <div className="shell py-6">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-3 text-base text-bone/80 hover:text-bone transition-colors
                                 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-ash flex flex-col gap-3">
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn btn-line w-full h-11"
                    >
                      <Avatar user={user} size={20} />
                      Профиль
                    </Link>
                    <Link
                      href="/bookings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn btn-solid w-full h-11"
                    >
                      Записаться
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn btn-line w-full h-11"
                    >
                      Войти
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="btn btn-solid w-full h-11"
                    >
                      Регистрация
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}