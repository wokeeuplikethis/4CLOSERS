'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import {
  STUDIO_SLUGS,
  STUDIO_LABELS,
  type StudioSlug,
  type UserLite,
} from '@/types'

type Direction = 'left' | 'right'

interface StudioContextType {
  currentStudio: StudioSlug
  setCurrentStudio: (slug: StudioSlug) => void
  direction: Direction
  transitionKey: number
  mounted: boolean
  labels: typeof STUDIO_LABELS
  user: UserLite | null
  userLoading: boolean
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const StudioContext = createContext<StudioContextType>({
  currentStudio: 'moscow',
  setCurrentStudio: () => {},
  direction: 'right',
  transitionKey: 0,
  mounted: false,
  labels: STUDIO_LABELS,
  user: null,
  userLoading: true,
  refreshUser: async () => {},
  logout: async () => {},
})

const STORAGE_KEY = 'studio-slug'
const DEFAULT_STUDIO: StudioSlug = 'moscow'

export function StudioProvider({ children }: { children: ReactNode }) {
  const [currentStudio, setCurrentStudioState] = useState<StudioSlug>(DEFAULT_STUDIO)
  const [direction, setDirection] = useState<Direction>('right')
  const [transitionKey, setTransitionKey] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<UserLite | null>(null)
  const [userLoading, setUserLoading] = useState(true)

  // Гидрация города
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as StudioSlug | null
      if (saved && STUDIO_SLUGS.includes(saved) && saved !== currentStudio) {
        setCurrentStudioState(saved)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Загрузка пользователя
  const refreshUser = useCallback(async () => {
    setUserLoading(true)
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      const u = data?.user
      if (u) {
        setUser({
          id: u.id,
          role: (u.role as 'USER' | 'ADMIN') ?? 'USER',
          name: u.name ?? null,
          email: u.email ?? null,
          avatar: u.avatar ?? null,
        })
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setUserLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    setUser(null)
  }, [])

  const setCurrentStudio = useCallback(
    (slug: StudioSlug) => {
      if (slug === currentStudio) return
      const nextDirection: Direction = currentStudio === 'moscow' ? 'left' : 'right'
      setDirection(nextDirection)
      setCurrentStudioState(slug)
      setTransitionKey((k) => k + 1)
      try {
        localStorage.setItem(STORAGE_KEY, slug)
      } catch {}
    },
    [currentStudio]
  )

  return (
    <StudioContext.Provider
      value={{
        currentStudio,
        setCurrentStudio,
        direction,
        transitionKey,
        mounted,
        labels: STUDIO_LABELS,
        user,
        userLoading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </StudioContext.Provider>
  )
}

export function useStudio() {
  const ctx = useContext(StudioContext)
  if (!ctx) {
    throw new Error('useStudio must be used within a StudioProvider')
  }
  return ctx
}