'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useStudio } from '@/components/StudioProvider'
import type { Service, EquipmentItem, Artist, Review, StudioConfig } from '@/types'

export interface CityPayload {
  studio: StudioConfig
  services: Service[]
  equipment: EquipmentItem[]
  artists: Artist[]
  reviews: Review[]
}

export interface CityDataMap {
  moscow: CityPayload
  spb: CityPayload
}

interface CityDataContextValue {
  data: CityPayload
  all: CityDataMap
}

const CityDataContext = createContext<CityDataContextValue | null>(null)

export function CityDataProvider({
  value,
  children,
}: {
  value: CityDataMap
  children: ReactNode
}) {
  const { currentStudio } = useStudio()
  const data = value[currentStudio]

  return (
    <CityDataContext.Provider value={{ data, all: value }}>
      {children}
    </CityDataContext.Provider>
  )
}

export function useCityData() {
  const ctx = useContext(CityDataContext)
  if (!ctx) throw new Error('useCityData must be used within a CityDataProvider')
  return ctx
}