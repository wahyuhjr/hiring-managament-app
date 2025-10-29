"use client"

import { MapPin, Banknote } from "lucide-react"
import Image from "next/image"

export function JobListCard({ job, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-teal-50 border-l-4 border-l-teal-500' 
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Logo/Icon */}
        <div className="w-10 h-10 rounded-md flex items-center justify-center">
          <Image 
            src="/logo-job.svg" 
            alt="Job Logo" 
            width={100} 
            height={100}
          />
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-1">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {job.department || 'Rakamin'}
          </p>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>Jakarta Selatan</span>
            </div>
            {job.salary_range && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Banknote className="h-3 w-3" />
                <span>{job.salary_range.display_text}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
