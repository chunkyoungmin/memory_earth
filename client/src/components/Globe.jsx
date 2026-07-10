import { useRef, useMemo, useState, useCallback } from 'react'
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
import { vector3ToLatLng } from '../utils/geo'

const TEXTURES = {
  day: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  night: 'https://threejs.org/examples/textures/planets/earth_lights_2048.png',
  specular: 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
  clouds: 'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
}

function Earth({ photos, placingMode, onLocationPick }) {
  const earthRef = useRef()
  const cloudsRef = useRef()

  const [dayMap, nightMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    TEXTURES.day,
    TEXTURES.night,
    TEXTURES.specular,
    TEXTURES.clouds,
  ])

  const sunDirection = useMemo(() => new THREE.Vector3(5, 2, 5).normalize(), [])

  const earthMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          dayTexture: { value: dayMap },
          nightTexture: { value: nightMap },
          specularTexture: { value: specularMap },
          sunDirection: { value: sunDirection },
        },
        vertexShader: earthVertexShader,
        fragmentShader: earthFragmentShader,
      }),
    [dayMap, nightMap, specularMap, sunDirection]
  )

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

  // 위치 지정 모드일 때 지구본 클릭 -> 위도/경도로 변환해서 상위로 전달
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
        <sphereGeometry args={[2, 64, 64]} />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.02, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          alphaMap={cloudsMap}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      <mesh material={atmosphereMaterial} scale={1.08}>
        <sphereGeometry args={[2, 64, 64]} />
      </mesh>

      {/* 핀들 */}
      {photos.map((photo) => (
        <Pin key={photo.id} photo={photo} radius={2} />
      ))}
    </group>
  )
}

export default function Globe({ photos = [], placingMode = false, onLocationPick }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true }}
      style={{ background: 'transparent', cursor: placingMode ? 'crosshair' : 'default' }}
    >
      <directionalLight position={[5, 2, 5]} intensity={2.2} color="#fff4e0" />
      <ambientLight intensity={0.15} />

      <Earth photos={photos} placingMode={placingMode} onLocationPick={onLocationPick} />

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={3}
        maxDistance={12}
        rotateSpeed={0.5}
        zoomSpeed={0.6}
      />
    </Canvas>
  )
}