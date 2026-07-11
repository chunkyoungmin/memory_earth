import { useState, useEffect } from 'react'
import axios from 'axios'

export default function ProfilePage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    axios.get('/api/admin/profile').then((res) => setData(res.data))
  }, [])

  if (!data) return <div className="min-h-screen bg-earth-bg text-white p-10">불러오는 중...</div>

  return (
    <div className="min-h-screen bg-earth-bg text-white p-6 pt-10">
      <h1 className="text-xl font-semibold mb-6">👤 프로필</h1>

      <div className="max-w-sm p-5 rounded-2xl bg-white/5 border border-white/10">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl mb-3">
          🌍
        </div>
        <p className="font-medium">{data.user.display_name || '이름 없음'}</p>
        <p className="text-white/50 text-sm mb-4">{data.user.email}</p>

        <div className="flex gap-4 text-sm">
          <div>
            <p className="text-white/40 text-xs">사진</p>
            <p className="font-semibold">{data.photoCount}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs">여행</p>
            <p className="font-semibold">{data.tripCount}</p>
          </div>
        </div>

        <p className="text-white/30 text-xs mt-4">
          가입일: {new Date(data.user.created_at).toLocaleDateString('ko-KR')}
        </p>
      </div>
    </div>
  )
}