import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { apiError, handleApiError } from '@/lib/api-response'

const supabaseUrl = 'https://pjufmuhiarceoynrkiwj.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 10
    const offset = parseInt(searchParams.get('offset')) || 0
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const jobId = resolvedParams.id

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        apiError('Job not found', 404),
        { status: 404 }
      )
    }

    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', jobId)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    if (appsError) {
      throw appsError
    }

    const transformedApplications = applications.map((app) => {
      const formData = app.form_data || {}
      
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

    return NextResponse.json({
      success: true,
      data: transformedApplications
    })

  } catch (error) {
    return NextResponse.json(handleApiError(error), { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params
    const body = await request.json()

    const jobId = resolvedParams.id

    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, status, application_form')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
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

    if (job.application_form) {
      const formConfig = job.application_form
      const requiredFields = formConfig.fields
        .filter(field => field.validation && field.validation.required)
        .filter(field => {
          const photoKeys = ['photo_profile', 'photoprofile', 'photoprofile', 'photo', 'profile_photo', 'profilephoto', 'photo profile']
          const lowerKey = field.key.toLowerCase().replace(/\s+/g, '_').replace(/\s+/g, '')
          const normalizedKey = field.key.replace(/\s+/g, '_').toLowerCase()
          const fieldKeyLower = field.key.toLowerCase()
          
          const isPhotoField = photoKeys.some(key => 
            lowerKey === key.toLowerCase() || 
            normalizedKey === key.toLowerCase() ||
            fieldKeyLower === key.toLowerCase()
          ) || (fieldKeyLower.includes('photo') && fieldKeyLower.includes('profile'))
          
          return !isPhotoField
        })

      for (const field of requiredFields) {
        if (body[field.key] === undefined || body[field.key] === null || body[field.key].toString().trim() === '') {
          return NextResponse.json(
            apiError(`${field.label || field.key} is required`, 400),
            { status: 400 }
          )
        }
      }
    }

    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        form_data: body,
        status: 'PENDING'
      })
      .select()
      .single()

    if (appError) {
      throw appError
    }

    return NextResponse.json({
      success: true,
      message: 'Your application has been submitted successfully!',
      application_id: application.id
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json(handleApiError(error), { status: 500 })
  }
}