import { useState } from 'react'

interface AvailabilityCalendarProps {
  selectedDates?: string[] // YYYY-MM-DD
  onDatesChange?: (dates: string[]) => void
  readOnly?: boolean
  initialMonth?: number // 0-11
  initialYear?: number
}

export default function AvailabilityCalendar({
  selectedDates = [],
  onDatesChange,
  readOnly = false,
  initialMonth = 7, // August (0-indexed)
  initialYear = 2025,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const [currentYear, setCurrentYear] = useState(initialYear)
  const [dates, setDates] = useState<string[]>(selectedDates)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const formatDateStr = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${currentYear}-${m}-${d}`
  }

  const toggleDate = (day: number) => {
    if (readOnly) return
    const dateStr = formatDateStr(day)
    let newDates: string[]
    if (dates.includes(dateStr)) {
      newDates = dates.filter((d) => d !== dateStr)
    } else {
      newDates = [...dates, dateStr]
    }
    setDates(newDates)
    onDatesChange?.(newDates)
  }

  const selectPreset = (type: 'weekends' | 'week' | 'clear') => {
    if (readOnly) return
    let newDates = [...dates]
    if (type === 'clear') {
      newDates = []
    } else if (type === 'weekends') {
      const weekendDates: string[] = []
      for (let day = 1; day <= daysInMonth; day++) {
        const dayOfWeek = new Date(currentYear, currentMonth, day).getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          weekendDates.push(formatDateStr(day))
        }
      }
      newDates = Array.from(new Set([...dates, ...weekendDates]))
    } else if (type === 'week') {
      const allDays: string[] = []
      for (let day = 1; day <= Math.min(daysInMonth, 7); day++) {
        allDays.push(formatDateStr(day))
      }
      newDates = Array.from(new Set([...dates, ...allDays]))
    }
    setDates(newDates)
    onDatesChange?.(newDates)
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E4E7E5] p-4 shadow-sm">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <h4 className="font-700 text-[#141B18] text-sm" style={{ fontFamily: 'Fraunces, serif' }}>
            {monthNames[currentMonth]} {currentYear}
          </h4>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-7 h-7 rounded-lg border border-[#E4E7E5] hover:bg-[#F7F6F2] text-xs flex items-center justify-center transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-7 h-7 rounded-lg border border-[#E4E7E5] hover:bg-[#F7F6F2] text-xs flex items-center justify-center transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-[11px] font-600 text-[#7B8582] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Empty slots for start of month */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8" />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = formatDateStr(day)
          const isSelected = dates.includes(dateStr)

          return (
            <button
              key={day}
              type="button"
              disabled={readOnly}
              onClick={() => toggleDate(day)}
              className={`h-8 rounded-lg text-xs font-600 transition-all flex items-center justify-center ${
                isSelected
                  ? 'bg-[#0F6E5C] text-white shadow-xs font-700'
                  : 'text-[#141B18] hover:bg-[#E4F3EF] hover:text-[#0F6E5C]'
              } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend & Presets */}
      <div className="mt-4 pt-3 border-t border-[#E4E7E5] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0F6E5C]" />
            <span className="text-[#7B8582]">Available ({dates.length} days)</span>
          </div>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => selectPreset('weekends')}
              className="px-2 py-1 text-[11px] font-600 bg-[#F7F6F2] hover:bg-[#E4F3EF] hover:text-[#0F6E5C] rounded-md transition-colors"
            >
              + Weekends
            </button>
            <button
              type="button"
              onClick={() => selectPreset('clear')}
              className="px-2 py-1 text-[11px] font-600 text-[#D64545] hover:bg-[#FBE6E6] rounded-md transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
