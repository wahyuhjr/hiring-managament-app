'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store/auth'

export function AuthProvider({ children, session }) {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}