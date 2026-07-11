import { useState, useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { latLngToVector3 } from '../utils/geo'

export default function Pin({ photo, radius = 2, onToggleFavorite }) {
  const [cardOpen, setCardOpen] = useState(false)

  const surfacePoint = useMemo(
    () => latLngToVector3(photo.latitude, photo.longitude, radius),
    [photo.latitude, photo.longitude, radius]
  )
  const normal = useMemo(() => surfacePoint.clone().normalize(), [surfacePoint])
  const quaternion = useMemo(
    () => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal),
    [normal]
  )

  const needleHeight = 0.06
  const headRadius = 0.014

  return (
    <group position={surfacePoint} quaternion={quaternion}>
      <group
        onClick={(e) => {
          e.stopPropagation()
          setCardOpen((v) => !v)
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        {/* 뾰족한 침 부분 - 표면에 박히는 지점 */}
        <mesh position={[0, needleHeight / 2, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.006, needleHeight, 8]} />
          <meshStandardMaterial color="#ff5a5f" />
        </mesh>

        {/* 머리 부분 - 침 끝에 떠 있는 작은 구 */}
        <mesh position={[0, needleHeight + headRadius * 0.6, 0]}>
          <sphereGeometry args={[headRadius, 16, 16]} />
          <meshStandardMaterial
            color={photo.is_favorite ? '#ffd166' : '#ff5a5f'}
            emissive={photo.is_favorite ? '#ffd166' : '#ff5a5f'}
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {cardOpen && (
        <Html position={[0, needleHeight + headRadius * 2, 0]} distanceFactor={8} center>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-48 bg-[#161618]/95 backdrop-blur-md rounded-xl overflow-hidden
                       border border-white/10 shadow-2xl select-none"
          >
            <div className="relative">
              <img
                src={`/uploads/${photo.file_path.split('/').pop()}`}
                alt={photo.title || '사진'}
                className="w-full h-28 object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite?.(photo.id)
                }}
                className={`absolute top-2 right-2 w-7 h-7 rounded-full text-sm
                  ${photo.is_favorite ? 'bg-yellow-400 text-black' : 'bg-black/60 text-white/70'}`}
              >
                ★
              </button>
            </div>
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