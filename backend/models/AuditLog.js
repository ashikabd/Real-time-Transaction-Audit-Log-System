const createAuditLog = async (client, log) => {
  const query = `
    INSERT INTO audit_logs
    (transaction_id, sender_id, receiver_id, amount, status, error_message, sender_balance_after, receiver_balance_after)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
  `
  await client.query(query, [
    log.transaction_id,
    log.sender_id,
    log.receiver_id,
    log.amount,
    log.status,
    log.error_message,
    log.sender_balance_after,
    log.receiver_balance_after
  ])
}

module.exports = { createAuditLog }
