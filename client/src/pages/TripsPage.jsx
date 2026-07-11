import { useState, useEffect } from 'react'
import axios from 'axios'

export default function TripsPage({ onSelectTrip }) {
  const [trips, setTrips] = useState([])
  const [expandedTripId, setExpandedTripId] = useState(null)
  const [tripPhotos, setTripPhotos] = useState([])

  useEffect(() => {
    axios.get('/api/trips').then((res) => setTrips(res.data.trips))
  }, [])

  async function toggleExpand(trip) {
    if (expandedTripId === trip.id) {
      setExpandedTripId(null)
      return
    }
    const res = await axios.get(`/api/trips/${trip.id}/photos`)
    setTripPhotos(res.data.photos)
    setExpandedTripId(trip.id)
  }

  async function handleDelete(tripId, e) {
    e.stopPropagation()
    if (!confirm('이 여행을 삭제할까요? 사진은 삭제되지 않고 여행에서만 빠집니다.')) return
    await axios.delete(`/api/trips/${tripId}`)
    setTrips((prev) => prev.filter((t) => t.id !== tripId))
  }

  function movePhoto(index, direction) {
    const newOrder = [...tripPhotos]
    const target = index + direction
    if (target < 0 || target >= newOrder.length) return
    ;[newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]]
    setTripPhotos(newOrder)
  }

  async function saveOrder() {
    await axios.patch(`/api/trips/${expandedTripId}/reorder`, {
      photoIds: tripPhotos.map((p) => p.id),
    })
  }

  return (
    <div className="min-h-screen bg-earth-bg p-6 pt-20 text-white">
      <h1 className="text-xl font-semibold mb-6">🧳 여행</h1>

      <div className="flex flex-col gap-3 max-w-md">
        {trips.map((trip) => (
          <div key={trip.id} className="border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{trip.title}</p>
                <p className="text-white/40 text-xs">{trip.photo_count}장</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectTrip(trip.id)}
                  className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium"
                >
                  경로 보기
                </button>
                <button
                  onClick={() => toggleExpand(trip)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs"
                >
                  {expandedTripId === trip.id ? '닫기' : '순서 편집'}
                </button>
                <button
                  onClick={(e) => handleDelete(trip.id, e)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30"
                >
                  삭제
                </button>
              </div>
            </div>

            {expandedTripId === trip.id && (
              <div className="border-t border-white/10 p-4 flex flex-col gap-2">
                {tripPhotos.map((photo, i) => (
                  <div key={photo.id} className="flex items-center justify-between text-sm">
                    <span className="text-white/80 truncate">
                      {i + 1}. {photo.title || '제목 없음'}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => movePhoto(i, -1)} className="px-2 text-white/60 hover:text-white">↑</button>
                      <button onClick={() => movePhoto(i, 1)} className="px-2 text-white/60 hover:text-white">↓</button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={saveOrder}
                  className="mt-2 self-start px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium"
                >
                  순서 저장
                </button>
              </div>
            )}
          </div>
        ))}

        {trips.length === 0 && <p className="text-white/40 text-sm">아직 만든 여행이 없어요.</p>}
      </div>
    </div>
  )
}