const express = require("express")
const cors = require("cors")
require("dotenv").config()

const app = express()

app.use(cors())
app.use(express.json())

const usersRoutes = require("./routes/users")
app.use("/api/users", usersRoutes)

const authRoutes = require("./routes/auth")
app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
  res.send("Fund Transfer API is running")
})

app.use("/api/transfer", require("./routes/transfer"))
app.use("/api/audit", require("./routes/audit"))

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})
