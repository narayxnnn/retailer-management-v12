"use client"

import { useState, useEffect } from "react"
import { X, Copy, ExternalLink, Play, Save, Trash2, Plus, Clock, Database, Mail, Globe } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Task, TaskFile } from "@/lib/types"

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

export function TaskDetailModal({ task, isOpen, onClose, onUpdate }: TaskDetailModalProps) {
  const [files, setFiles] = useState<TaskFile[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (task) {
      setFiles(task.files || [])
      setIsCompleted(task.completed || false)
      setNotes("")
    }
  }, [task])

  if (!task) return null

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied successfully",
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const addFile = () => {
    setFiles([...files, { downloadName: "", requiredName: "" }])
  }

  const updateFile = (index: number, field: keyof TaskFile, value: string) => {
    const updatedFiles = [...files]
    updatedFiles[index] = { ...updatedFiles[index], [field]: value }
    setFiles(updatedFiles)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files,
          completed: isCompleted,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save task")
      }

      toast({
        title: "Task saved",
        description: "Changes have been saved successfully",
      })

      onUpdate?.()
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Unable to save changes",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleBulkCopy = () => {
    const allRequiredNames = files
      .filter((file) => file.requiredName)
      .map((file) => file.requiredName)
      .join("\n")

    if (allRequiredNames) {
      handleCopy(allRequiredNames)
    }
  }

  const clearAllFiles = () => {
    setFiles([])
  }

  const validateFiles = () => {
    return files.every((file) => file.downloadName.trim() && file.requiredName.trim())
  }

  const hasUnsavedChanges = () => {
    return JSON.stringify(files) !== JSON.stringify(task.files) || isCompleted !== task.completed
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              {task.retailer}
              {isCompleted && (
                <Badge variant="default" className="bg-green-500">
                  Completed
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Checkbox checked={isCompleted} onCheckedChange={setIsCompleted} id="task-completed" />
              <Label htmlFor="task-completed" className="text-sm">
                Mark as completed
              </Label>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Credentials & Info */}
          <div className="space-y-6">
            {task.loadType === "Direct load" && task.directLoadTiming && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Load Timing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">IST Time:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input value={task.directLoadTiming.istTime} readOnly />
                        <Button size="sm" variant="outline" onClick={() => handleCopy(task.directLoadTiming!.istTime)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">EST Time:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input value={task.directLoadTiming.estTime} readOnly />
                        <Button size="sm" variant="outline" onClick={() => handleCopy(task.directLoadTiming!.estTime)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {task.directLoadTiming.sqlQuery && (
                    <div>
                      <Label className="text-muted-foreground flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        SQL Query:
                      </Label>
                      <div className="mt-1">
                        <Textarea
                          value={task.directLoadTiming.sqlQuery}
                          readOnly
                          rows={4}
                          className="font-mono text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 bg-transparent"
                          onClick={() => handleCopy(task.directLoadTiming!.sqlQuery!)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Query
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {task.loadType === "Indirect load" &&
              task.indirectLoadSource === "retailer portal" &&
              task.retailerPortal && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Retailer Portal Credentials
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Website Link:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input value={task.retailerPortal.websiteLink} readOnly />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(task.retailerPortal!.websiteLink, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Username:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input value={task.retailerPortal.username} readOnly />
                        <Button size="sm" variant="outline" onClick={() => handleCopy(task.retailerPortal!.username)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Password:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input type="password" value={task.retailerPortal.password} readOnly />
                        <Button size="sm" variant="outline" onClick={() => handleCopy(task.retailerPortal!.password)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            {task.loadType === "Indirect load" && task.indirectLoadSource === "retailer mail" && task.retailerMail && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Retailer Mail Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Mail Folder:</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={task.retailerMail.mailFolder} readOnly />
                      <Button size="sm" variant="outline" onClick={() => handleCopy(task.retailerMail!.mailFolder)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Mail ID:</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={task.retailerMail.mailId} readOnly />
                      <Button size="sm" variant="outline" onClick={() => handleCopy(task.retailerMail!.mailId)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!task.directLoadTiming && !task.retailerPortal && !task.retailerMail && task.link && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Login Credentials</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Link:</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={task.link} readOnly />
                      <Button size="sm" variant="outline" onClick={() => window.open(task.link, "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Username:</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={task.username} readOnly />
                      <Button size="sm" variant="outline" onClick={() => handleCopy(task.username)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Password:</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input type="password" value={task.password} readOnly />
                      <Button size="sm" variant="outline" onClick={() => handleCopy(task.password)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">
                    We upload total {task.fileCount} files for this retailer: {task.formats.xlsx} xlsx,{" "}
                    {task.formats.csv} csv, {task.formats.txt} txt and we send one mail for it
                  </p>
                </div>
                {task.instructions && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <Label className="text-sm font-medium text-blue-700 dark:text-blue-300">Instructions:</Label>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-200">{task.instructions}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Load Type:</Label>
                    <Badge variant={task.loadType === "Direct load" ? "default" : "secondary"} className="ml-2">
                      {task.loadType}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Schedule:</Label>
                    <span className="ml-2">{task.day}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes about this task..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            {task.ktRecordingLink && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    KT Recording
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input value={task.ktRecordingLink} readOnly />
                    <Button size="sm" variant="outline" onClick={() => window.open(task.ktRecordingLink, "_blank")}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {task.documentationLink && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Input value={task.documentationLink} readOnly />
                    <Button size="sm" variant="outline" onClick={() => window.open(task.documentationLink, "_blank")}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Enhanced File Management */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">File Name Mapping</CardTitle>
                <div className="flex gap-2">
                  {files.length > 0 && (
                    <>
                      <Button onClick={handleBulkCopy} size="sm" variant="outline">
                        Copy All Names
                      </Button>
                      <Button onClick={clearAllFiles} size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button onClick={addFile} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add File
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {files.map((file, index) => (
                  <div key={index} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">File {index + 1}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <Label className="text-sm text-muted-foreground">Downloaded name/format</Label>
                      <Input
                        value={file.downloadName}
                        onChange={(e) => updateFile(index, "downloadName", e.target.value)}
                        placeholder="e.g., abcd.xlsx"
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="w-8 h-px bg-border"></div>
                      <span className="mx-2 text-xs text-muted-foreground">→</span>
                      <div className="w-8 h-px bg-border"></div>
                    </div>

                    <div>
                      <Label className="text-sm text-muted-foreground">Required name/format</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={file.requiredName}
                          onChange={(e) => updateFile(index, "requiredName", e.target.value)}
                          placeholder="e.g., pqrs_20250917.csv"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(file.requiredName)}
                          disabled={!file.requiredName}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {files.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No files configured. Click "Add File" to start.
                  </div>
                )}

                {files.length > 0 && !validateFiles() && (
                  <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
                    ⚠️ Some files are missing required information
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">{hasUnsavedChanges() && "You have unsaved changes"}</div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !validateFiles()}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
