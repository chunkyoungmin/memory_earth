import { useState, useEffect } from 'react'
import axios from 'axios'

export default function TripSelector({ onConfirm, onClose }) {
  const [trips, setTrips] = useState([])
  const [mode, setMode] = useState('none') // 'none' | 'existing' | 'new'
  const [selectedTripId, setSelectedTripId] = useState(null)
  const [newTripTitle, setNewTripTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get('/api/trips')
      .then((res) => setTrips(res.data.trips))
      .catch((err) => console.error('여행 목록 조회 실패:', err))
      .finally(() => setLoading(false))
  }, [])

  async function handleConfirm() {
    if (mode === 'none') {
      onConfirm(null)
      return
    }
    if (mode === 'existing') {
      onConfirm(selectedTripId)
      return
    }
    if (mode === 'new') {
      if (!newTripTitle.trim()) return
      try {
        const res = await axios.post('/api/trips', { title: newTripTitle.trim() })
        onConfirm(res.data.trip.id)
      } catch (err) {
        console.error('여행 생성 실패:', err)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-80 bg-[#161618] border border-white/10 rounded-2xl p-5 shadow-2xl">
        <h2 className="text-white text-base font-semibold mb-4">이 사진을 여행에 추가할까요?</h2>

        <div className="flex flex-col gap-2 mb-4">
          <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer">
            <input type="radio" checked={mode === 'none'} onChange={() => setMode('none')} />
            여행 추가 안 함
          </label>
          <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer">
            <input type="radio" checked={mode === 'existing'} onChange={() => setMode('existing')} />
            기존 여행에 추가
          </label>
          <label className="flex items-center gap-2 text-white/80 text-sm cursor-pointer">
            <input type="radio" checked={mode === 'new'} onChange={() => setMode('new')} />
            새 여행 생성
          </label>
        </div>

        {mode === 'existing' && (
          <div className="mb-4 max-h-32 overflow-y-auto flex flex-col gap-1">
            {loading && <p className="text-white/40 text-xs">불러오는 중...</p>}
            {!loading && trips.length === 0 && (
              <p className="text-white/40 text-xs">아직 만든 여행이 없어요.</p>
            )}
            {trips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => setSelectedTripId(trip.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors
                  ${selectedTripId === trip.id ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}
              >
                🧳 {trip.title} <span className="text-white/40 text-xs">({trip.photo_count}장)</span>
              </button>
            ))}
          </div>
        )}

        {mode === 'new' && (
          <input
            type="text"
            value={newTripTitle}
            onChange={(e) => setNewTripTitle(e.target.value)}
            placeholder="여행 이름 (예: 2024 일본 여행)"
            className="w-full mb-4 px-3 py-2 rounded-lg bg-white/5 border border-white/10
                       text-white text-sm placeholder-white/30 outline-none focus:border-white/30"
          />
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-white/60 text-sm hover:bg-white/10"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={mode === 'existing' && !selectedTripId}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium
                       hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}