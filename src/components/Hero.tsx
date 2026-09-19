'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getStudio } from '@/data/studios'
import { useStudio } from '@/components/StudioProvider'
import { CitySwitch } from '@/components/CitySwitch'
import { cn } from '@/lib/utils'

export function Hero() {
  const { currentStudio, direction, transitionKey } = useStudio()
  const studio = getStudio(currentStudio)

  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 40)
    return () => clearTimeout(t)
  }, [])

  const cityWord = studio.city.toUpperCase()

  // «САНКТ-ПЕТЕРБУРГ» → ['САНКТ-', 'ПЕТЕРБУРГ'], «МОСКВА» → ['МОСКВА'].
  const lines = cityWord.split('-').map((part, idx, arr) =>
    idx < arr.length - 1 ? `${part}-` : part
  )

  // Кегль для каждой строки отдельно.
  // Короткая строка — крупно, длинная — компактно, но не мелко.
    function fontSizeForLine(line: string): string {
    const n = line.length
    if (n <= 4) return 'clamp(3.5rem, 13vw, 12rem)'  // МСК
    if (n <= 6) return 'clamp(2.75rem, 11vw, 9.5rem)' // МОСКВА
    if (n <= 7) return 'clamp(2.75rem, 11vw, 9.5rem)' // САНКТ-
    return 'clamp(2rem, 8vw, 7.5rem)'                // ПЕТЕРБУРГ
  }

  let letterIndex = 0

  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex flex-col"
      aria-labelledby="hero-city"
    >
      <div className="shell pt-24 sm:pt-28 flex justify-center">
        <CitySwitch />
      </div>

      <div
        key={transitionKey}
        className={cn(
          'shell flex-1 flex flex-col justify-center pb-16 pt-10 sm:pt-14',
          direction === 'left' ? 'city-enter-left' : 'city-enter-right'
        )}
      >
        <div className="grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 lg:col-span-8 flex flex-col justify-end">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/40 mb-6">
              {studio.shortName} · {studio.hours}
            </p>

            <h1
              id="hero-city"
              className="font-display font-light text-bone tracking-[-0.045em]"
              style={{ lineHeight: 0.95 }}
            >
              {lines.map((line, lineIdx) => (
                <span
                  key={`${transitionKey}-line-${lineIdx}`}
                  className="block"
                  style={{ fontSize: fontSizeForLine(line) }}
                >
                  {line.split('').map((ch) => {
                    const myIndex = letterIndex++
                    return (
                      <span
                        key={`${transitionKey}-${lineIdx}-${myIndex}`}
                        className={cn(
                          'inline-block',
                          entered
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-[0.4em]',
                          'transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,.61,.36,1)]'
                        )}
                        style={{ transitionDelay: `${myIndex * 35}ms` }}
                      >
                        {ch === ' ' ? '\u00A0' : ch}
                      </span>
                    )
                  })}
                </span>
              ))}
            </h1>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col justify-end gap-4">
            <div className="border-t border-ash pt-4">
              <div className="datum">
                <span className="k">адрес</span>
                <span className="v text-right">{studio.address}</span>
              </div>
              <div className="datum">
                <span className="k">часы</span>
                <span className="v">{studio.hours}</span>
              </div>
              <div className="datum">
                <span className="k">телефон</span>
                <a
                  href={`tel:${studio.phone.replace(/\s/g, '')}`}
                  className="v hover:text-signal transition-colors"
                >
                  {studio.phone}
                </a>
              </div>
              <div className="datum">
                <span className="k">почта</span>
                <a
                  href={`mailto:${studio.email}`}
                  className="v hover:text-signal transition-colors"
                >
                  {studio.email}
                </a>
              </div>
            </div>

            <Link
              href="/bookings"
              className="group inline-flex items-center justify-between gap-4
                         border border-ash hover:border-signal
                         rounded-md px-5 h-12
                         text-sm text-bone
                         transition-colors duration-200
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
            >
              <span>Забронировать сессию</span>
              <ArrowUpRight
                className="h-4 w-4 text-bone/40 group-hover:text-signal transition-colors duration-200"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-6 mt-16 sm:mt-24 border-t border-ash pt-6">
          <Stat value="500+" label="треков записано" />
          <Stat value="7" label="лет работы" />
          <Stat value="24/7" label="на связи" />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="hidden xl:block absolute right-6 top-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/25 select-none"
        style={{ writingMode: 'vertical-rl', transform: 'translateY(-50%) rotate(180deg)' }}
      >
        {currentStudio === 'moscow'
          ? 'mow · 55.7558° n · 37.6173° e'
          : 'spb · 59.9311° n · 30.3609° e'}
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display font-light text-2xl sm:text-3xl text-bone tracking-[-0.02em]">
        {value}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mt-2">
        {label}
      </div>
    </div>
  )
}