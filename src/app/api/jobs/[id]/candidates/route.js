import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { candidateListResponse, apiError, handleApiError } from '@/lib/api-response'

// GET /api/jobs/[id]/applications - Get applications for job
export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = parseInt(searchParams.get('offset')) || 0
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const job = await prisma.job.findUnique({
      where: { id: params.id }
    })

    if (!job) {
      return NextResponse.json(
        apiError('Job not found', 404),
        { status: 404 }
      )
    }

    const [applications, totalCount] = await Promise.all([
      prisma.application.findMany({
        where: { jobId: params.id },
        take: limit,
        skip: offset,
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.application.count({ where: { jobId: params.id } })
    ])

    // Transform applications to match exact PRD format
    const transformedApplications = applications.map((app) => {
      const formData = app.formData
      
      return {
        id: app.id,
        attributes: Object.entries(formData)
          .filter(([key, value]) => value && value.toString().trim() !== '')
          .map(([key, value], index) => ({
            key,
            label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: value.toString(),
            order: index + 1
          }))
          .sort((a, b) => {
            // Custom ordering for common fields
            const fieldOrder = {
              'full_name': 1,
              'email': 2,
              'phone_number': 3,
              'domicile': 4,
              'gender': 5,
              'linkedin_link': 6,
              'date_of_birth': 7
            }
            return (fieldOrder[a.key] || 999) - (fieldOrder[b.key] || 999)
          })
          .map((attr, index) => ({ ...attr, order: index + 1 }))
      }
    })

    return NextResponse.json(candidateListResponse(transformedApplications))

  } catch (error) {
    return NextResponse.json(handleApiError(error), { status: 500 })
  }
}

// POST /api/jobs/[id]/applications - Submit application  
export async function POST(request, { params }) {
  try {
    const body = await request.json()

    const job = await prisma.job.findUnique({
      where: { id: params.id }
    })

    if (!job) {
      return NextResponse.json(
        apiError('Job not found', 404),
        { status: 404 }
      )
    }

    if (job.status !== 'ACTIVE') {
      return NextResponse.json(
        apiError('Job is not accepting applications', 400),
        { status: 400 }
      )
    }

    // Validate required fields based on job's application form
    if (job.applicationForm) {
      const formConfig = job.applicationForm
      const requiredFields = formConfig.sections
        .flatMap(section => section.fields)
        .filter(field => field.validation.required)

      for (const field of requiredFields) {
        if (!body[field.key] || body[field.key].toString().trim() === '') {
          return NextResponse.json(
            apiError(`${field.label || field.key} is required`, 400),
            { status: 400 }
          )
        }
      }
    }

    const application = await prisma.application.create({
      data: {
        jobId: params.id,
        formData: body,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Your application has been submitted successfully!',
      application_id: application.id
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json(handleApiError(error), { status: 500 })
  }
}