import { pool } from '../config/db.js'
import fs from 'fs'

export async function getStats(req, res) {
  try {
    const [users, trips, photos, noGps] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM trips'),
      pool.query('SELECT COUNT(*) FROM photos'),
      pool.query('SELECT COUNT(*) FROM photos WHERE latitude IS NULL'),
    ])

    res.json({
      userCount: Number(users.rows[0].count),
      tripCount: Number(trips.rows[0].count),
      photoCount: Number(photos.rows[0].count),
      photosWithoutGps: Number(noGps.rows[0].count),
    })
  } catch (err) {
    console.error('통계 조회 실패:', err)
    res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' })
  }
}

export async function listAllPhotos(req, res) {
  try {
    const result = await pool.query(
      `SELECT photos.*, trips.title AS trip_title
       FROM photos
       LEFT JOIN trips ON trips.id = photos.trip_id
       ORDER BY photos.created_at DESC`
    )
    res.json({ photos: result.rows })
  } catch (err) {
    console.error('전체 사진 조회 실패:', err)
    res.status(500).json({ error: '전체 사진 조회 중 오류가 발생했습니다.' })
  }
}

export async function deletePhoto(req, res) {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM photos WHERE id = $1 RETURNING *', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '사진을 찾을 수 없습니다.' })
    }

    // 실제 파일도 같이 삭제
    const filePath = result.rows[0].file_path
    fs.unlink(filePath, (err) => {
      if (err) console.warn('파일 삭제 실패(무시 가능):', err.message)
    })

    res.json({ success: true })
  } catch (err) {
    console.error('사진 삭제 실패:', err)
    res.status(500).json({ error: '사진 삭제 중 오류가 발생했습니다.' })
  }
}