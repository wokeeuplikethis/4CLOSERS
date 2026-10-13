'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useStudio } from '@/components/StudioProvider'
import { useCityData } from '@/components/CityDataProvider'
import { CitySwitch } from '@/components/CitySwitch'
import { cn } from '@/lib/utils'

export function Hero() {
  const { transitionKey } = useStudio()

  return <HeroInner key={transitionKey} />
}

function HeroInner() {
  const { currentStudio } = useStudio()
  const { data } = useCityData()
  const studio = data.studio

  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 40)

    return () => clearTimeout(t)
  }, [])

  const cityWord = studio.city.toUpperCase()

  const lines = cityWord.split('-').map((part, idx, arr) =>
    idx < arr.length - 1 ? `${part}-` : part
  )

  const longest = Math.max(...lines.map((l) => l.length))

  const heroFontSize =
    longest <= 8
      ? 'clamp(3rem, 12vw, 10rem)'
      : 'clamp(2.5rem, 9vw, 8rem)'

  const crestSrc =
    currentStudio === 'moscow'
      ? '/images/GERB_MSK.png'
      : '/images/GERB_SPB.png'

  let letterIndex = 0

  return (
    <section
      id="hero"
      className="relative"
      aria-labelledby="hero-city"
    >
      <div className="shell pt-12 sm:pt-16 pb-16">
        {/* Блок с городом и мета-карточкой */}
        <div className="grid grid-cols-12 gap-x-6 gap-y-12 items-start min-h-[420px] lg:min-h-[480px]">
          <div className="col-span-12 lg:col-span-8">
            {/* Фиксированная область заголовка */}
            <div className="relative min-h-[300px] sm:min-h-[320px] lg:min-h-[340px]">
              {/* Подпись */}
              <p
                className="
                  absolute
                  left-0
                  top-0
                  font-mono
                  text-[11px]
                  uppercase
                  tracking-[0.18em]
                  text-bone/40
                "
              >
                {studio.shortName} · {studio.name} · {studio.hours}
              </p>

              {/* Герб */}
              <img
                src={crestSrc}
                alt=""
                aria-hidden="true"
                className="
                  absolute
                  left-0
                  top-14
                  shrink-0
                  h-20
                  w-20
                  sm:h-24
                  sm:w-24
                  lg:h-32
                  lg:w-32
                  object-contain
                  invert
                  brightness-110
                "
              />

              {/* Название города */}
              <h1
                id="hero-city"
                className="
                  absolute
                  left-0
                  top-12
                  pl-20
                  sm:pl-24
                  lg:pl-32
                  font-display
                  font-light
                  text-bone
                  tracking-[-0.045em]
                "
                style={{
                  fontSize: heroFontSize,
                  lineHeight: 0.95,
                }}
              >
                {lines.map((line, lineIdx) => (
                  <span
                    key={lineIdx}
                    className="block"
                  >
                    {line.split('').map((ch, chIdx) => {
                      const myIndex = letterIndex++

                      return (
                        <span
                          key={`${lineIdx}-${chIdx}`}
                          className={cn(
                            'inline-block motion-reduce:transition-none',
                            entered
                              ? 'opacity-100 translate-y-0'
                              : 'opacity-0 translate-y-[0.4em]',
                            'transition-[opacity,transform] duration-600 ease-[cubic-bezier(.22,.61,.36,1)]'
                          )}
                          style={{
                            transitionDelay: `${myIndex * 35}ms`,
                          }}
                        >
                          {ch === ' ' ? '\u00A0' : ch}
                        </span>
                      )
                    })}
                  </span>
                ))}
              </h1>
            </div>
          </div>

          {/* Правая мета-карточка */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <div className="border-t border-ash pt-4">
              <div className="datum">
                <span className="k">адрес</span>

                <span className="v text-right max-w-[16rem]">
                  {studio.address}
                </span>
              </div>

              <div className="datum">
                <span className="k">часы</span>

                <span className="v">
                  {studio.hours}
                </span>
              </div>

              <div className="datum">
                <span className="k">телефон</span>

                <a
                  href={`tel:${studio.phone.replace(/\s/g, '')}`}
                  className="
                    v
                    hover:text-signal
                    transition-colors
                  "
                >
                  {studio.phone}
                </a>
              </div>

              <div className="datum">
                <span className="k">почта</span>

                <a
                  href={`mailto:${studio.email}`}
                  className="
                    v
                    hover:text-signal
                    transition-colors
                  "
                >
                  {studio.email}
                </a>
              </div>
            </div>

            {/* Кнопка бронирования */}
            <Link
              href="/bookings"
              className="
                group
                inline-flex
                items-center
                justify-between
                gap-4
                border
                border-ash
                hover:border-signal
                rounded-md
                px-5
                h-12
                text-sm
                text-bone
                transition-colors
                duration-200
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-signal
              "
            >
              <span>
                Забронировать сессию
              </span>

              <ArrowUpRight
                className="
                  h-4
                  w-4
                  text-bone/40
                  group-hover:text-signal
                  transition-colors
                  duration-200
                "
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* Статистика */}
        <div
          className="
            grid
            grid-cols-3
            gap-x-6
            mt-24
            lg:mt-32
            border-t
            border-ash
            pt-6
          "
        >
          <Stat
            value="500+"
            label="треков записано"
          />

          <Stat
            value="7"
            label="лет работы"
          />

          <Stat
            value="24/7"
            label="на связи"
          />
        </div>
      </div>

      {/* Координаты города */}
      <div
        aria-hidden="true"
        className="
          hidden
          xl:block
          absolute
          right-6
          top-1/2
          font-mono
          text-[10px]
          uppercase
          tracking-[0.2em]
          text-bone/25
          select-none
        "
        style={{
          writingMode: 'vertical-rl',
          transform: 'translateY(-50%) rotate(180deg)',
        }}
      >
        {currentStudio === 'moscow'
          ? 'mow · 55.7558° n · 37.6173° e'
          : 'spb · 59.9311° n · 30.3609° e'}
      </div>
    </section>
  )
}

function Stat({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <div>
      <div
        className="
          font-display
          font-light
          text-xl
          sm:text-2xl
          text-bone
          tracking-[-0.02em]
        "
      >
        {value}
      </div>

      <div
        className="
          font-mono
          text-[10px]
          uppercase
          tracking-[0.14em]
          text-bone/40
          mt-2
        "
      >
        {label}
      </div>
    </div>
  )
}