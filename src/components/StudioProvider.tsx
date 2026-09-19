'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { STUDIO_SLUGS, type StudioSlug, STUDIO_LABELS } from '@/types'

interface StudioContextType {
  currentStudio: StudioSlug
  setCurrentStudio: (slug: StudioSlug) => void
  labels: typeof STUDIO_LABELS
}

const StudioContext = createContext<StudioContextType>({
  currentStudio: 'moscow',
  setCurrentStudio: () => {},
  labels: STUDIO_LABELS,
})

export function StudioProvider({ children }: { children: ReactNode }) {
  const [currentStudio, setCurrentStudioState] = useState<StudioSlug>('moscow')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('studio-slug') as StudioSlug | null
    if (saved && STUDIO_SLUGS.includes(saved)) {
      setCurrentStudioState(saved)
    }
  }, [])

  const setCurrentStudio = (slug: StudioSlug) => {
    setCurrentStudioState(slug)
    localStorage.setItem('studio-slug', slug)
  }

  return (
    <StudioContext.Provider value={{ currentStudio, setCurrentStudio, labels: STUDIO_LABELS }}>
      {children}
    </StudioContext.Provider>
  )
}

export function useStudio() {
  const context = useContext(StudioContext)
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider')
  }
  return context
}