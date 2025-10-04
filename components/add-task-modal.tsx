"use client"

import type React from "react"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { DirectLoadForm } from "./direct-load-form"
import { IndirectLoadForm } from "./indirect-load-form"
import type { DirectLoadTiming, RetailerPortalSource, RetailerMailSource } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AddTaskModalProps {
  onTaskAdded: () => void
}

export function AddTaskModal({ onTaskAdded }: AddTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    retailer: "",
    day: "",
    loadType: "Direct load" as "Direct load" | "Indirect load",
    fileCount: 9,
    formats: { xlsx: 3, csv: 4, txt: 1, mail: 1 },
    ktRecordingLink: "",
    documentationLink: "",
    instructions: "",
    // Legacy fields for backward compatibility
    link: "",
    username: "",
    password: "",
  })

  const [directLoadTiming, setDirectLoadTiming] = useState<DirectLoadTiming>({
    istTime: "",
    estTime: "",
    sqlQuery: "",
  })

  const [indirectLoadSource, setIndirectLoadSource] = useState<"retailer portal" | "retailer mail">("retailer portal")
  const [retailerPortal, setRetailerPortal] = useState<RetailerPortalSource>({
    websiteLink: "",
    username: "",
    password: "",
  })
  const [retailerMail, setRetailerMail] = useState<RetailerMailSource>({
    mailFolder: "",
    mailId: "",
  })

  const [activeTab, setActiveTab] = useState("direct")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const taskData: any = {
        ...formData,
        files: [],
      }

      if (formData.loadType === "Direct load") {
        taskData.directLoadTiming = directLoadTiming
      } else {
        taskData.indirectLoadSource = indirectLoadSource
        if (indirectLoadSource === "retailer portal") {
          taskData.retailerPortal = retailerPortal
        } else {
          taskData.retailerMail = retailerMail
        }
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error("Failed to create task")
      }

      toast({
        title: "Task created",
        description: "New task has been added successfully",
      })

      // Reset form
      setFormData({
        retailer: "",
        day: "",
        loadType: "Direct load",
        fileCount: 9,
        formats: { xlsx: 3, csv: 4, txt: 1, mail: 1 },
        ktRecordingLink: "",
        documentationLink: "",
        instructions: "",
        link: "",
        username: "",
        password: "",
      })
      setDirectLoadTiming({ istTime: "", estTime: "", sqlQuery: "" })
      setRetailerPortal({ websiteLink: "", username: "", password: "" })
      setRetailerMail({ mailFolder: "", mailId: "" })

      setIsOpen(false)
      onTaskAdded()
    } catch (error) {
      toast({
        title: "Creation failed",
        description: "Unable to create task",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add Task</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">Add New Task</DialogTitle>
          </DialogHeader>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="retailer">Retailer Name</Label>
                  <Input
                    id="retailer"
                    value={formData.retailer}
                    onChange={(e) => setFormData({ ...formData, retailer: e.target.value })}
                    placeholder="e.g., Retailer-A"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="day">Schedule</Label>
                  <Select value={formData.day} onValueChange={(value) => setFormData({ ...formData, day: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Today's load">Today's load</SelectItem>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="loadType">Load Type</Label>
                <Select
                  value={formData.loadType}
                  onValueChange={(value: "Direct load" | "Indirect load") =>
                    setFormData({ ...formData, loadType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Direct load">Direct load</SelectItem>
                    <SelectItem value="Indirect load">Indirect load</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="direct" className="text-xs sm:text-sm">
                Direct Load
              </TabsTrigger>
              <TabsTrigger value="indirect" className="text-xs sm:text-sm">
                Indirect Load
              </TabsTrigger>
            </TabsList>

            {activeTab === "direct" && <DirectLoadForm data={directLoadTiming} onChange={setDirectLoadTiming} />}

            {activeTab === "indirect" && (
              <IndirectLoadForm
                source={indirectLoadSource}
                retailerPortal={retailerPortal}
                retailerMail={retailerMail}
                onSourceChange={setIndirectLoadSource}
                onRetailerPortalChange={setRetailerPortal}
                onRetailerMailChange={setRetailerMail}
              />
            )}
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ktRecordingLink">KT Recording Link</Label>
                <Input
                  id="ktRecordingLink"
                  type="url"
                  value={formData.ktRecordingLink}
                  onChange={(e) => setFormData({ ...formData, ktRecordingLink: e.target.value })}
                  placeholder="https://example.com/recording"
                />
              </div>
              <div>
                <Label htmlFor="documentationLink">Documentation Link</Label>
                <Input
                  id="documentationLink"
                  type="url"
                  value={formData.documentationLink}
                  onChange={(e) => setFormData({ ...formData, documentationLink: e.target.value })}
                  placeholder="https://example.com/docs"
                />
              </div>
              <div>
                <Label htmlFor="instructions">Task Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Add specific instructions for this task..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
