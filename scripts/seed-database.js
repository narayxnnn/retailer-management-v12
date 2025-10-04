// Script to seed the database with initial task data
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"

const seedData = [
  {
    retailer: "Retailer-A",
    day: "Today's load",
    fileCount: 9,
    formats: { xlsx: 3, csv: 4, txt: 1, mail: 1 },
    loadType: "Indirect load",
    link: "https://retailerA.com",
    username: "userA",
    password: "passA",
    files: [
      { downloadName: "abcd.xlsx", requiredName: "pqrs_20250917.csv" },
      { downloadName: "data.csv", requiredName: "retailer_a_20250917.csv" },
      { downloadName: "report.txt", requiredName: "report_final.txt" },
    ],
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    retailer: "Retailer-B",
    day: "Today's load",
    fileCount: 9,
    formats: { xlsx: 3, csv: 4, txt: 1, mail: 1 },
    loadType: "Direct load",
    link: "https://retailerB.com",
    username: "userB",
    password: "passB",
    files: [],
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    retailer: "Retailer-C",
    day: "Monday",
    fileCount: 9,
    formats: { xlsx: 3, csv: 4, txt: 1, mail: 1 },
    loadType: "Direct load",
    link: "https://retailerC.com",
    username: "userC",
    password: "passC",
    files: [],
    completed: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    retailer: "Retailer-D",
    day: "Tuesday",
    fileCount: 9,
    formats: { xlsx: 3, csv: 4, txt: 1, mail: 1 },
    loadType: "Indirect load",
    link: "https://retailerD.com",
    username: "userD",
    password: "passD",
    files: [],
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    retailer: "Retailer-E",
    day: "Wednesday",
    fileCount: 9,
    formats: { xlsx: 3, csv: 4, txt: 1, mail: 1 },
    loadType: "Direct load",
    link: "https://retailerE.com",
    username: "userE",
    password: "passE",
    files: [],
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("taskmanager")
    const collection = db.collection("tasks")

    // Clear existing data
    await collection.deleteMany({})
    console.log("Cleared existing tasks")

    // Insert seed data
    const result = await collection.insertMany(seedData)
    console.log(`Inserted ${result.insertedCount} tasks`)

    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
