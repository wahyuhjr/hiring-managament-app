"use client"

import { useState, useRef, useEffect } from "react"
import { indonesiaRegions } from "@/data/indonesia-regions"
import { cn } from "@/lib/utils"

export function DomicileDropdown({ value, onChange, placeholder, className, onBlur }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const allOptions = indonesiaRegions.flatMap(region =>
    region.cities.map(city => `${city} - ${region.province}`)
  )

  const filteredOptions = allOptions.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (option) => {
    onChange(option)
    setIsOpen(false)
    setSearchQuery("")
  }

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <input
          type="text"
          readOnly
          value={value || ""}
          placeholder={placeholder}
          onClick={() => setIsOpen(!isOpen)}
          onBlur={onBlur}
          className={cn(
            "flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm",
            "ring-offset-white placeholder:text-gray-500",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "cursor-pointer pr-10",
            className
          )}
        />
        <svg 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-80 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              autoFocus
            />
          </div>

          {/* Options list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No results found
              </div>
            ) : (
              filteredOptions.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors",
                    "flex items-center gap-2",
                    value === option && "bg-teal-50"
                  )}
                >
                  {value === option && (
                    <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                  )}
                  <span className={cn(value === option && "font-medium")}>
                    {option}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
