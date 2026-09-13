import { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import {
  earthVertexShader,
  earthFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader,
} from '../shaders/earthShaders'
import Pin from './Pin'
import TripPath from './TripPath'
import CountryBorders from './CountryBorders'
import AdminBorders from './AdminBorders'
import RegionBorders from './RegionBorders'
import { vector3ToLatLng, latLngToVector3 } from '../utils/geo'
import { getSunDirection } from '../utils/sunPosition'

const TEXTURES = {
  day: '/textures/2k_earth_daymap.jpg',
  night: '/textures/2k_earth_nightmap.jpg',
  specular: '/textures/2k_earth_specular_map.jpg',
  clouds: '/textures/2k_earth_clouds.jpg',
}

function CameraRig({ focusLatLng, controlsRef }) {
  const { camera } = useThree()
  useFrame(() => {
    if (!focusLatLng) return
    const target = latLngToVector3(focusLatLng.lat, focusLatLng.lng, 2)
    const desiredCamPos = target.clone().normalize().multiplyScalar(4.2)
    camera.position.lerp(desiredCamPos, 0.035)
    if (controlsRef.current) {
      controlsRef.current.target.lerp(target, 0.035)
      controlsRef.current.update()
    }
  })
  return null
}

function ZoomWatcher({ onAdminBordersChange, onRegionBordersChange, onMaxZoom, earthMaterialRef }) {
  const { camera } = useThree()
  const triggeredRef = useRef(false)

  useFrame(() => {
    const dist = camera.position.length()
    const blend = 1 - THREE.MathUtils.smoothstep(dist, 2.6, 3.3)
    if (earthMaterialRef.current) {
      earthMaterialRef.current.uniforms.mapBlend.value = blend
    }
    onAdminBordersChange(dist < 3.5)
    onRegionBordersChange(dist < 2.4)

    // 최대로 확대하면 (2.15 이하) 딱 한 번만 평면 지도 전환 신호 보내기
    if (dist < 2.15 && !triggeredRef.current) {
      triggeredRef.current = true
      const surfacePoint = camera.position.clone().normalize().multiplyScalar(2)
      const { lat, lng } = vector3ToLatLng(surfacePoint)
      onMaxZoom(lat, lng)
    }
    if (dist > 2.3) {
      triggeredRef.current = false // 다시 축소하면 재트리거 가능하게 초기화
    }
  })
  return null
}

function Earth({
  photos,
  placingMode,
  onLocationPick,
  tripPhotos,
  onToggleFavorite,
  sunDirectionRef,
  showAdminBorders,
  showRegionBorders,
  earthMaterialRef,
}) {
  const earthRef = useRef()
  const cloudsRef = useRef()

  const [dayMap, nightMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    TEXTURES.day,
    TEXTURES.night,
    TEXTURES.specular,
    TEXTURES.clouds,
  ])

  const earthMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayMap },
        nightTexture: { value: nightMap },
        specularTexture: { value: specularMap },
        sunDirection: { value: sunDirectionRef.current },
        mapBlend: { value: 0 },
      },
      vertexShader: earthVertexShader,
      fragmentShader: earthFragmentShader,
    })
    earthMaterialRef.current = material
    return material
  }, [dayMap, nightMap, specularMap, sunDirectionRef, earthMaterialRef])

  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
      }),
    []
  )

  useFrame((_, delta) => {
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.015
  })

  const handleEarthClick = useCallback(
    (e) => {
      if (!placingMode) return
      e.stopPropagation()
      const { lat, lng } = vector3ToLatLng(e.point)
      onLocationPick?.(lat, lng)
    },
    [placingMode, onLocationPick]
  )

  return (
    <group>
      <mesh ref={earthRef} material={earthMaterial} onClick={handleEarthClick}>
        <sphereGeometry args={[2, 128, 128]} />
      </mesh>

      <CountryBorders radius={2} />
      {showAdminBorders && <AdminBorders radius={2} />}
      <RegionBorders radius={2} active={showRegionBorders} />

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.02, 64, 64]} />
        <meshStandardMaterial map={cloudsMap} alphaMap={cloudsMap} transparent opacity={0.4} depthWrite={false} />
      </mesh>

      <mesh material={atmosphereMaterial} scale={1.08}>
        <sphereGeometry args={[2, 64, 64]} />
      </mesh>

      {photos.map((photo) => (
        <Pin key={photo.id} photo={photo} radius={2} onToggleFavorite={onToggleFavorite} />
      ))}

      {tripPhotos && <TripPath photos={tripPhotos} radius={2} />}
    </group>
  )
}

function SunLight({ sunDirectionRef }) {
  const lightRef = useRef()
  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.copy(sunDirectionRef.current).multiplyScalar(5)
    }
  })
  return <directionalLight ref={lightRef} intensity={2.2} color="#fff4e0" />
}

export default function Globe({
  photos = [],
  placingMode = false,
  onLocationPick,
  tripPhotos = null,
  focusLatLng = null,
  onToggleFavorite,
  onMaxZoom,
}) {
  const controlsRef = useRef()
  const sunDirectionRef = useRef(getSunDirection())
  const earthMaterialRef = useRef(null)
  const [showAdminBorders, setShowAdminBorders] = useState(false)
  const [showRegionBorders, setShowRegionBorders] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      sunDirectionRef.current.copy(getSunDirection())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true }}
      style={{ background: 'transparent', cursor: placingMode ? 'crosshair' : 'default' }}
    >
      <SunLight sunDirectionRef={sunDirectionRef} />
      <ambientLight intensity={0.15} />

      <Earth
        photos={photos}
        placingMode={placingMode}
        onLocationPick={onLocationPick}
        tripPhotos={tripPhotos}
        onToggleFavorite={onToggleFavorite}
        sunDirectionRef={sunDirectionRef}
        showAdminBorders={showAdminBorders}
        showRegionBorders={showRegionBorders}
        earthMaterialRef={earthMaterialRef}
      />

      <ZoomWatcher
        onAdminBordersChange={setShowAdminBorders}
        onRegionBordersChange={setShowRegionBorders}
        onMaxZoom={onMaxZoom}
        earthMaterialRef={earthMaterialRef}
      />
      <CameraRig focusLatLng={focusLatLng} controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        enabled={!focusLatLng}
        enablePan={false}
        enableZoom
        minDistance={2.1}
        maxDistance={12}
        rotateSpeed={0.5}
        zoomSpeed={0.6}
      />
    </Canvas>
  )
}