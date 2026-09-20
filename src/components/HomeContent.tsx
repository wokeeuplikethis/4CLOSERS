'use client'

import Link from 'next/link'
import { ArrowUpRight, Star } from 'lucide-react'
import { Hero } from '@/components/Hero'
import { PhotoCarousel } from '@/components/PhotoCarousel'
import { EquipmentCard } from '@/components/EquipmentCard'
import { ServiceCard } from '@/components/ServiceCard'
import { Reveal } from '@/components/Reveal'
import { StickyCitySwitch } from '@/components/StickyCitySwitch'
import { useStudio } from '@/components/StudioProvider'
import { useCityData } from '@/components/CityDataProvider'
import { EQUIPMENT_CATEGORIES, EQUIPMENT_LABELS } from '@/types'
import { cn } from '@/lib/utils'

export function HomeContent() {
  const { transitionKey, direction } = useStudio()
  return (
    <>
      <StickyCitySwitch />
      <Hero />
      <div
        key={transitionKey}
        className={cn(direction === 'left' ? 'city-enter-left' : 'city-enter-right')}
      >
        <Reveal>
          <AboutSection />
        </Reveal>
        <Reveal delay={60}>
          <EquipmentSection />
        </Reveal>
        <Reveal delay={60}>
          <ServicesSection />
        </Reveal>
        <Reveal delay={60}>
          <ReviewsSection />
        </Reveal>
        <Reveal delay={60}>
          <ContactCTA />
        </Reveal>
      </div>
    </>
  )
}

/* ── Общие части ─────────────────────────────────────────── */

function SectionHead({ num, title, lede }: { num: string; title: string; lede?: string }) {
  return (
    <header className="mb-14 lg:mb-20">
      <div className="section-mark">
        <span className="num">{num}</span>
        <span className="rule" />
      </div>
      <h2
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
        style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.5rem)' }}
      >
        {title}
      </h2>
      {lede && <p className="section-lede">{lede}</p>}
    </header>
  )
}

/* ── 01 · Студия ─────────────────────────────────────────── */

function AboutSection() {
  const { data } = useCityData()
  const { studio } = data

  return (
    <section id="studio" className="band">
      <div className="shell">
        <SectionHead num="01" title="Студия" lede={studio.description} />

        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 lg:col-span-7">
            <PhotoCarousel
              images={[...studio.images.studio]}
              alt={`${studio.city} — студия`}
              aspect="aspect-[16/10]"
            />
          </div>

          <div className="col-span-12 lg:col-span-5 flex flex-col justify-end gap-8">
            <div className="panel p-6 lg:p-8">
              <div className="datum"><span className="k">город</span><span className="v">{studio.city}</span></div>
              <div className="datum"><span className="k">адрес</span><span className="v text-right max-w-[16rem]">{studio.address}</span></div>
              <div className="datum"><span className="k">часы</span><span className="v">{studio.hours}</span></div>
              <div className="datum"><span className="k">телефон</span><a href={`tel:${studio.phone.replace(/\s/g, '')}`} className="v hover:text-signal transition-colors">{studio.phone}</a></div>
              <div className="datum"><span className="k">почта</span><a href={`mailto:${studio.email}`} className="v hover:text-signal transition-colors">{studio.email}</a></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Stat value="500+" label="треков" />
              <Stat value="7" label="лет" />
              <Stat value="24/7" label="связь" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t border-ash pt-4">
      <div className="font-display font-light text-2xl lg:text-3xl text-bone tracking-[-0.02em]">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mt-2">{label}</div>
    </div>
  )
}

/* ── 05 · Оборудование ─────────────────────────────────── */

function EquipmentSection() {
  const { data } = useCityData()
  const { equipment } = data

  return (
    <section id="equipment" className="band border-t border-ash">
      <div className="shell">
        <SectionHead
          num="05"
          title="Оборудование"
          lede="Только то, что действительно используется в сессиях. Без декоративных позиций."
        />

        <div className="space-y-14">
          {EQUIPMENT_CATEGORIES.map((cat, idx) => {
            const items = equipment.filter((e) => e.category === cat)
            if (items.length === 0) return null

            return (
              <div key={cat}>
                <div className="section-mark mb-6">
                  <span className="num">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/80">
                    {EQUIPMENT_LABELS[cat] ?? cat}
                  </span>
                  <span className="rule" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((item) => (
                    <EquipmentCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ── 06 · Услуги ──────────────────────────────────────── */

function ServicesSection() {
  const { data } = useCityData()
  const { services } = data

  return (
    <section id="services" className="band border-t border-ash">
      <div className="shell">
        <SectionHead
          num="06"
          title="Услуги"
          lede="Полный цикл — от идеи до мастера. Все цены указаны для выбранной студии."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>

        <div className="mt-10">
          <Link href="/bookings" className="btn btn-solid">
            Забронировать сессию
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ── 04 · Отзывы ──────────────────────────────────────── */

function ReviewsSection() {
  const { data } = useCityData()
  const { reviews } = data

  if (reviews.length === 0) return null

  return (
    <section id="reviews" className="band border-t border-ash">
      <div className="shell">
        <SectionHead num="04" title="Отзывы" lede="Что говорят артисты, с которыми мы работали. Без фильтра." />

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
          {reviews.map((r) => (
            <article key={r.id} className="border-t border-ash pt-6">
              <header className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full bg-slate border border-ash flex items-center justify-center font-mono text-[11px] uppercase text-bone/80" aria-hidden="true">
                    {r.userName.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm text-bone truncate">{r.userName}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone/35 mt-0.5">
                      {formatDate(r.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5" aria-label={`Оценка ${r.rating} из 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn('h-3 w-3', i < r.rating ? 'text-signal fill-current' : 'text-bone/15')}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </header>
              <blockquote className="text-[15px] leading-relaxed text-bone/75">{r.content}</blockquote>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return iso
  }
}

/* ── 08 · Записаться ────────────────────────────────── */

function ContactCTA() {
  const { data } = useCityData()
  const { studio } = data
  const { currentStudio } = useStudio()

  return (
    <section id="contacts" className="band border-t border-ash">
      <div className="shell">
        <div className="grid grid-cols-12 gap-x-6 gap-y-10 items-end">
          <div className="col-span-12 lg:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/40 mb-6">
              {currentStudio === 'moscow' ? 'мск' : 'спб'} · свободные слоты есть
            </p>
            <h2
              className="font-display font-light text-bone tracking-[-0.04em] leading-[0.92]"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)' }}
            >
              Записаться
            </h2>
          </div>

          <div className="col-span-12 lg:col-span-4 lg:pb-3">
            <Link
              href="/bookings"
              className="group inline-flex w-full items-center justify-between gap-4
                         border border-signal hover:bg-signal
                         rounded-md px-6 h-14
                         text-base text-bone hover:text-void
                         transition-colors duration-200
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
            >
              <span>Забронировать сессию</span>
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-12 gap-x-6 gap-y-4 border-t border-ash pt-6">
          <div className="col-span-12 sm:col-span-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35 mb-1">адрес</div>
            <div className="text-sm text-bone/80">{studio.address}</div>
          </div>
          <div className="col-span-6 sm:col-span-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35 mb-1">телефон</div>
            <a href={`tel:${studio.phone.replace(/\s/g, '')}`} className="text-sm text-bone/80 hover:text-signal transition-colors">
              {studio.phone}
            </a>
          </div>
          <div className="col-span-6 sm:col-span-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35 mb-1">часы</div>
            <div className="text-sm text-bone/80">{studio.hours}</div>
          </div>
        </div>
      </div>
    </section>
  )
}