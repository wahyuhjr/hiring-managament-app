import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { apiError } from '@/lib/api-response'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password, role = 'APPLICANT' } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        apiError('Name, email, and password are required', 400),
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        apiError('Password must be at least 6 characters', 400),
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        apiError('User already exists with this email', 409),
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.toUpperCase()
      }
    })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        ...userWithoutPassword,
        role: userWithoutPassword.role.toLowerCase()
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      apiError('Internal server error', 500),
      { status: 500 }
    )
  }
}