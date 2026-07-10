import { pool } from '../config/db.js'

// 여행 목록 조회 (사진 개수 포함)
export async function listTrips(req, res) {
  try {
    const userId = req.query.userId || 1
    const result = await pool.query(
      `SELECT trips.*, COUNT(photos.id) AS photo_count
       FROM trips
       LEFT JOIN photos ON photos.trip_id = trips.id
       WHERE trips.user_id = $1
       GROUP BY trips.id
       ORDER BY trips.created_at DESC`,
      [userId]
    )
    res.json({ trips: result.rows })
  } catch (err) {
    console.error('여행 목록 조회 실패:', err)
    res.status(500).json({ error: '여행 목록 조회 중 오류가 발생했습니다.' })
  }
}

// 새 여행 생성
export async function createTrip(req, res) {
  try {
    const { title, userId = 1 } = req.body
    if (!title) {
      return res.status(400).json({ error: '여행 제목이 필요합니다.' })
    }

    const result = await pool.query(
      `INSERT INTO trips (user_id, title) VALUES ($1, $2) RETURNING *`,
      [userId, title]
    )
    res.status(201).json({ trip: result.rows[0] })
  } catch (err) {
    console.error('여행 생성 실패:', err)
    res.status(500).json({ error: '여행 생성 중 오류가 발생했습니다.' })
  }
}

// 특정 여행의 사진 목록 (경로 그리기용 - Part 7에서 활용)
export async function getTripPhotos(req, res) {
  try {
    const { id } = req.params
    const result = await pool.query(
      `SELECT * FROM photos WHERE trip_id = $1
       ORDER BY sequence_order ASC NULLS LAST, taken_at ASC NULLS LAST`,
      [id]
    )
    res.json({ photos: result.rows })
  } catch (err) {
    console.error('여행 사진 조회 실패:', err)
    res.status(500).json({ error: '여행 사진 조회 중 오류가 발생했습니다.' })
  }
}
// 여행 사진 순서 수동 재배열 (사용자가 직접 순서 지정)
export async function reorderTripPhotos(req, res) {
  try {
    const { id } = req.params
    const { photoIds } = req.body // 순서대로 정렬된 photo id 배열

    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({ error: 'photoIds 배열이 필요합니다.' })
    }

    // 각 사진에 순서 번호 부여
    await Promise.all(
      photoIds.map((photoId, index) =>
        pool.query(
          `UPDATE photos SET sequence_order = $1 WHERE id = $2 AND trip_id = $3`,
          [index, photoId, id]
        )
      )
    )

    res.json({ success: true })
  } catch (err) {
    console.error('여행 순서 변경 실패:', err)
    res.status(500).json({ error: '여행 순서 변경 중 오류가 발생했습니다.' })
  }
}