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

  /** Логотип появляется синхронно с гербом, но «раскрывается» с другой стороны. */
  const logoStyle = (): CSSProperties => {
    if (reduced) return {}

    if (stage === 'shown') {
      return {
        opacity: 1,
        transform: 'perspective(900px) rotateY(0deg) scale(1)',
        filter: 'blur(0px) drop-shadow(0 0 28px rgba(232,230,225,.16))',
        transition: `opacity 900ms ${EASE}, transform 900ms ${EASE}, filter 900ms ${EASE}`,
        transitionDelay: '260ms',
      }
    }

    if (stage === 'out') {
      return {
        opacity: 0,
        transform: 'perspective(900px) rotateY(-70deg) scale(0.62)',
        filter: 'blur(8px) drop-shadow(0 0 0 rgba(232,230,225,0))',
        transition: `opacity ${OUT_DURATION + 80}ms ease-in, transform ${OUT_DURATION + 80}ms ease-in, filter ${OUT_DURATION + 80}ms ease-in`,
      }
    }

    return {
      opacity: 0,
      transform: 'perspective(900px) rotateY(70deg) scale(0.62)',
      filter: 'blur(8px) drop-shadow(0 0 0 rgba(232,230,225,0))',
      transition: 'none',
    }
  }

  /** Мягкий подъём для кнопки и статистики после появления заголовка. */
  const fadeUpStyle = (delay: number, distance = 16): CSSProperties => {
    if (reduced) return {}
    return {
      opacity: stage === 'shown' ? 1 : 0,
      transform: stage === 'shown' ? 'translateY(0)' : `translateY(${distance}px)`,
      transition: `opacity 620ms ${EASE}, transform 620ms ${EASE}`,
      transitionDelay: stage === 'shown' ? `${delay}ms` : '0ms',
    }
  }

  const captionStyle: CSSProperties = reduced
    ? {}
    : {
        opacity: stage === 'shown' ? 1 : 0,
        transition: `opacity ${stage === 'shown' ? 500 : 250}ms ease`,
        transitionDelay: stage === 'shown' ? '200ms' : '0ms',
      }

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

          {/* Правая колонка — логотип напротив названия города */}
          <div className="col-span-12 lg:col-span-4 flex items-center justify-center lg:min-h-[340px]">
            <div
              className={cn(
                'will-change-transform',
                !reduced && stage === 'shown' && 'hero-logo-float'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`logo-${shown}`}
                src="/images/logo1-bone.png"
                alt="4CLOSERS"
                draggable={false}
                className="w-40 sm:w-52 lg:w-full lg:max-w-[300px] select-none will-change-transform"
                style={logoStyle()}
              />
            </div>
          </div>

          {/* Главный CTA — сразу под названием города */}
            <div className="col-span-12 lg:col-span-8 mt-5 sm:mt-7" style={fadeUpStyle(430)}>
              <Link
                href="/bookings"
                className="
                  group
                  inline-flex
                  w-full
                  sm:w-full
                  max-w-none
                  min-h-14
                  items-center
                  justify-between
                  gap-8
                  rounded-md
                  border
                  border-bone/70
                  bg-void
                  px-6
                  sm:px-7
                  py-4
                  text-base
                  font-medium
                  text-bone
                  transition-colors
                  duration-200
                  hover:border-bone
                  hover:bg-bone
                  hover:text-void
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-signal
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-void
                "
              >
                <span>Забронировать сессию</span>
                <ArrowUpRight
                  className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40">
                Выбрать студию и время
              </p>
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
          <div style={fadeUpStyle(560)}>
            <Stat
              value="500+"
              label="треков записано"
            />
          </div>

          <div style={fadeUpStyle(630)}>
            <Stat
              value="7"
              label="лет работы"
            />
          </div>

          <div style={fadeUpStyle(700)}>
            <Stat
              value="24/7"
              label="на связи"
            />
          </div>
        </div>
      </div>

      {/* Координаты выбранной студии — появляются синхронно с новым городом */}
      <div
        aria-label={`Координаты студии ${studio.name}`}
        className="
          hidden
          xl:flex
          absolute
          right-7
          top-20
          bottom-28
          min-h-[360px]
          w-36
          flex-col
          justify-between
          border-l
          border-bone/10
          pl-5
          font-mono
          select-none
        "
      >
        <div style={fadeUpStyle(120)}>
          <p className="text-[9px] uppercase tracking-[0.2em] text-bone/35">Studio</p>
          <p className="mt-2 text-sm tracking-[0.08em] text-bone/80">{studio.shortName.toUpperCase()}</p>
          <span className="mt-3 block h-px w-7 bg-bone/25" />
        </div>

        <div style={fadeUpStyle(210)}>
          <p className="text-[9px] uppercase tracking-[0.2em] text-bone/35">Latitude</p>
          <p className="mt-2 text-sm tracking-[0.04em] text-bone/75 tabular-nums">
            {Math.abs(studio.latitude).toFixed(4)}°
            <span className="ml-1 text-bone/35">{studio.latitude < 0 ? 'S' : 'N'}</span>
          </p>
        </div>

        <div style={fadeUpStyle(300)}>
          <p className="text-[9px] uppercase tracking-[0.2em] text-bone/35">Longitude</p>
          <p className="mt-2 text-sm tracking-[0.04em] text-bone/75 tabular-nums">
            {Math.abs(studio.longitude).toFixed(4)}°
            <span className="ml-1 text-bone/35">{studio.longitude < 0 ? 'W' : 'E'}</span>
          </p>
        </div>

        <p
          className="text-[8px] uppercase tracking-[0.18em] text-bone/20"
          style={fadeUpStyle(390)}
        >
          4Closers · Coordinates
        </p>
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