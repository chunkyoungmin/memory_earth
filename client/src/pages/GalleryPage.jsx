import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'

export default function GalleryPage() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    axios.get('/api/admin/photos').then((res) => {
      setPhotos(res.data.photos)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    let result = photos
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.country || '').toLowerCase().includes(q) ||
          (p.city || '').toLowerCase().includes(q)
      )
    }
    result = [...result].sort((a, b) => {
      if (sortBy === 'country') return (a.country || '').localeCompare(b.country || '')
      const da = a.taken_at ? new Date(a.taken_at) : new Date(0)
      const db = b.taken_at ? new Date(b.taken_at) : new Date(0)
      return db - da
    })
    return result
  }, [photos, search, sortBy])

  if (loading) {
    return <div className="min-h-screen bg-earth-bg text-white p-10 pt-10">불러오는 중...</div>
  }

  return (
    <div className="min-h-screen bg-earth-bg text-white p-6 pt-10">
      <h1 className="text-xl font-semibold mb-6">📷 전체 갤러리</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="제목, 국가, 도시로 검색"
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm
                     placeholder-white/30 outline-none focus:border-white/30 w-64"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm outline-none"
        >
          <option value="date" className="bg-[#161618]">날짜순</option>
          <option value="country" className="bg-[#161618]">국가순</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((photo) => (
          <button
            key={photo.id}
            onClick={() => setSelected(photo)}
            className="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10
                       hover:border-white/30 transition-colors"
          >
            <img
              src={`/uploads/${photo.file_path.split('/').pop()}`}
              alt={photo.title || ''}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="text-white/40 text-sm mt-8">사진이 없습니다.</p>}

      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-6 cursor-zoom-out"
        >
          <div className="max-w-3xl w-full">
            <img
              src={`/uploads/${selected.file_path.split('/').pop()}`}
              alt={selected.title || ''}
              className="w-full max-h-[75vh] object-contain rounded-xl"
            />
            <div className="mt-3 text-center">
              <p className="text-white font-medium">{selected.title || '제목 없음'}</p>
              <p className="text-white/50 text-sm">
                {[selected.city, selected.country].filter(Boolean).join(', ') || '위치 정보 없음'}
                {selected.taken_at && ` · ${new Date(selected.taken_at).toLocaleDateString('ko-KR')}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}