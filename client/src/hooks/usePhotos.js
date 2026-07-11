import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export function usePhotos() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPhotos = useCallback(async () => {
    try {
      const res = await axios.get('/api/photos')
      setPhotos(res.data.photos)
    } catch (err) {
      console.error('사진 목록 조회 실패:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const addOrUpdatePhoto = useCallback((photo) => {
    setPhotos((prev) => {
      const exists = prev.some((p) => p.id === photo.id)
      if (exists) return prev.map((p) => (p.id === photo.id ? photo : p))
      return [...prev, photo]
    })
  }, [])

  const setPhotoLocation = useCallback(
    async (id, lat, lng) => {
      const res = await axios.patch(`/api/photos/${id}/location`, {
        latitude: lat,
        longitude: lng,
      })
      addOrUpdatePhoto(res.data.photo)
      return res.data.photo
    },
    [addOrUpdatePhoto]
  )

  const toggleFavorite = useCallback(
    async (id) => {
      const res = await axios.patch(`/api/photos/${id}/favorite`)
      addOrUpdatePhoto(res.data.photo)
      return res.data.photo
    },
    [addOrUpdatePhoto]
  )

  return { photos, loading, addOrUpdatePhoto, setPhotoLocation, toggleFavorite }
}