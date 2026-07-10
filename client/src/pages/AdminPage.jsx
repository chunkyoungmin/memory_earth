import { useState, useEffect } from 'react'
import axios from 'axios'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [statsRes, photosRes] = await Promise.all([
      axios.get('/api/admin/stats'),
      axios.get('/api/admin/photos'),
    ])
    setStats(statsRes.data)
    setPhotos(photosRes.data.photos)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(id) {
    if (!confirm('이 사진을 삭제할까요? 되돌릴 수 없습니다.')) return
    await axios.delete(`/api/admin/photos/${id}`)
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  if (loading) {
    return <div className="min-h-screen bg-earth-bg text-white p-10 pt-20">불러오는 중...</div>
  }

  return (
    <div className="min-h-screen bg-earth-bg text-white p-6 pt-20">
      <h1 className="text-xl font-semibold mb-6">⚙ 관리자</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-2xl">
        <StatCard label="유저" value={stats.userCount} />
        <StatCard label="여행" value={stats.tripCount} />
        <StatCard label="사진" value={stats.photoCount} />
        <StatCard label="위치 미지정" value={stats.photosWithoutGps} warn />
      </div>

      {/* 전체 사진 목록 */}
      <h2 className="text-sm font-medium text-white/60 mb-3">전체 사진 ({photos.length})</h2>
      <div className="flex flex-col gap-2 max-w-2xl">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <img
              src={`/uploads/${photo.file_path.split('/').pop()}`}
              alt=""
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{photo.title || '제목 없음'}</p>
              <p className="text-white/40 text-xs">
                {photo.trip_title ? `🧳 ${photo.trip_title}` : '여행 미지정'}
                {photo.latitude == null && ' · 📍 위치 없음'}
              </p>
            </div>
            <button
              onClick={() => handleDelete(photo.id)}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30"
            >
              삭제
            </button>
          </div>
        ))}
        {photos.length === 0 && <p className="text-white/40 text-sm">사진이 없습니다.</p>}
      </div>
    </div>
  )
}

function StatCard({ label, value, warn }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <p className={`text-2xl font-semibold ${warn && value > 0 ? 'text-amber-400' : 'text-white'}`}>
        {value}
      </p>
      <p className="text-white/40 text-xs mt-1">{label}</p>
    </div>
  )
}