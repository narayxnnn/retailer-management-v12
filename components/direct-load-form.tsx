"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DirectLoadTiming } from "@/lib/types"

interface DirectLoadFormProps {
  data: DirectLoadTiming
  onChange: (data: DirectLoadTiming) => void
}

// Generate 30-minute time slots
const generateTimeSlots = () => {
  const slots: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      slots.push(time)
    }
  }
  return slots
}

// Convert IST to EST
// IST is UTC+5:30, EST is UTC-5:00
// Difference: IST - EST = 10 hours 30 minutes
const convertISTtoEST = (istTime: string): string => {
  if (!istTime) return ""
  
  const [hours, minutes] = istTime.split(":").map(Number)
  
  // Convert IST to minutes
  let totalMinutes = hours * 60 + minutes
  
  // Subtract 10 hours 30 minutes (630 minutes)
  totalMinutes -= 630
  
  // Handle negative values (previous day)
  if (totalMinutes < 0) {
    totalMinutes += 1440 // Add 24 hours in minutes
  }
  
  // Convert back to hours and minutes
  const estHours = Math.floor(totalMinutes / 60) % 24
  const estMinutes = totalMinutes % 60
  
  return `${estHours.toString().padStart(2, "0")}:${estMinutes.toString().padStart(2, "0")}`
}

export function DirectLoadForm({ data, onChange }: DirectLoadFormProps) {
  const timeSlots = generateTimeSlots()

  const handleISTChange = (value: string) => {
    const estTime = convertISTtoEST(value)
    onChange({ ...data, istTime: value, estTime })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Load Timing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="istTime" className="mb-1.5">IST Time (30 min slots)</Label>
            <Select value={data.istTime} onValueChange={handleISTChange}>
              <SelectTrigger id="istTime">
                <SelectValue placeholder="Select IST time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeSlots.map((slot) => (
                  <SelectItem key={`ist-${slot}`} value={slot}>
                    {slot} IST
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="estTime" className="mb-1.5">EST Time (30 min slots)</Label>
            <Select value={data.estTime} onValueChange={(value) => onChange({ ...data, estTime: value })} disabled>
              <SelectTrigger id="estTime">
                <SelectValue placeholder="Calculated EST" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeSlots.map((slot) => (
                  <SelectItem key={`est-${slot}`} value={slot}>
                    {slot} EST
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* {data.estTime && (
              <p className="text-xs text-gray-500 mt-1">Auto-calculated: {data.estTime} EST</p>
            )} */}
          </div>
        </div>
        <div>
          <Label htmlFor="sqlQuery" className="mb-1.5">SQL Query (Optional)</Label>
          <Textarea
            id="sqlQuery"
            placeholder="Enter SQL query if applicable..."
            value={data.sqlQuery || ""}
            onChange={(e) => onChange({ ...data, sqlQuery: e.target.value })}
            rows={4}
            className="font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  )
}