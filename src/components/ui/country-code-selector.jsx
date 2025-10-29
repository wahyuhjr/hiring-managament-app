"use client"

import { useState, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { countryCodes, defaultCountry } from "@/data/country-codes"
import { cn } from "@/lib/utils"

export function CountryCodeSelector({ value, onChange, className }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef(null)

  const selectedCountry = countryCodes.find(c => c.code === value) || defaultCountry

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

  const filteredCountries = countryCodes.filter(country =>
    country.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery)
  )

  const handleSelect = (country) => {
    onChange(country.code)
    setIsOpen(false)
    setSearchQuery("")
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 h-10 rounded-md border border-gray-300 bg-white",
          "hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2",
          "text-sm font-medium",
          className
        )}
      >
        <span className="text-lg">{selectedCountry.flag}</span>
        <span>{selectedCountry.code}</span>
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                autoFocus
              />
            </div>
          </div>

          {/* Country List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No results found
              </div>
            ) : (
              filteredCountries.map((country, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors",
                    "flex items-center gap-3",
                    value === country.code && "bg-teal-50"
                  )}
                >
                  <span className="text-lg flex-shrink-0">{country.flag}</span>
                  <span className="flex-1">{country.country}</span>
                  <span className="text-gray-600 font-medium">{country.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
