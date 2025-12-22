const express = require("express")
const router = express.Router()
const { getAllUsers, getUserById } = require("../models/User")

router.get("/", async (req, res) => {
  try {
    const users = await getAllUsers()
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

module.exports = router
