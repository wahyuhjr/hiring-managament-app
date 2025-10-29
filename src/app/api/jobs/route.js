import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { apiError, handleApiError, jobListResponse } from '@/lib/api-response'

const supabaseUrl = 'https://pjufmuhiarceoynrkiwj.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit')) || 100
    const offset = parseInt(searchParams.get('offset')) || 0
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    let query = supabase
      .from('jobs')
      .select(`
        *,
        applications(count)
      `)

    if (status) {
      query = query.eq('status', status.toUpperCase())
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,department.ilike.%${search}%,description.ilike.%${search}%`)
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: jobs, error } = await query

    if (error) {
      throw error
    }

    const transformedJobs = jobs.map((job) => ({
      id: job.id,
      slug: job.slug,
      title: job.title,
      department: job.department,
      description: job.description,
      status: job.status.toLowerCase(),
      salary_range: {
        min: job.salary_min,
        max: job.salary_max,
        currency: job.currency,
        display_text: `Rp${job.salary_min.toLocaleString('id-ID')} - Rp${job.salary_max.toLocaleString('id-ID')}`
      },
      list_card: {
        badge: job.status === 'ACTIVE' ? 'Active' : job.status === 'DRAFT' ? 'Draft' : 'Inactive',
        started_on_text: `started on ${new Date(job.created_at).toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        })}`,
        cta: 'Manage Job'
      },
      _count: {
        applications: job.applications?.[0]?.count || 0
      },
      createdAt: job.created_at
    }))

    return NextResponse.json(jobListResponse(transformedJobs))

  } catch (error) {
    return NextResponse.json(handleApiError(error), { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    if (!body.title || !body.department || !body.description) {
      return NextResponse.json(
        apiError('Title, department, and description are required', 400),
        { status: 400 }
      )
    }

    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        slug,
        title: body.title,
        department: body.department,
        description: body.description,
        status: (body.status || 'DRAFT').toUpperCase(),
        salary_min: body.salary_min || 0,
        salary_max: body.salary_max || 0,
        currency: body.currency || 'IDR',
        application_form: body.application_form || null
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    const transformedJob = {
      id: job.id,
      slug: job.slug,
      title: job.title,
      department: job.department,
      description: job.description,
      status: job.status.toLowerCase(),
      salary_range: {
        min: job.salary_min,
        max: job.salary_max,
        currency: job.currency,
        display_text: `Rp${job.salary_min.toLocaleString('id-ID')} - Rp${job.salary_max.toLocaleString('id-ID')}`
      },
      list_card: {
        badge: job.status === 'ACTIVE' ? 'Active' : job.status === 'DRAFT' ? 'Draft' : 'Inactive',
        started_on_text: `started on ${new Date(job.created_at).toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        })}`,
        cta: 'Manage Job'
      },
      _count: {
        applications: 0
      },
      createdAt: job.created_at
    }

    return NextResponse.json({
      success: true,
      data: transformedJob
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json(handleApiError(error), { status: 500 })
  }
}

