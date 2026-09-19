import { Metadata } from 'next'
import Link from 'next/link'
import { Music, Users, Star, Play, Mic2, Waves, Zap, Sparkles, Headphones, Phone, Mail, Clock, Calendar, CheckCircle2, ChevronRight } from 'lucide-react'
import { getStudio } from '@/data/studios'
import { getServices } from '@/data/services'
import { getPortfolio } from '@/data/portfolio'
import { getReviews } from '@/data/reviews'
import { getEquipment } from '@/data/equipment'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { Footer } from '@/components/Footer'
import { StudioProvider } from '@/components/StudioProvider'


export const metadata: Metadata = {
  title: 'Профессиональная запись, сведение и мастеринг',
  description: 'Студия звукозаписи 4CLOSERS. Москва и Санкт-Петербург. Запись вокала и рэпа, сведение, мастеринг, автотюн, продакшн, саунд-дизайн.',
}

export default function HomePage() {
  return (
    <StudioProvider>
      <Header />
      <main id="main-content" className="flex-1" role="main">
        <Hero />
        <AboutSection />
        <ServicesSection />
        <PortfolioSection />
        <ReviewsSection />
        <EquipmentSection />
        <FAQSection />
        <ContactCTA />
      </main>
      <Footer />
    </StudioProvider>
  )
}

function AboutSection() {
  return (
    <section id="studio" className="section relative overflow-hidden" aria-labelledby="studio-heading">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>
      <div className="container-custom">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="studio-heading" className="font-display text-display-lg font-bold text-white mb-6">
            О СТУДИИ
          </h2>
          <p className="text-body-lg text-graphite-200">
            Два филиала, одно качество. Премиальное оборудование, атмосфера для творчества и команда, которая понимает ваш звук.
          </p>
        </header>
        <AboutContent />
      </div>
    </section>
  )
}

function AboutContent() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {[
        {
          title: '500+',
          desc: 'записанных треков',
          note: 'От андеграунда до чартов.',
        },
        {
          title: '7 лет',
          desc: 'опыта',
          note: 'Работаем с 2018 года.',
        },
        {
          title: '24/7',
          desc: 'поддержка',
          note: 'Всегда на связи с клиентами.',
        },
      ].map((stat) => (
        <article key={stat.title} className="card-hover p-8 text-center">
          <div className="font-display text-5xl font-bold text-gradient-accent mb-3">{stat.title}</div>
          <h3 className="font-display text-xl font-bold text-white mb-2">{stat.desc}</h3>
          <p className="text-body-sm text-graphite-300">{stat.note}</p>
        </article>
      ))}
    </div>
  )
}

