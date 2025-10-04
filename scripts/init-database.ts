// Script to initialize Prisma database and run migrations
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Initializing database...")

  // Check if database is accessible
  try {
    await prisma.$connect()
    console.log("✓ Database connection successful")

    // Count existing users and tasks
    const userCount = await prisma.user.count()
    const taskCount = await prisma.task.count()

    console.log(`✓ Found ${userCount} users and ${taskCount} tasks`)
    console.log("✓ Database is ready!")
  } catch (error) {
    console.error("✗ Database connection failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error("Error:", error)
  process.exit(1)
})
