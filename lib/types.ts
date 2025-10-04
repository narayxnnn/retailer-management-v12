export interface User {
  id: string
  username: string
  password: string
  createdAt: Date
}

export interface TaskFile {
  id?: string
  downloadName: string
  requiredName: string
  taskId?: string
}

export interface DirectLoadTiming {
  istTime: string
  estTime: string
  sqlQuery?: string
}

export interface RetailerPortalSource {
  websiteLink: string
  username: string
  password: string
}

export interface RetailerMailSource {
  mailFolder: string
  mailId: string
}

export interface Task {
  id: string
  retailer: string
  day: string
  fileCount: number
  formats: {
    xlsx: number
    csv: number
    txt: number
    mail: number
  }
  loadType: "Direct load" | "Indirect load"

  directLoadTiming?: DirectLoadTiming
  indirectLoadSource?: "retailer portal" | "retailer mail"
  retailerPortal?: RetailerPortalSource
  retailerMail?: RetailerMailSource

  link: string
  username: string
  password: string

  files: TaskFile[]
  completed: boolean
  createdAt: Date
  updatedAt: Date
  ktRecordingLink?: string
  documentationLink?: string
  instructions?: string
  userId: string
}
