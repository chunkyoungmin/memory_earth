import { useState, useEffect, useMemo, useCallback } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Globe from './components/Globe'
import Sidebar from './components/Sidebar'
import PhotoUploader from './components/PhotoUploader'
import TripsPage from './pages/TripsPage'
import AdminPage from './pages/AdminPage'
import Timeline from './components/Timeline'
import ReplayButton from './components/ReplayButton'
import { usePhotos } from './hooks/usePhotos'

const REPLAY_STEP_MS = 3000

function Home({ activeTripId }) {
  const { photos, addOrUpdatePhoto, setPhotoLocation } = usePhotos()
  const [placingPhotoId, setPlacingPhotoId] = useState(null)
  const [tripPhotos, setTripPhotos] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)
  const [replaying, setReplaying] = useState(false)
  const [replayIndex, setReplayIndex] = useState(0)

  useEffect(() => {
    if (!activeTripId) {
      setTripPhotos(null)
      return
    }
    axios.get(`/api/trips/${activeTripId}/photos`).then((res) => setTripPhotos(res.data.photos))
  }, [activeTripId])

  const chronoPhotos = useMemo(
    () =>
      [...photos]
        .filter((p) => p.latitude != null && p.taken_at)
        .sort((a, b) => new Date(a.taken_at) - new Date(b.taken_at)),
    [photos]
  )

  const visiblePhotos = useMemo(() => {
    if (selectedYear == null) return photos
    return photos.filter((p) => !p.taken_at || new Date(p.taken_at).getFullYear() <= selectedYear)
  }, [photos, selectedYear])

  function handleUploaded(data) {
    addOrUpdatePhoto(data.photo)
    if (!data.hasGps) setPlacingPhotoId(data.photo.id)
  }

  async function handleLocationPick(lat, lng) {
    if (!placingPhotoId) return
    await setPhotoLocation(placingPhotoId, lat, lng)
    setPlacingPhotoId(null)
  }

  const startReplay = useCallback(() => {
    if (chronoPhotos.length === 0) return
    setReplaying(true)
    setReplayIndex(0)
  }, [chronoPhotos])

  useEffect(() => {
    if (!replaying) return
    if (replayIndex >= chronoPhotos.length) {
      setReplaying(false)
      return
    }
    const timer = setTimeout(() => {
      setReplayIndex((i) => i + 1)
    }, REPLAY_STEP_MS)
    return () => clearTimeout(timer)
  }, [replaying, replayIndex, chronoPhotos.length])

  const currentReplayPhoto = replaying ? chronoPhotos[replayIndex] : null
  const focusLatLng = currentReplayPhoto
    ? { lat: currentReplayPhoto.latitude, lng: currentReplayPhoto.longitude }
    : null

  return (
    <div className="w-full h-screen relative overflow-hidden bg-earth-bg">
      <Globe
        photos={replaying ? [currentReplayPhoto].filter(Boolean) : visiblePhotos}
        placingMode={!!placingPhotoId}
        onLocationPick={handleLocationPick}
        tripPhotos={tripPhotos}
        focusLatLng={focusLatLng}
      />

      {!replaying && (
        <div className="pointer-events-none absolute inset-x-0 top-24 flex flex-col items-center gap-1">
          <h1 className="text-white text-2xl font-semibold tracking-tight">Earth Memory</h1>
          <p className="text-white/50 text-sm">Every Photo Has A Place.</p>
        </div>
      )}

      {replaying && currentReplayPhoto && (
        <div className="pointer-events-none absolute inset-x-0 top-24 flex flex-col items-center gap-1">
          <p className="text-white text-3xl font-semibold">
            {new Date(currentReplayPhoto.taken_at).getFullYear()}
          </p>
          <p className="text-white/70 text-sm">
            {currentReplayPhoto.title || currentReplayPhoto.city || '어딘가'}
          </p>
        </div>
      )}

      {placingPhotoId && (
        <div className="absolute top-20 inset-x-0 flex justify-center pointer-events-none">
          <p className="bg-black/60 text-white text-sm px-4 py-2 rounded-full">
            📍 사진이 찍힌 위치를 지구본에서 클릭해주세요
          </p>
        </div>
      )}

      <ReplayButton
        onClick={startReplay}
        disabled={chronoPhotos.length === 0 || replaying}
        isReplaying={replaying}
      />

      {!replaying && <Timeline photos={photos} selectedYear={selectedYear} onChange={setSelectedYear} />}

      <PhotoUploader onUploaded={handleUploaded} />
    </div>
  )
}

export default function App() {
  const [activeTripId, setActiveTripId] = useState(null)
  const navigate = useNavigate()

  return (
    <>
      <Sidebar onNavigate={(path) => navigate(path)} />

      <div className="pl-64">
        <Routes>
          <Route path="/" element={<Home activeTripId={activeTripId} />} />
          <Route path="/gallery" element={<div className="text-white p-10">전체 갤러리 (준비 중)</div>} />
          <Route
            path="/trips"
            element={
              <TripsPage
                onSelectTrip={(id) => {
                  setActiveTripId(id)
                  navigate('/')
                }}
              />
            }
          />
          <Route path="/favorites" element={<div className="text-white p-10">즐겨찾기 (준비 중)</div>} />
          <Route path="/profile" element={<div className="text-white p-10">프로필 (준비 중)</div>} />
          <Route path="/settings" element={<AdminPage />} />
        </Routes>
      </div>
    </>
  )
}