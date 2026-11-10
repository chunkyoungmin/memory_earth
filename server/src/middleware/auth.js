import 'dotenv/config'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export function isAdmin(userId) {
  const configuredIds = (process.env.ADMIN_USER_IDS || '').split(',').map((id) => id.trim())
  return Number.isSafeInteger(userId) && userId > 0 && configuredIds.includes(String(userId))
}

export function requireAdmin(req, res, next) {
  if (!isAdmin(req.user.id)) {
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' })
  }
  next()
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '로그인이 필요합니다.' })
  }

  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = { id: payload.userId }
    next()
  } catch (err) {
    return res.status(401).json({ error: '유효하지 않거나 만료된 로그인입니다.' })
  }
}

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1]
    try {
      const payload = jwt.verify(token, JWT_SECRET)
      req.user = { id: payload.userId }
    } catch (err) {
      // 무시하고 비로그인으로 진행
    }
  }
  next()
}
