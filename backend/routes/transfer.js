const express = require("express")
const router = express.Router()
const pool = require("../config/database")
const { createAuditLog } = require("../models/AuditLog")
const crypto = require("crypto")
const auth = require("../middleware/auth")

router.post("/", auth, async (req, res) => {
  const { senderId, receiverId, amount } = req.body
  const transactionId = crypto.randomUUID()

  // Ensure the requester is the sender
  if (req.user.id !== senderId) {
    return res.status(403).json({ error: "Cannot transfer on behalf of another user" })
  }

  // Validate input
  if (!senderId || !receiverId || !amount) {
    return res.status(400).json({ error: "senderId, receiverId, and amount required" })
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" })
  }

  if (senderId === receiverId) {
    return res.status(400).json({ error: "Cannot send money to yourself" })
  }

  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const senderRes = await client.query(
      "SELECT balance FROM users WHERE id = $1 FOR UPDATE",
      [senderId]
    )
    const receiverRes = await client.query(
      "SELECT balance FROM users WHERE id = $1 FOR UPDATE",
      [receiverId]
    )

    if (!senderRes.rows.length || !receiverRes.rows.length) {
      throw new Error("Invalid sender or receiver")
    }

    const senderBalance = Number(senderRes.rows[0].balance)

    if (senderBalance < amount) {
      throw new Error("Insufficient balance")
    }

    const newSenderBalance = senderBalance - amount
    const newReceiverBalance = Number(receiverRes.rows[0].balance) + amount

    await client.query(
      "UPDATE users SET balance = $1 WHERE id = $2",
      [newSenderBalance, senderId]
    )
    await client.query(
      "UPDATE users SET balance = $1 WHERE id = $2",
      [newReceiverBalance, receiverId]
    )

    await createAuditLog(client, {
      transaction_id: transactionId,
      sender_id: senderId,
      receiver_id: receiverId,
      amount,
      status: "SUCCESS",
      error_message: null,
      sender_balance_after: newSenderBalance,
      receiver_balance_after: newReceiverBalance
    })

    await client.query("COMMIT")
    res.json({ message: "Transfer successful", transactionId, newBalance: newSenderBalance })
  } catch (err) {
    await client.query("ROLLBACK")

    await createAuditLog(client, {
      transaction_id: transactionId,
      sender_id: senderId,
      receiver_id: receiverId,
      amount,
      status: "FAILED",
      error_message: err.message,
      sender_balance_after: null,
      receiver_balance_after: null
    })

    res.status(400).json({ error: err.message })
  } finally {
    client.release()
  }
})

module.exports = router
