"use client"

import { useState, useEffect } from "react"
import { JobListCard } from "@/components/portal/JobListCard"
import { JobDetail } from "@/components/portal/JobDetail"
import { EmptyJobOpening } from "@/components/portal/EmptyJobOpening"
import { UserAvatar } from "@/components/ui/user-avatar"
import { PortalGuard } from "@/components/auth/Portal-guard"

export default function PortalPage() {
  return (
    <PortalGuard>
      <PortalContent />
    </PortalGuard>
  )
}

function PortalContent() {
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs?status=ACTIVE')
        const result = await response.json()
        
        if (result.success && result.data) {
          setJobs(result.data)
          if (result.data.length > 0) {
            setSelectedJob(result.data[0])
          }
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading jobs...</div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="text-xl font-bold text-teal-600">Rakamin</div>
              </div>
              
              <UserAvatar />
            </div>
          </div>
        </div>

        <EmptyJobOpening />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="text-xl font-bold text-teal-600">Rakamin</div>
            </div>
            
            <UserAvatar />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Available Jobs</h2>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {jobs.map((job) => (
                  <JobListCard
                    key={job.id}
                    job={job}
                    isSelected={selectedJob?.id === job.id}
                    onClick={() => setSelectedJob(job)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedJob ? (
              <JobDetail job={selectedJob} />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center text-gray-500">
                Select a job to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
