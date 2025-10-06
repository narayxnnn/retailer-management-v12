import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const day = searchParams.get("day") || "all"

    const where: any = {}

    if (search) {
      where.retailer = {
        contains: search,
        mode: "insensitive",
      }
    }

    if (day !== "all") {
      where.day = {
        contains: day,
        mode: "insensitive",
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        files: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const transformedTasks = tasks.map((task) => ({
      id: task.id,
      retailer: task.retailer,
      day: task.day,
      fileCount: task.fileCount,
      formats: {
        xlsx: task.xlsxCount,
        csv: task.csvCount,
        txt: task.txtCount,
        mail: task.mailCount,
      },
      loadType: task.loadType as "Direct load" | "Indirect load",
      directLoadTiming: task.istTime
        ? {
            istTime: task.istTime,
            estTime: task.estTime!,
            sqlQuery: task.sqlQuery || undefined,
          }
        : undefined,
      indirectLoadSource: task.indirectLoadSource as "retailer portal" | "retailer mail" | undefined,
      retailerPortal:
        task.indirectLoadSource === "retailer portal"
          ? {
              websiteLink: task.websiteLink!,
              username: task.portalUsername!,
              password: task.portalPassword!,
            }
          : undefined,
      retailerMail:
        task.indirectLoadSource === "retailer mail"
          ? {
              mailFolder: task.mailFolder!,
              mailId: task.mailId!,
            }
          : undefined,
      link: task.link,
      username: task.username,
      password: task.password,
      files: task.files.map((f) => ({
        id: f.id,
        downloadName: f.downloadName,
        requiredName: f.requiredName,
      })),
      completed: task.completed,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      ktRecordingLink: task.ktRecordingLink || undefined,
      documentationLink: task.documentationLink || undefined,
      instructions: task.instructions || undefined,
      userId: task.userId,
    }))

    return NextResponse.json(transformedTasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const taskData = await request.json()

    const task = await prisma.task.create({
      data: {
        retailer: taskData.retailer,
        day: taskData.day,
        fileCount: taskData.fileCount,
        xlsxCount: taskData.formats.xlsx,
        csvCount: taskData.formats.csv,
        txtCount: taskData.formats.txt,
        mailCount: taskData.formats.mail,
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
        completed: false,
        ktRecordingLink: taskData.ktRecordingLink,
        documentationLink: taskData.documentationLink,
        instructions: taskData.instructions,
        userId: session.userId,
        files: {
          create: taskData.files.map((file: any) => ({
            downloadName: file.downloadName,
            requiredName: file.requiredName,
          })),
        },
      },
      include: {
        files: true,
      },
    })

    return NextResponse.json({
      id: task.id,
      ...taskData,
      files: task.files,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
