"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Banknote } from "lucide-react"

export function JobDetail({ job }) {
  const [jobDetail, setJobDetail] = useState(job)
  const [loading, setLoading] = useState(false)

  const fetchJobDetail = useCallback(async () => {
    if (!job?.id) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/jobs/${job.id}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setJobDetail(result.data)
      } else {
        setJobDetail(job)
      }
    } catch (error) {
      console.error('Error fetching job detail:', error)
      setJobDetail(job)
    } finally {
      setLoading(false)
    }
  }, [job?.id, job])

  useEffect(() => {
    if (job?.id) {
      fetchJobDetail()
    } else {
      setJobDetail(job)
    }
  }, [job?.id, job, fetchJobDetail])

  const handleApply = () => {
    window.location.href = `/portal/${jobDetail?.id || job?.id}/apply`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="text-center text-gray-500">Loading job details...</div>
        </div>
      </div>
    )
  }

  if (!jobDetail) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="text-center text-gray-500">No job details available</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-lg flex items-center justify-center">
              <Image 
                src="/logo-job.svg" 
                alt="Job Logo" 
                width={40} 
                height={40}
              />
            </div>

            {/* Job Title & Company */}
            <div>
              <div className="inline-block bg-[#43936C] text-white px-3 py-1 rounded-md text-sm font-semibold mb-2">
                Full-Time
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {jobDetail.title}
              </h1>
              <p className="text-lg text-gray-700">
                {jobDetail.department || 'Rakamin'}
              </p>
            </div>
          </div>

          {/* Apply Button */}
          <Button
            onClick={handleApply}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-2 rounded-lg font-bold"
          >
            Apply
          </Button>
        </div>

        {/* Job Details Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Jakarta Selatan</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Full-Time</span>
          </div>
          {jobDetail.salary_range && (
            <div className="flex items-center gap-2 text-gray-600">
              <Banknote className="h-4 w-4" />
              <span className="text-sm">{jobDetail.salary_range.display_text}</span>
            </div>
          )}
        </div>

        {/* Job Description */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Job Description
          </h2>
          <div className="text-gray-700 space-y-3">
            {jobDetail.description ? (
              <p className="whitespace-pre-line">{jobDetail.description}</p>
            ) : (
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Develop, test, and maintain responsive, high-performance web applications using modern front-end technologies.</li>
                <li>Collaborate with UI/UX designers to translate wireframes and prototypes into functional code.</li>
                <li>Integrate front-end components with APIs and backend services.</li>
                <li>Ensure cross-browser compatibility and optimize applications for maximum speed and scalability.</li>
                <li>Write clean, reusable, and maintainable code following best practices and coding standards.</li>
                <li>Participate in code reviews, contributing to continuous improvement and knowledge sharing.</li>
                <li>Troubleshoot and debug issues to improve usability and overall application quality.</li>
                <li>Stay updated with emerging front-end technologies and propose innovative solutions.</li>
                <li>Collaborate in Agile/Scrum ceremonies, contributing to sprint planning, estimation, and retrospectives.</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
