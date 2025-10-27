import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { validateCredentials } from '@/lib/mock-users'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      
      // Login with mock data
      login: async (email, password) => {
        set({ loading: true })
        
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800))
          
          const user = validateCredentials(email, password)
          
          if (user) {
            set({ user, loading: false })
            return { success: true }
          } else {
            set({ loading: false })
            return { success: false, error: 'Email atau kata sandi salah' }
          }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: 'Terjadi kesalahan sistem' }
        }
      },

      // Logout
      logout: () => {
        set({ user: null })
      },

      // Helper methods
      isAuthenticated: () => !!get().user,
      isAdmin: () => get().user?.role === 'admin',
      isApplicant: () => get().user?.role === 'applicant',
      getCurrentUser: () => get().user,
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({ user: state.user }), // Only persist user data
    }
  )
)