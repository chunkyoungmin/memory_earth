import exifr from 'exifr'
import { pool } from '../config/db.js'
import { supabase } from '../config/supabaseClient.js'

export async function uploadPhoto(req, res) {
  let uploadedFileName
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 없습니다.' })
    }

    const { tripId, title } = req.body
    const userId = req.user.id

    if (tripId) {
      const trip = await pool.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId])
      if (trip.rowCount === 0) {
        return res.status(404).json({ error: '여행을 찾을 수 없습니다.' })
      }
    }

    const ext = req.file.originalname.split('.').pop()
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype })

    if (uploadError) {
      console.error('Supabase Storage 업로드 실패:', uploadError)
      return res.status(500).json({ error: '사진 저장 중 오류가 발생했습니다.' })
    }

    uploadedFileName = fileName
    const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(fileName)
    const publicUrl = publicUrlData.publicUrl

    let gps = null
    let takenAt = null
    let gpsSource = 'none'

    try {
      const exifData = await exifr.parse(req.file.buffer, { gps: true })
      if (exifData?.latitude && exifData?.longitude) {
        gps = { latitude: exifData.latitude, longitude: exifData.longitude }
        gpsSource = 'exif'
      }
      if (exifData?.DateTimeOriginal) {
        takenAt = exifData.DateTimeOriginal
      }
    } catch (exifErr) {
      console.warn('EXIF 파싱 실패:', exifErr.message)
    }

    const result = await pool.query(
      `INSERT INTO photos (user_id, trip_id, file_path, title, latitude, longitude, taken_at, gps_source)
       SELECT $1, $2::integer, $3, $4, $5, $6, $7, $8
       WHERE $2::integer IS NULL OR EXISTS (
         SELECT 1 FROM trips WHERE id = $2 AND user_id = $1
       )
       RETURNING *`,
      [
        userId,
        tripId || null,
        publicUrl,
        title || null,
        gps?.latitude || null,
        gps?.longitude || null,
        takenAt,
        gpsSource,
      ]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: '여행을 찾을 수 없습니다.' })
    }
    uploadedFileName = null
    res.status(201).json({
      photo: result.rows[0],
      hasGps: gpsSource === 'exif',
    })
  } catch (err) {
    console.error('사진 업로드 실패:', err)
    res.status(500).json({ error: '사진 업로드 중 오류가 발생했습니다.' })
  } finally {
    if (uploadedFileName) {
      try {
        const { error } = await supabase.storage.from('photos').remove([uploadedFileName])
        if (error) console.error('업로드 파일 정리 실패:', error.message)
      } catch (err) {
        console.error('업로드 파일 정리 실패:', err)
      }
    }
  }
}

export async function setManualLocation(req, res) {
  try {
    const { id } = req.params
    const { latitude, longitude } = req.body

    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: '위도/경도가 필요합니다.' })
    }

    const result = await pool.query(
      `UPDATE photos SET latitude = $1, longitude = $2, gps_source = 'manual'
       WHERE id = $3 AND user_id = $4 RETURNING *`,
      [latitude, longitude, id, req.user.id]
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

export async function listPhotos(req, res) {
  try {
    const result = await pool.query(
      `SELECT * FROM photos
       WHERE user_id = $1 AND ($2::boolean OR latitude IS NOT NULL)
       ORDER BY taken_at ASC NULLS LAST`,
      [req.user.id, req.query.includeUnlocated === 'true']
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
      `UPDATE photos SET is_favorite = NOT is_favorite WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, req.user.id]
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
