import { useState } from 'react'
import { Html } from '@react-three/drei'
import { latLngToVector3 } from '../utils/geo'

export default function Pin({ photo, radius = 2 }) {
  const [cardOpen, setCardOpen] = useState(false)
  const position = latLngToVector3(photo.latitude, photo.longitude, radius + 0.02)

  return (
    <group position={position}>
      {/* 핀 마커 */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          setCardOpen((v) => !v)
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#ff5a5f" emissive="#ff5a5f" emissiveIntensity={0.6} />
      </mesh>

      {/* 클릭 시 나타나는 사진 카드 */}
      {cardOpen && (
        <Html distanceFactor={8} center>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-48 bg-[#161618]/95 backdrop-blur-md rounded-xl overflow-hidden
                       border border-white/10 shadow-2xl select-none"
          >
            <img
              src={`/uploads/${photo.file_path.split('/').pop()}`}
              alt={photo.title || '사진'}
              className="w-full h-28 object-cover"
            />
            <div className="p-3">
              <p className="text-white text-sm font-medium truncate">
                {photo.title || '제목 없음'}
              </p>
              <p className="text-white/50 text-xs mt-1">
                {photo.city || photo.country || '위치 정보 없음'}
              </p>
              {photo.taken_at && (
                <p className="text-white/40 text-xs">
                  {new Date(photo.taken_at).toLocaleDateString('ko-KR')}
                </p>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}