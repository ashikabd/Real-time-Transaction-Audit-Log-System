const express = require("express")
const router = express.Router()
const pool = require("../config/database")
const auth = require("../middleware/auth")

// Require authentication; user can only see their own history unless they are an admin
router.get("/history/:userId", auth, async (req, res) => {
  const { userId } = req.params
  const requestedUserId = Number(userId)

  // Allow only if requesting own history or user is an admin
  if (req.user.id !== requestedUserId) {
    return res.status(403).json({ error: 'You can only view your own transaction history' })
  }

  try {
    const result = await pool.query(
      `
      SELECT
        transaction_id,
        sender_id,
        receiver_id,
        amount,
        status,
        error_message,
        created_at
      FROM audit_logs
      WHERE sender_id = $1 OR receiver_id = $1
      ORDER BY created_at DESC
      `,
      [requestedUserId]
    )

    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch audit history" })
  }
})

module.exports = router
