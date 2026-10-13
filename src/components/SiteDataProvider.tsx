'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useStudio } from '@/components/StudioProvider'
import type { StudioConfig, StudioSlug } from '@/types'

type StudiosMap = Record<StudioSlug, StudioConfig>

const SiteDataContext = createContext<StudiosMap | null>(null)

export function SiteDataProvider({
  value,
  children,
}: {
  value: StudiosMap
  children: ReactNode
}) {
  return (
    <SiteDataContext.Provider value={value}>
      {children}
    </SiteDataContext.Provider>
  )
}

export function useSiteData(): StudiosMap {
  const ctx = useContext(SiteDataContext)
  if (!ctx) throw new Error('useSiteData must be used within SiteDataProvider')
  return ctx
}

export function useCurrentStudio(): StudioConfig {
  const studios = useSiteData()
  const { currentStudio } = useStudio()
  return studios[currentStudio]
}