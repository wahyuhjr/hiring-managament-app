"use client"

import Image from "next/image"

export function EmptyJobOpening() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8 flex justify-center">
          <Image
            src="/no-job-opening-logo.svg"
            alt="No job openings"
            width={300}
            height={300}
            className="w-auto h-auto"
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            No job openings available
          </h2>
          <p className="text-gray-600">
            Please wait for the next batch of openings.
          </p>
        </div>
      </div>
    </div>
  )
}
