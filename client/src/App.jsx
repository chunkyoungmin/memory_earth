import { Routes, Route } from 'react-router-dom'

function Home() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center gap-3 bg-background text-white">
      <span className="text-5xl">🌍</span>
      <h1 className="text-2xl font-semibold tracking-tight">Earth Memory</h1>
      <p className="text-white/50 text-sm">Every Photo Has A Place.</p>
      <p className="mt-8 text-xs text-white/30">
        Part 1 — 개발 환경 구성 완료. 3D 지구본은 Part 2에서 구현됩니다.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}
