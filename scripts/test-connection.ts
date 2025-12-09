import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.POSTGRES_URL!)

async function testConnection() {
  try {
    console.log("[v0] Testing database connection...")
    const result = await sql`SELECT current_database(), current_user, version()`
    console.log("[v0] Connection successful!")
    console.log("[v0] Database:", result[0].current_database)
    console.log("[v0] User:", result[0].current_user)
    console.log("[v0] Version:", result[0].version)

    // Check if job_applications table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log("[v0] Existing tables:", tables.map((t) => t.table_name).join(", "))
  } catch (error) {
    console.error("[v0] Connection failed:", error)
  }
}

testConnection()
