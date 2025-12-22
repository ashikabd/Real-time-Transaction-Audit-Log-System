const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const { getUserByUsername, verifyPassword } = require("../models/User")

const SECRET = process.env.JWT_SECRET || "dev-secret"

router.post("/login", async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" })
  }

  try {
    const user = await getUserByUsername(username)
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET,
      { expiresIn: "24h" }
    )

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        balance: user.balance
      }
    })
  } catch (err) {
    res.status(500).json({ error: "Login failed" })
  }
})

module.exports = router
