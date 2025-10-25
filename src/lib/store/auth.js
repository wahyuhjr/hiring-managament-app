import { create } from 'zustand'

export const useAuthStore = create((set, get) => ({
  role: null,
  setRole: (role) => set({ role }),
  isAdmin: () => get().role === 'admin',
  isApplicant: () => get().role === 'applicant',
}))