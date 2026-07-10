import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import photoRoutes from './routes/photoRoutes.js'
import tripRoutes from './routes/tripRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

// 업로드된 사진을 정적 파일로 서빙 (프론트에서 미리보기용)
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || '../uploads')))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'earth-memory-server' })
})

app.use('/api/photos', photoRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/admin', adminRoutes)

app.listen(PORT, () => {
  console.log(`Earth Memory server running on http://localhost:${PORT}`)
})