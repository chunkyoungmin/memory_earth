import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'earth-memory-server' })
})

// Part 4~5에서 photos, gps 관련 라우트 추가 예정
// app.use('/api/photos', photoRoutes)
// app.use('/api/trips', tripRoutes)

app.listen(PORT, () => {
  console.log(`Earth Memory server running on http://localhost:${PORT}`)
})
