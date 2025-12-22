const pool = require("../config/database")
const bcrypt = require("bcryptjs")

const getAllUsers = async () => {
  const result = await pool.query("SELECT id, name, username, balance FROM users ORDER BY id")
  return result.rows
}

const getUserById = async (id) => {
  const result = await pool.query("SELECT id, name, username, balance FROM users WHERE id = $1", [id])
  return result.rows[0]
}

const getUserByUsername = async (username) => {
  const result = await pool.query("SELECT id, name, username, balance, password_hash FROM users WHERE username = $1", [username])
  return result.rows[0]
}

const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword)
}

module.exports = { getAllUsers, getUserById, getUserByUsername, verifyPassword }
