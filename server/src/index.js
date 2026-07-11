import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import photoRoutes from './routes/photoRoutes.js'
import tripRoutes from './routes/tripRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { UPLOAD_DIR } from './config/paths.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.use('/uploads', express.static(UPLOAD_DIR))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'earth-memory-server' })
})

app.use('/api/photos', photoRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/admin', adminRoutes)

app.listen(PORT, () => {
  console.log(`Earth Memory server running on http://localhost:${PORT}`)
})