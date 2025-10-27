'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth'

export function AuthGuard({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/signin')
      return
    }

    if (requireAdmin && !isAdmin()) {
      router.push('/')
      return
    }
  }, [isAuthenticated, isAdmin, requireAdmin, router])

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    )
  }

  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    )
  }

  return children
}