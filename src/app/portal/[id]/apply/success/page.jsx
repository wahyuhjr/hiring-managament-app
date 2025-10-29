"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { PortalGuard } from "@/components/auth/Portal-guard"

export default function SuccessPage({ params }) {
  return (
    <PortalGuard>
      <SuccessContent params={params} />
    </PortalGuard>
  )
}

function SuccessContent({ params }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [job, setJob] = useState(null)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${resolvedParams.id}`)
        const result = await response.json()
        if (result.success && result.data) {
          setJob(result.data)
        }
      } catch (error) {
        console.error('Error fetching job:', error)
      }
    }
    fetchJob()
  }, [resolvedParams.id])

  const handleViewJobDetails = () => {
    router.push('/portal')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/success.svg"
            alt="Success illustration"
            width={300}
            height={300}
            className="w-auto h-auto max-w-[300px]"
            priority
          />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xl">🎉</span>
            <h1 className="text-2xl font-bold text-gray-900">
              Your application was sent!
            </h1>
          </div>
          
          <div className="space-y-2 text-gray-700 text-base">
            <p>
              Congratulations! You&apos;ve taken the first step towards a rewarding career at Rakamin.
            </p>
            <p>
              We look forward to learning more about you during the application process.
            </p>
          </div>
        </div>

        <Button
          onClick={handleViewJobDetails}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2"
        >
          View Job Details
        </Button>
      </div>
    </div>
  )
}

