'use client'

import { Toaster } from 'sonner'
import { ThemeProvider } from 'next-themes'
import { StudioProvider } from '@/components/StudioProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <StudioProvider>
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#141416',
              border: '1px solid #2A2A2E',
              color: '#E8E6E1',
              borderRadius: '10px',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </StudioProvider>
    </ThemeProvider>
  )
}