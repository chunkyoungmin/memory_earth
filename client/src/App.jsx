import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Globe from './components/Globe'
import Sidebar from './components/Sidebar'
import HamburgerButton from './components/HamburgerButton'
import PhotoUploader from './components/PhotoUploader'
import { usePhotos } from './hooks/usePhotos'

function Home() {
  const { photos, addOrUpdatePhoto, setPhotoLocation } = usePhotos()
  const [placingPhotoId, setPlacingPhotoId] = useState(null)

  function handleUploaded(data) {
    addOrUpdatePhoto(data.photo)
    if (!data.hasGps) {
      // GPS 없는 사진 -> 위치 지정 모드로 전환
      setPlacingPhotoId(data.photo.id)
    }
  }

  async function handleLocationPick(lat, lng) {
    if (!placingPhotoId) return
    await setPhotoLocation(placingPhotoId, lat, lng)
    setPlacingPhotoId(null)
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-earth-bg">
      <Globe
        photos={photos}
        placingMode={!!placingPhotoId}
        onLocationPick={handleLocationPick}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-24 flex flex-col items-center gap-1">
        <h1 className="text-white text-2xl font-semibold tracking-tight">Earth Memory</h1>
        <p className="text-white/50 text-sm">Every Photo Has A Place.</p>
      </div>

      {placingPhotoId && (
        <div className="absolute top-20 inset-x-0 flex justify-center pointer-events-none">
          <p className="bg-black/60 text-white text-sm px-4 py-2 rounded-full">
            📍 사진이 찍힌 위치를 지구본에서 클릭해주세요
          </p>
        </div>
      )}

      <PhotoUploader onUploaded={handleUploaded} />
    </div>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <HamburgerButton onClick={() => setSidebarOpen(true)} isOpen={sidebarOpen} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(path) => navigate(path)}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<div className="text-white p-10">전체 갤러리 (준비 중)</div>} />
        <Route path="/trips" element={<div className="text-white p-10">여행 (준비 중)</div>} />
        <Route path="/favorites" element={<div className="text-white p-10">즐겨찾기 (준비 중)</div>} />
        <Route path="/profile" element={<div className="text-white p-10">프로필 (준비 중)</div>} />
        <Route path="/settings" element={<div className="text-white p-10">설정 (준비 중)</div>} />
      </Routes>
    </>
  )
}