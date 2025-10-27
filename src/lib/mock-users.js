export const mockUsers = [
  {
    id: 'admin_001',
    name: 'Admin',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin',
    avatar: null
  },
  {
    id: 'user_001', 
    name: 'Wahyu Junior',
    email: 'user@demo.com',
    password: 'password123',
    role: 'applicant',
    avatar: null
  },
]

export function findUserByEmail(email) {
  return mockUsers.find(user => user.email === email)
}

export function validateCredentials(email, password) {
  const user = findUserByEmail(email)
  if (!user) return null
  
  if (user.password === password) {
    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }
  
  return null
}