function ServicesSection() {
  // Client component would use useStudio hook; here we show static demo
  const studio = getStudio('moscow')
  const services = getServices('moscow')

  const icons = [Mic2, Waves, Zap, Sparkles, Headphones, Music, Users]
  return (
    <section id="services" className="section bg-graphite-100/20" aria-labelledby="services-heading">
      <div className="container-custom">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="services-heading" className="font-display text-display-lg font-bold text-white mb-6">УСЛУГИ</h2>
          <p className="text-body-lg text-graphite-200">Полный цикл производства звука — от идеи до готового релиза.</p>
        </header>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
          {services.map((service, i) => {
            const Icon = icons[i % icons.length]
            return (
              <article key={service.slug} className="card-hover p-6 group relative overflow-hidden" role="listitem">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl group-hover:bg-accent/10 transition-all" aria-hidden="true" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300 shrink-0">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">{service.name}</h3>
                    <p className="text-body text-graphite-200 mb-3">{service.description}</p>
                    <div className="flex items-center gap-4 text-body-sm">
                      <span className="text-accent font-bold">{service.price}₽</span>
                      <span className="text-graphite-300">· {service.duration} мин</span>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
        <div className="text-center mt-12">
          <Link href="/bookings" className="btn-primary inline-flex">Записаться на сессию</Link>
        </div>
      </div>
    </section>
  )
}

function PortfolioSection() {
  const portfolio = getPortfolio('moscow')
  return (
    <section id="portfolio" className="section" aria-labelledby="portfolio-heading">
      <div className="container-custom">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="portfolio-heading" className="font-display text-display-lg font-bold text-white mb-6">ПОРТФОЛИО</h2>
          <p className="text-body-lg text-graphite-200">Работы, в которых мы гордимся. От андеграунда до чартов.</p>
        </header>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portfolio.map((item) => (
            <article key={item.id} className="card-hover group overflow-hidden" role="listitem">
              <a href="#" className="block relative aspect-[4/5] overflow-hidden bg-graphite-200/10">
                <img
                  src={item.coverImage}
                  alt={`${item.artist} — ${item.trackTitle}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-display text-lg font-bold text-white mb-1">{item.trackTitle}</h3>
                  <p className="text-body-sm text-graphite-200">{item.artist} · {item.genre}</p>
                </div>
                <div className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ReviewsSection() {
  const reviews = getReviews('moscow')
  return (
    <section id="reviews" className="section bg-graphite-100/20" aria-labelledby="reviews-heading">
      <div className="container-custom max-w-4xl">
        <header className="text-center mb-12">
          <h2 id="reviews-heading" className="font-display text-display-lg font-bold text-white mb-4">ОТЗЫВЫ</h2>
          <p className="text-body-lg text-graphite-200">Что говорят артисты о нашей работе.</p>
        </header>
        <div className="grid md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <article key={review.id} className="card p-6 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-white text-sm font-bold">
                  {review.userName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-white text-sm">{review.userName}</h3>
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-accent fill-current" aria-hidden="true" />
                    ))}
                  </div>
                </div>
              </div>
              <blockquote className="text-body-sm text-graphite-200 leading-relaxed">"{review.content}"</blockquote>
              <time className="text-caption text-graphite-400 mt-4 block">{review.createdAt}</time>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function EquipmentSection() {
  const categories = ['Microphones', 'Preamps', 'Audio Interfaces', 'Monitors', 'Outboard']
  const equipment = getEquipment('moscow')

  return (
    <section id="equipment" className="section" aria-labelledby="equipment-heading">
      <div className="container-custom">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="equipment-heading" className="font-display text-display-lg font-bold text-white mb-6">ОБОРУДОВАНИЕ</h2>
          <p className="text-body-lg text-graphite-200">Только премиальное железо. Микрофоны, преампы, мониторы и outboard.</p>
        </header>
        <div className="space-y-12">
          {categories.map((cat, idx) => (
            <div key={cat} className="border-t border-graphite-200/10 pt-8 first:border-t-0 first:pt-0">
              <h3 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-caption text-accent font-mono">0{idx + 1}</span>
                {cat}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {equipment.filter(e => e.category === cat).map((item) => (
                  <article key={item.id} className="card p-5 hover:border-accent/20 transition-colors group">
                    <h4 className="font-display text-base font-bold text-white mb-1 group-hover:text-accent transition-colors">{item.name}</h4>
                    <p className="text-caption text-graphite-300 mb-2">{item.model}</p>
                    <p className="text-body-sm text-graphite-200">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const faqItems = [
    { q: 'Сколько стоит запись?', a: 'Цены зависят от услуги. Запись вокала/рэпа — от 6500₽/2ч, сведение — от 14000₽, мастеринг — от 7500₽.' },
    { q: 'Можно ли записаться ночью?', a: 'Да! Москва работает до 02:00, СПБ — до 03:00. Ночные сессии популярны у артистов.' },
    { q: 'Можно ли прийти со своим битом?', a: 'Конечно! Приносите бит в WAV/MP3. Инженер адаптирует под ваш флоу.' },
    { q: 'Делаете ли вы автотюн?', a: 'Да — от невидимого тюнинга в Melodyne до креативного эффекта в стиле Travis Scott.' },
    { q: 'Можно ли записаться без опыта?', a: 'Да! Многие наши клиенты записывали первый трек именно у нас.' },
  ]

  return (
    <section id="faq" className="section bg-graphite-100/20" aria-labelledby="faq-heading">
      <div className="container-custom max-w-3xl">
        <header className="text-center mb-12">
          <h2 id="faq-heading" className="font-display text-display-lg font-bold text-white mb-4">FAQ</h2>
          <p className="text-body-lg text-graphite-200">Ответы на частые вопросы. Не нашли свой — напишите нам.</p>
        </header>
        <dl className="space-y-4" role="list">
          {faqItems.map((item, i) => (
            <div key={i} className="card p-6 group">
              <dt className="font-display text-base font-bold text-white flex items-center justify-between gap-4">
                {item.q}
                <ChevronRight className="h-5 w-5 text-graphite-300 group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" aria-hidden="true" />
              </dt>
              <dd className="mt-3 text-body text-graphite-200">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function ContactCTA() {
  const studio = getStudio('moscow')
  return (
    <section id="contacts" className="section relative overflow-hidden" aria-label="Контакты">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-accent/10 rounded-full blur-[150px]" />
      </div>
      <div className="container-custom max-w-2xl text-center">
        <h2 className="font-display text-display-xl lg:text-5xl font-bold text-white mb-6">ГОТОВ ЗАПИСАТЬСЯ?</h2>
        <p className="text-body-lg text-graphite-200 mb-4">Студия <span className="text-accent">{studio.city}</span> · {studio.address}</p>
        <p className="text-body text-graphite-300 mb-8">Запишись сегодня — и завтра твой трек зазвучит по-новому.</p>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <a href={`tel:${studio.phone}`} className="inline-flex items-center gap-2 rounded-lg bg-graphite-200/10 border border-graphite-200/20 px-5 py-3 text-body font-medium text-graphite-100 hover:border-accent/50 hover:text-white transition-all">
            <Phone className="h-4 w-4 text-accent" /> {studio.phone}
          </a>
          <a href={`mailto:${studio.email}`} className="inline-flex items-center gap-2 rounded-lg bg-graphite-200/10 border border-graphite-200/20 px-5 py-3 text-body font-medium text-graphite-100 hover:border-accent/50 hover:text-white transition-all">
            <Mail className="h-4 w-4 text-accent" /> {studio.email}
          </a>
          <span className="inline-flex items-center gap-2 rounded-lg bg-graphite-200/10 border border-graphite-200/20 px-5 py-3 text-body font-medium text-graphite-100">
            <Clock className="h-4 w-4 text-accent" /> {studio.hours}
          </span>
        </div>
        <Link href="/bookings" className="btn-primary text-xl px-12 py-5 inline-flex">Записаться</Link>
      </div>
    </section>
  )
}
