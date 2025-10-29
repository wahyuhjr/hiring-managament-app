import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { apiError, handleApiError } from '@/lib/api-response'

const supabaseUrl = 'https://pjufmuhiarceoynrkiwj.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const jobId = resolvedParams.id

    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        applications(count)
      `)
      .eq('id', jobId)
      .single()

    if (error) {
      throw error
    }

    if (!job) {
      return NextResponse.json(
        apiError('Job not found', 404),
        { status: 404 }
      )
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
        applications: job.applications?.[0]?.count || 0
      },
      createdAt: job.created_at
    }

    return NextResponse.json({
      success: true,
      data: transformedJob
    })

  } catch (error) {
    return NextResponse.json(handleApiError(error), { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params
    const jobId = resolvedParams.id
    const body = await request.json()
    
    const { status } = body

    if (!status) {
      return NextResponse.json(
        apiError('Status is required', 400),
        { status: 400 }
      )
    }

    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .single()

    if (fetchError || !existingJob) {
      return NextResponse.json(
        apiError('Job not found', 404),
        { status: 404 }
      )
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .update({ 
        status: status.toUpperCase(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: {
        id: job.id,
        status: job.status.toLowerCase()
      }
    })

  } catch (error) {
    return NextResponse.json(handleApiError(error), { status: 500 })
  }
}