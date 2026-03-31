"use client"

import { useEffect, useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimePickerInputProps {
  value: string
  onChange: (value: string) => void
  id?: string
  required?: boolean
  min?: string
  max?: string
}

export function TimePickerInput({ value, onChange, id, required, min, max }: TimePickerInputProps) {
  const [internalValue, setInternalValue] = useState(value)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  // Calculate filtered options based on min/max
  const filteredOptions = useMemo(() => {
    const timeOptions: string[] = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        timeOptions.push(timeStr)
      }
    }

    // Filter options based on min/max
    if (min && max) {
      if (min <= max) {
        // Normal case: 07:00-17:00
        return timeOptions.filter(time => time >= min && time <= max)
      } else {
        // Midnight crossing case: 17:00-07:00
        return timeOptions.filter(time => time >= min || time <= max)
      }
    }

    return timeOptions
  }, [min, max])

  const handleChange = (newValue: string) => {
    setInternalValue(newValue)
    onChange(newValue)
  }

  return (
    <Select value={internalValue || undefined} onValueChange={handleChange} required={required}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Sélectionner l'heure" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {filteredOptions.map((time) => (
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
