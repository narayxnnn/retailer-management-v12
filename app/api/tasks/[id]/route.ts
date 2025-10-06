import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const taskData = await request.json()

    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    await prisma.taskFile.deleteMany({
      where: { taskId: params.id },
    })

    // Handle credential updates if provided
    const updateData: any = {
      retailer: taskData.retailer,
      day: taskData.day,
      fileCount: taskData.fileCount,
      xlsxCount: taskData.formats?.xlsx || 0,
      csvCount: taskData.formats?.csv || 0,
      txtCount: taskData.formats?.txt || 0,
      mailCount: taskData.formats?.mail || 0,
      loadType: taskData.loadType,
      istTime: taskData.directLoadTiming?.istTime,
      estTime: taskData.directLoadTiming?.estTime,
      sqlQuery: taskData.directLoadTiming?.sqlQuery,
      indirectLoadSource: taskData.indirectLoadSource,
      websiteLink: taskData.retailerPortal?.websiteLink,
      portalUsername: taskData.retailerPortal?.username,
      portalPassword: taskData.retailerPortal?.password,
      mailFolder: taskData.retailerMail?.mailFolder,
      mailId: taskData.retailerMail?.mailId,
      link: taskData.link || "",
      username: taskData.username || "",
      password: taskData.password || "",
      completed: taskData.completed,
      ktRecordingLink: taskData.ktRecordingLink,
      documentationLink: taskData.documentationLink,
      instructions: taskData.instructions,
    }

    // Update credentials if provided
    if (taskData.credentials) {
      if (taskData.credentials.portalPassword !== undefined) {
        updateData.portalPassword = taskData.credentials.portalPassword
      }
      if (taskData.credentials.password !== undefined) {
        updateData.password = taskData.credentials.password
      }
      if (taskData.credentials.portalUsername !== undefined) {
        updateData.portalUsername = taskData.credentials.portalUsername
      }
      if (taskData.credentials.username !== undefined) {
        updateData.username = taskData.credentials.username
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...updateData,
        files: {
          create:
            taskData.files?.map((file: any) => ({
              downloadName: file.downloadName,
              requiredName: file.requiredName,
            })) || [],
        },
      },
      include: {
        files: true,
      },
    })

    return NextResponse.json({ success: true, task: updatedTask })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
