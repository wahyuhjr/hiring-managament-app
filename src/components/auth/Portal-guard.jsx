"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function PortalGuard({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not logged in, redirect to login
        router.push("/auth/login")
      } else if (user.user_metadata?.is_admin) {
        // Admin user, redirect to admin panel
        router.push("/admin/jobs")
      }
      // Regular user stays on portal
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (user.user_metadata?.is_admin) {
    return null // Will redirect to admin
  }

  return children
}
