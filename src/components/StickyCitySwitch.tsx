'use client'

import { useEffect, useState } from 'react'
import { CitySwitch } from '@/components/CitySwitch'
import { cn } from '@/lib/utils'

export function StickyCitySwitch() {
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    const onScroll = () => setPinned(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={cn(
        'sticky top-16 z-40 flex justify-center py-4 transition-colors duration-300',
        pinned
          ? 'bg-void/80 backdrop-blur-xl border-b border-ash'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <CitySwitch />
    </div>
  )
}