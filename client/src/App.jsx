import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Globe from './components/Globe'
import Sidebar from './components/Sidebar'
import HamburgerButton from './components/HamburgerButton'

function Home() {
  return (
    <div className="w-screen h-screen relative overflow-hidden bg-earth-bg">
      <Globe />
      <div className="pointer-events-none absolute inset-x-0 bottom-24 flex flex-col items-center gap-1">
        <h1 className="text-white text-2xl font-semibold tracking-tight">Earth Memory</h1>
        <p className="text-white/50 text-sm">Every Photo Has A Place.</p>
      </div>
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
        {/* Part 4~9에서 아래 페이지들 실제로 구현 예정 */}
        <Route path="/gallery" element={<div className="text-white p-10">전체 갤러리 (준비 중)</div>} />
        <Route path="/trips" element={<div className="text-white p-10">여행 (준비 중)</div>} />
        <Route path="/favorites" element={<div className="text-white p-10">즐겨찾기 (준비 중)</div>} />
        <Route path="/profile" element={<div className="text-white p-10">프로필 (준비 중)</div>} />
        <Route path="/settings" element={<div className="text-white p-10">설정 (준비 중)</div>} />
      </Routes>
    </>
  )
}