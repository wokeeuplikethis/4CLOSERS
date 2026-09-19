'use client'

import { Toaster } from 'sonner'
import { ThemeProvider } from 'next-themes'
import { StudioProvider } from '@/components/StudioProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <StudioProvider>
        {children}
        <Toaster position="bottom-right" theme="dark" className="bg-graphite-100 border-graphite-200/20" />
      </StudioProvider>
    </ThemeProvider>
  )
}