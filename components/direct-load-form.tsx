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

export function DirectLoadForm({ data, onChange }: DirectLoadFormProps) {
  const timeSlots = generateTimeSlots()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Load Timing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="istTime">IST Time (30 min slots)</Label>
            <Select value={data.istTime} onValueChange={(value) => onChange({ ...data, istTime: value })}>
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
            <Label htmlFor="estTime">EST Time (30 min slots)</Label>
            <Select value={data.estTime} onValueChange={(value) => onChange({ ...data, estTime: value })}>
              <SelectTrigger id="estTime">
                <SelectValue placeholder="Select EST time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeSlots.map((slot) => (
                  <SelectItem key={`est-${slot}`} value={slot}>
                    {slot} EST
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="sqlQuery">SQL Query (Optional)</Label>
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
