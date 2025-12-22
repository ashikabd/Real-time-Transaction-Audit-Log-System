require("dotenv").config()

const bcrypt = require("bcryptjs")
const pool = require("./config/database")

async function seed() {
  try {
    console.log("Seeding demo users...")

    // Hash password "password" with bcryptjs
    const hashedPassword = await bcrypt.hash("password", 10)
    console.log("Generated hash for 'password':", hashedPassword)

    // Delete existing demo users
    await pool.query(
      "DELETE FROM users WHERE username IN ('alice', 'bob', 'charlie')"
    )

    // Insert demo users
    await pool.query(
      `INSERT INTO users (name, username, balance, password_hash) VALUES
       ('Alice Smith', 'alice', 5000.00, $1),
       ('Bob Johnson', 'bob', 3000.00, $2),
       ('Charlie Brown', 'charlie', 2000.00, $3)`,
      [hashedPassword, hashedPassword, hashedPassword]
    )

    console.log("Demo users created successfully!")
    console.log("Credentials:")
    console.log("  alice / password")
    console.log("  bob / password")
    console.log("  charlie / password")

    process.exit(0)
  } catch (err) {
    console.error("Seeding failed:", err)
    process.exit(1)
  }
}

seed()
