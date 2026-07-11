import exifr from 'exifr'
import { pool } from '../config/db.js'

// 사진 업로드 처리: 파일 저장 -> EXIF 파싱(GPS, 촬영시간) -> DB insert
export async function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 없습니다.' })
    }

    const filePath = req.file.path
    const { tripId, title, userId = 1 } = req.body // userId는 인증 붙기 전까지 임시 고정값

    // EXIF에서 GPS와 촬영시간 추출
    let gps = null
    let takenAt = null
    let gpsSource = 'none'

    try {
      const exifData = await exifr.parse(filePath, { gps: true })
      if (exifData?.latitude && exifData?.longitude) {
        gps = { latitude: exifData.latitude, longitude: exifData.longitude }
        gpsSource = 'exif'
      }
      if (exifData?.DateTimeOriginal) {
        takenAt = exifData.DateTimeOriginal
      }
    } catch (exifErr) {
      // EXIF가 없거나 손상된 경우 - GPS 없이 진행 (사용자가 수동 지정하도록 프론트에서 처리)
      console.warn('EXIF 파싱 실패:', exifErr.message)
    }

    const result = await pool.query(
      `INSERT INTO photos (user_id, trip_id, file_path, title, latitude, longitude, taken_at, gps_source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        tripId || null,
        filePath,
        title || null,
        gps?.latitude || null,
        gps?.longitude || null,
        takenAt,
        gpsSource,
      ]
    )

    res.status(201).json({
      photo: result.rows[0],
      hasGps: gpsSource === 'exif', // false면 프론트에서 "지구본 클릭해서 위치 지정" 유도
    })
  } catch (err) {
    console.error('사진 업로드 실패:', err)
    res.status(500).json({ error: '사진 업로드 중 오류가 발생했습니다.' })
  }
}

// 위치 정보 없는 사진에 수동으로 GPS 지정 (사용자가 지구본 클릭했을 때)
export async function setManualLocation(req, res) {
  try {
    const { id } = req.params
    const { latitude, longitude } = req.body

    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: '위도/경도가 필요합니다.' })
    }

    const result = await pool.query(
      `UPDATE photos SET latitude = $1, longitude = $2, gps_source = 'manual'
       WHERE id = $3 RETURNING *`,
      [latitude, longitude, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '사진을 찾을 수 없습니다.' })
    }

    res.json({ photo: result.rows[0] })
  } catch (err) {
    console.error('위치 지정 실패:', err)
    res.status(500).json({ error: '위치 지정 중 오류가 발생했습니다.' })
  }
}

// 전체 사진 목록 (지구본 핀 렌더링용)
export async function listPhotos(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM photos WHERE latitude IS NOT NULL ORDER BY taken_at ASC NULLS LAST`
    )
    res.json({ photos: result.rows })
  } catch (err) {
    console.error('사진 목록 조회 실패:', err)
    res.status(500).json({ error: '사진 목록 조회 중 오류가 발생했습니다.' })
  }
}

export async function toggleFavorite(req, res) {
  try {
    const { id } = req.params
    const result = await pool.query(
      `UPDATE photos SET is_favorite = NOT is_favorite WHERE id = $1 RETURNING *`,
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '사진을 찾을 수 없습니다.' })
    }
    res.json({ photo: result.rows[0] })
  } catch (err) {
    console.error('즐겨찾기 변경 실패:', err)
    res.status(500).json({ error: '즐겨찾기 변경 중 오류가 발생했습니다.' })
  }
}