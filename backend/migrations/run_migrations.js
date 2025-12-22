require("dotenv").config()

const fs = require('fs')
const path = require('path')
const pool = require('../config/database')

async function run() {
  try {
    const migrationsDir = path.join(__dirname)
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'))
    for (const file of files.sort()) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      console.log('Running migration:', file)
      await pool.query(sql)
      console.log('Applied:', file)
    }
    console.log('All migrations applied')
    process.exit(0)
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  }
}

run()
