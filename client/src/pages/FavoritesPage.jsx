import { useState, useEffect } from 'react'
import axios from 'axios'

export default function FavoritesPage() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await axios.get('/api/admin/photos')
    setPhotos(res.data.photos.filter((p) => p.is_favorite))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function unfavorite(id) {
    await axios.patch(`/api/photos/${id}/favorite`)
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  if (loading) return <div className="min-h-screen bg-earth-bg text-white p-10">불러오는 중...</div>

  return (
    <div className="min-h-screen bg-earth-bg text-white p-6 pt-10">
      <h1 className="text-xl font-semibold mb-6">⭐ 즐겨찾기</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
            <img
              src={`/uploads/${photo.file_path.split('/').pop()}`}
              alt={photo.title || ''}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => unfavorite(photo.id)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-yellow-400 text-sm"
            >
              ★
            </button>
          </div>
        ))}
      </div>

      {photos.length === 0 && <p className="text-white/40 text-sm">즐겨찾기한 사진이 없어요.</p>}
    </div>
  )
}