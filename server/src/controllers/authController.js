import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db.js'

const JWT_SECRET = process.env.JWT_SECRET
const TOKEN_EXPIRES_IN = '30d'

export async function signup(req, res) {
  try {
    const { email, password, displayName } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호가 필요합니다.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ error: '비밀번호는 8자 이상이어야 합니다.' })
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: '이미 가입된 이메일입니다.' })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3) RETURNING id, email, display_name, created_at`,
      [email, passwordHash, displayName || null]
    )

    const user = result.rows[0]
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })

    res.status(201).json({ token, user })
  } catch (err) {
    console.error('회원가입 실패:', err)
    res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호가 필요합니다.' })
    }

    const result = await pool.query(
      'SELECT id, email, password_hash, display_name FROM users WHERE email = $1',
      [email]
    )
    const user = result.rows[0]

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })

    res.json({
      token,
      user: { id: user.id, email: user.email, display_name: user.display_name },
    })
  } catch (err) {
    console.error('로그인 실패:', err)
    res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' })
  }
}

export async function getMe(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, email, display_name, created_at FROM users WHERE id = $1',
      [req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '유저를 찾을 수 없습니다.' })
    }
    res.json({ user: result.rows[0] })
  } catch (err) {
    console.error('내 정보 조회 실패:', err)
    res.status(500).json({ error: '조회 중 오류가 발생했습니다.' })
  }
}