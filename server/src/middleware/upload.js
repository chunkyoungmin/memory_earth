import multer from 'multer'

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/heic', 'image/webp']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('지원하지 않는 이미지 형식입니다.'))
  }
}

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
})