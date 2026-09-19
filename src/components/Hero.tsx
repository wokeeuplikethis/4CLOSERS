'use client'

import { motion } from 'framer-motion'
import { Play, Headphones, MapPin, Clock } from 'lucide-react'
import { getStudio } from '@/data/studios'
import { STUDIO_LABELS } from '@/types'
import { useStudio } from '@/components/StudioProvider'
import { cn } from '@/lib/utils'

interface HeroProps {
  initialStudio?: 'moscow' | 'spb'
}

export function Hero({ initialStudio = 'moscow' }: HeroProps) {
  const { currentStudio } = useStudio()
  const studio = getStudio(currentStudio)

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${studio.hero.image})` }}
          role="img"
          aria-label={studio.hero.alt}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-graphite-700/60 via-graphite-700/40 to-graphite-700/80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E')] animate-grain opacity-10" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-graphite-700 via-graphite-700/50 to-transparent" />
      </div>

      <motion.div
        className="relative z-10 container-custom px-4 py-20"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-caption font-medium text-accent tracking-wider">
              <span className="relative h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" aria-hidden="true" />
              {studio.city.toUpperCase()}
            </span>
          </motion.div>

          <motion.h1
            id="hero-title"
            variants={itemVariants}
            className="font-display text-hero font-bold tracking-tight text-white mb-8 text-balance"
            style={{ letterSpacing: '-0.03em' }}
          >
            ЗАПИШИ
            <br />
            <span className="text-gradient-accent">СВОЙ ЗВУК</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-display-sm font-medium text-graphite-100 mb-10 max-w-2xl mx-auto text-balance"
          >
            Профессиональная запись, сведение и мастеринг.{' '}
            <span className="text-accent">Ваш звук — наша миссия.</span>
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary group relative overflow-hidden px-10 py-4 text-lg"
            >
              <Play className="h-5 w-5 mr-2 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              ЗАПИСАТЬСЯ
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-secondary px-10 py-4 text-lg"
            >
              <Headphones className="h-5 w-5 mr-2" aria-hidden="true" />
              ПОСЛУШАТЬ РАБОТЫ
            </motion.button>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-body-sm text-graphite-200"
          >
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>{studio.address}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>{studio.hours}</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float"
          style={{ animationDuration: '3s' }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-graphite-300"
          >
            <svg
              className="h-6 w-6 text-accent/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-caption">ПРОКРУТИТЕ</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}