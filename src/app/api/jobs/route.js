import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jobListResponse, apiError, handleApiError } from '@/lib/api-response'

// GET /api/jobs - List all jobs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = parseInt(searchParams.get('offset')) || 0

    const where = {}
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { applications: true }
          }
        }
      }),
      prisma.job.count({ where })
    ])

    // Transform jobs to match exact PRD format
    const transformedJobs = jobs.map(job => ({
      id: job.id,
      slug: job.slug,
      title: job.title,
      status: job.status.toLowerCase(),
      salary_range: {
        min: job.salaryMin,
        max: job.salaryMax,
        currency: job.currency,
        display_text: `Rp${job.salaryMin.toLocaleString('id-ID')} - Rp${job.salaryMax.toLocaleString('id-ID')}`
      },
      list_card: {
        badge: job.status === 'ACTIVE' ? 'Active' : job.status === 'DRAFT' ? 'Draft' : 'Inactive',
        started_on_text: `started on ${job.createdAt.toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        })}`,
        cta: 'Manage Job'
      }
    }))

    // Return exact format as PRD
    const response = jobListResponse(transformedJobs)
    
    // Add pagination if needed
    if (limit && offset !== undefined) {
      response.pagination = {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    return NextResponse.json(handleApiError(error), { status: 500 })
  }
}

// POST /api/jobs - Create new job
export async function POST(request) {
  try {
    const body = await request.json()
    
    const {
      title,
      description,
      department,
      status = 'DRAFT',
      salary_min,
      salary_max,
      currency = 'IDR',
      application_form
    } = body

    // Validation
    if (!title || !department || !salary_min || !salary_max) {
      return NextResponse.json(
        apiError('Missing required fields', 400),
        { status: 400 }
      )
    }

    if (salary_max < salary_min) {
      return NextResponse.json(
        apiError('Maximum salary must be greater than minimum salary', 400),
        { status: 400 }
      )
    }

    // Generate unique slug
    const baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    let slug = baseSlug
    let counter = 1
    
    while (await prisma.job.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const job = await prisma.job.create({
      data: {
        title,
        slug,
        description,
        department,
        status: status.toUpperCase(),
        salaryMin: salary_min,
        salaryMax: salary_max,
        currency,
        applicationForm: application_form || null
      }
    })

    // Transform response to match PRD format
    const transformedJob = {
      id: job.id,
      slug: job.slug,
      title: job.title,
      status: job.status.toLowerCase(),
      salary_range: {
        min: job.salaryMin,
        max: job.salaryMax,
        currency: job.currency,
        display_text: `Rp${job.salaryMin.toLocaleString('id-ID')} - Rp${job.salaryMax.toLocaleString('id-ID')}`
      },
      list_card: {
        badge: job.status === 'ACTIVE' ? 'Active' : job.status === 'DRAFT' ? 'Draft' : 'Inactive',
        started_on_text: `started on ${job.createdAt.toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        })}`,
        cta: 'Manage Job'
      }
    }

    return NextResponse.json(transformedJob, { status: 201 })

  } catch (error) {
    return NextResponse.json(handleApiError(error), { status: 500 })
  }
}

