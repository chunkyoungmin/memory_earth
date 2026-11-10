import { pool } from '../config/db.js'

// 여행 목록 조회 (사진 개수 포함)
export async function listTrips(req, res) {
  try {
    const userId = req.user.id
    const result = await pool.query(
      `SELECT trips.*, COUNT(photos.id) AS photo_count
       FROM trips
       LEFT JOIN photos ON photos.trip_id = trips.id AND photos.user_id = trips.user_id
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
    const { title } = req.body
    const userId = req.user.id
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
      `SELECT photos.* FROM trips
       LEFT JOIN photos ON photos.trip_id = trips.id AND photos.user_id = trips.user_id
       WHERE trips.id = $1 AND trips.user_id = $2
       ORDER BY photos.sequence_order ASC NULLS LAST, photos.taken_at ASC NULLS LAST`,
      [id, req.user.id]
    )
    if (result.rowCount === 0) {
      return res.status(404).json({ error: '여행을 찾을 수 없습니다.' })
    }
    res.json({ photos: result.rows.filter((photo) => photo.id !== null) })
  } catch (err) {
    console.error('여행 사진 조회 실패:', err)
    res.status(500).json({ error: '여행 사진 조회 중 오류가 발생했습니다.' })
  }
}
// 여행 사진 순서 수동 재배열 (사용자가 직접 순서 지정)
export async function reorderTripPhotos(req, res) {
  const { photoIds } = req.body
  if (!Array.isArray(photoIds) || photoIds.length === 0) {
    return res.status(400).json({ error: '유효한 사진 ID 목록이 필요합니다.' })
  }
  const ids = photoIds.map((id) => typeof id === 'string' && /^\d+$/.test(id) ? Number(id) : id)
  if (!ids.every((id) => Number.isInteger(id) && id > 0 && id <= 2147483647)) {
    return res.status(400).json({ error: '유효한 사진 ID 목록이 필요합니다.' })
  }
  if (new Set(ids).size !== ids.length) {
    return res.status(400).json({ error: '중복된 사진 ID가 있습니다.' })
  }

  try {
    const result = await pool.query(
      `WITH owned AS (
         SELECT p.id, requested.position
         FROM unnest($3::integer[]) WITH ORDINALITY AS requested(id, position)
         JOIN photos AS p ON p.id = requested.id
         JOIN trips AS t ON t.id = p.trip_id AND t.user_id = p.user_id
         WHERE t.id = $1 AND t.user_id = $2
         ORDER BY p.id FOR UPDATE OF p
       )
       UPDATE photos SET sequence_order = owned.position - 1
       FROM owned WHERE photos.id = owned.id
         AND (SELECT COUNT(*) FROM owned) = cardinality($3::integer[])`,
      [req.params.id, req.user.id, ids]
    )
    if (result.rowCount !== ids.length) {
      return res.status(404).json({ error: '여행 또는 사진을 찾을 수 없습니다.' })
    }
    res.json({ success: true })
  } catch (err) {
    console.error('여행 순서 변경 실패:', err)
    res.status(500).json({ error: '여행 순서 변경 중 오류가 발생했습니다.' })
  }
}
export async function deleteTrip(req, res) {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '여행을 찾을 수 없습니다.' })
    }
    // 사진은 삭제되지 않고 trip_id만 NULL로 남습니다 (DB 스키마의 ON DELETE SET NULL)
    res.json({ success: true })
  } catch (err) {
    console.error('여행 삭제 실패:', err)
    res.status(500).json({ error: '여행 삭제 중 오류가 발생했습니다.' })
  }
}
