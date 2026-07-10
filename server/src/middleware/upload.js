import multer from 'multer'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const uploadDir = process.env.UPLOAD_DIR || '../uploads'

// 업로드 폴더 없으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${ext}`)
  },
})

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/heic', 'image/webp']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('지원하지 않는 이미지 형식입니다.'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
})