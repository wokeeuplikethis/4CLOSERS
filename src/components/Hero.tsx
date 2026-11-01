'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useStudio } from '@/components/StudioProvider'
import { useCityData } from '@/components/CityDataProvider'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import { cn } from '@/lib/utils'

type StudioId = 'moscow' | 'spb'
type Stage = 'pre' | 'shown' | 'out'

const EASE = 'cubic-bezier(.22,.61,.36,1)'
const IN_STAGGER = 35
const OUT_STAGGER = 18
const OUT_DURATION = 380

export function Hero() {
  return <HeroInner />
}

function HeroInner() {
  const { currentStudio } = useStudio()
  const { data } = useCityData()
  const reduced = usePrefersReducedMotion()

  const [shown, setShown] = useState<StudioId>(currentStudio === 'moscow' ? 'moscow' : 'spb')
  const [studio, setStudio] = useState(data.studio)
  const [stage, setStage] = useState<Stage>('pre')

  const latestStudio = useRef(data.studio)
  latestStudio.current = data.studio

  useEffect(() => {
    const t = setTimeout(() => setStage('shown'), 40)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const target: StudioId = currentStudio === 'moscow' ? 'moscow' : 'spb'
    if (target === shown) return

    if (reduced) {
      setShown(target)
      setStudio(latestStudio.current)
      setStage('shown')
      return
    }

    const letters = studio.city.length
    const exitMs = OUT_DURATION + Math.max(letters - 1, 0) * OUT_STAGGER + 80

    setStage('out')

    let t2: ReturnType<typeof setTimeout> | undefined
    const t1 = setTimeout(() => {
      setShown(target)
      setStudio(latestStudio.current)
      setStage('pre')
      t2 = setTimeout(() => setStage('shown'), 50)
    }, exitMs)

    return () => {
      clearTimeout(t1)
      if (t2) clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStudio, reduced])

  const cityWord = studio.city.toUpperCase()

  const lines = cityWord.split('-').map((part, idx, arr) =>
    idx < arr.length - 1 ? `${part}-` : part
  )

  const totalLetters = lines.reduce((n, l) => n + l.length, 0)
  const longest = Math.max(...lines.map((l) => l.length))

  const heroFontSize =
    longest <= 8
      ? 'clamp(3rem, 12vw, 10rem)'
      : 'clamp(2.5rem, 9vw, 8rem)'

  const crestSrc =
    shown === 'moscow'
      ? '/images/GERB_MSK.png'
      : '/images/GERB_SPB.png'

  /* ───── стили анимации ───── */

  const letterStyle = (i: number): CSSProperties => {
    if (reduced) return {}

    if (stage === 'shown') {
      return {
        opacity: 1,
        transform: 'translateY(0) rotateX(0deg)',
        filter: 'blur(0px)',
        transition: `opacity 600ms ${EASE}, transform 600ms ${EASE}, filter 600ms ${EASE}`,
        transitionDelay: `${i * IN_STAGGER}ms`,
      }
    }

    if (stage === 'out') {
      return {
        opacity: 0,
        transform: 'translateY(-0.45em) rotateX(55deg)',
        filter: 'blur(8px)',
        transition: `opacity ${OUT_DURATION}ms ease-in, transform ${OUT_DURATION}ms ease-in, filter ${OUT_DURATION}ms ease-in`,
        transitionDelay: `${(totalLetters - 1 - i) * OUT_STAGGER}ms`,
      }
    }

    return {
      opacity: 0,
      transform: 'translateY(0.45em) rotateX(-55deg)',
      filter: 'blur(8px)',
      transition: 'none',
    }
  }

  const crestStyle = (): CSSProperties => {
    const base = 'invert(1) brightness(1.1)'

    if (reduced) return { filter: base }

    if (stage === 'shown') {
      return {
        opacity: 1,
        transform: 'perspective(800px) rotateY(0deg) scale(1)',
        filter: `${base} blur(0px) drop-shadow(0 0 16px rgba(255,255,255,.28))`,
        transition: `opacity 900ms ${EASE}, transform 900ms ${EASE}, filter 900ms ${EASE}`,
        transitionDelay: '150ms',
      }
    }

    if (stage === 'out') {
      return {
        opacity: 0,
        transform: 'perspective(800px) rotateY(90deg) scale(0.55)',
        filter: `${base} blur(6px) drop-shadow(0 0 0 rgba(255,255,255,0))`,
        transition: `opacity ${OUT_DURATION + 80}ms ease-in, transform ${OUT_DURATION + 80}ms ease-in, filter ${OUT_DURATION + 80}ms ease-in`,
      }
    }

    return {
      opacity: 0,
      transform: 'perspective(800px) rotateY(-90deg) scale(0.55)',
      filter: `${base} blur(6px) drop-shadow(0 0 0 rgba(255,255,255,0))`,
      transition: 'none',
    }
  }

  const captionStyle: CSSProperties = reduced
    ? {}
    : {
        opacity: stage === 'shown' ? 1 : 0,
        transition: `opacity ${stage === 'shown' ? 500 : 250}ms ease`,
        transitionDelay: stage === 'shown' ? '200ms' : '0ms',
      }

  const coords =
    shown === 'moscow'
      ? 'mow · 55.7558° n · 37.6173° e'
      : 'spb · 59.9311° n · 30.3609° e'

  let letterIndex = 0

  return (
    <section
      id="hero"
      className="relative"
      aria-labelledby="hero-city"
    >
      <div className="shell pt-12 sm:pt-16 pb-16">
        {/* Блок с городом */}
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
                style={captionStyle}
              >
                {studio.shortName} · {studio.name} · {studio.hours}
              </p>

              {/* Герб */}
              <img
                key={`crest-${shown}`}
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
                  will-change-transform
                "
                style={crestStyle()}
              />

              {/* Название города */}
              <h1
                id="hero-city"
                aria-label={studio.city}
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
                  perspective: '900px',
                }}
              >
                {lines.map((line, lineIdx) => (
                  <span
                    key={`${shown}-${lineIdx}`}
                    className="block"
                    aria-hidden="true"
                  >
                    {line.split('').map((ch, chIdx) => {
                      const myIndex = letterIndex++

                      return (
                        <span
                          key={`${shown}-${lineIdx}-${chIdx}`}
                          className={cn(
                            'inline-block will-change-transform motion-reduce:transition-none'
                          )}
                          style={letterStyle(myIndex)}
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

          {/* Правая колонка — заглушка под будущий контент */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4" />

          {/* Кнопка бронирования — пока на всю ширину, ниже сетки */}
        </div>

        {/* Кнопка бронирования */}
        <div className="mt-8 flex justify-end">
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
              min-w-[280px]
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
        {coords}
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