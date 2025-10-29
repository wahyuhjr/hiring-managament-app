"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function DatePicker({ value, onChange, placeholder, className }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      return new Date(value)
    }
    return new Date()
  })
  const pickerRef = useRef(null)

  useEffect(() => {
    if (value) {
      const date = typeof value === 'string' ? new Date(value + 'T00:00:00') : new Date(value)
      setCurrentMonth(date)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const formatDate = (date) => {
    if (!date) return ""
    const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date)
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    })
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isOtherMonth: true,
      })
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day)
      let isSelected = false
      
      if (value) {
        const selectedDate = typeof value === 'string' ? new Date(value + 'T00:00:00') : new Date(value)
        isSelected = 
          selectedDate.getFullYear() === dateObj.getFullYear() &&
          selectedDate.getMonth() === dateObj.getMonth() &&
          selectedDate.getDate() === dateObj.getDate()
      }
      
      days.push({
        date: day,
        isCurrentMonth: true,
        isOtherMonth: false,
        dateObj,
        isSelected,
      })
    }

    const totalCells = 42
    const remainingDays = totalCells - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        isOtherMonth: true,
      })
    }

    return days.slice(0, 35) // Show 5 weeks
  }

  const handleDateSelect = (day) => {
    if (!day.dateObj) return
    
    const newDate = day.dateObj.toISOString().split("T")[0]
    onChange(newDate)
    setIsOpen(false)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const goToPreviousYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1))
  }

  const goToNextYear = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1))
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"]

  return (
    <div ref={pickerRef} className="relative">
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          readOnly
          value={value ? formatDate(value) : ""}
          placeholder={placeholder}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 pl-10 py-2 text-sm",
            "ring-offset-white placeholder:text-gray-500",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "cursor-pointer",
            className
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousYear}
                className="p-1 hover:bg-gray-100 rounded"
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-3" />
              </button>
              <button
                onClick={goToPreviousMonth}
                className="p-1 hover:bg-gray-100 rounded"
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            
            <div className="font-semibold text-gray-900">
              {formatMonthYear(currentMonth)}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={goToNextMonth}
                className="p-1 hover:bg-gray-100 rounded"
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={goToNextYear}
                className="p-1 hover:bg-gray-100 rounded"
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-3" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, idx) => (
              <div
                key={idx}
                className="text-center text-sm font-semibold text-gray-900 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => (
              <button
                key={idx}
                onClick={() => handleDateSelect(day)}
                type="button"
                className={cn(
                  "h-10 w-10 flex items-center justify-center rounded-full text-sm",
                  "hover:bg-gray-100 transition-colors",
                  day.isOtherMonth && "text-gray-400",
                  day.isCurrentMonth && !day.isSelected && "text-gray-900",
                  day.isSelected && "bg-orange-500 text-white font-semibold hover:bg-orange-600 ring-2 ring-orange-500"
                )}
                disabled={!day.isCurrentMonth || !day.dateObj}
              >
                {day.date}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
