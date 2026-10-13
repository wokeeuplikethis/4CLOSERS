'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Обзор', exact: true },
  { href: '/admin/studios', label: 'Студии' },
  { href: '/admin/services', label: 'Услуги' },
  { href: '/admin/equipment', label: 'Оборудование' },
  { href: '/admin/artists', label: 'Артисты' },
  { href: '/admin/team', label: 'Команда' },
  { href: '/admin/reviews', label: 'Отзывы', disabled: true },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <nav className="panel p-4 lg:sticky lg:top-24">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-4">
        админка
      </div>
      <ul className="space-y-1">
        {links.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href)

          if (link.disabled) {
            return (
              <li key={link.href}>
                <span
                  className="block px-3 py-2 rounded-md text-sm text-bone/25 cursor-not-allowed"
                  aria-disabled="true"
                >
                  {link.label}
                </span>
              </li>
            )
          }

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-signal',
                  isActive
                    ? 'bg-bone/[0.06] text-bone'
                    : 'text-bone/60 hover:text-bone hover:bg-bone/[0.04]'
                )}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}