import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import {
  earthVertexShader,
  earthFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader,
} from '../shaders/earthShaders'

// 실사 지구 텍스처 (개발용 — 배포 전 /public/textures로 자체 호스팅 권장)
const TEXTURES = {
  day: 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
  night: 'https://threejs.org/examples/textures/planets/earth_lights_2048.png',
  specular: 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
  clouds: 'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
}

function Earth() {
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
    // 구름이 지구보다 살짝 빠르게 자전 -> 패럴랙스 느낌
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.015
  })

  return (
    <group>
      {/* 지구 본체 */}
      <mesh ref={earthRef} material={earthMaterial}>
        <sphereGeometry args={[2, 64, 64]} />
      </mesh>

      {/* 구름 레이어 */}
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

      {/* 대기 글로우 */}
      <mesh material={atmosphereMaterial} scale={1.08}>
        <sphereGeometry args={[2, 64, 64]} />
      </mesh>
    </group>
  )
}

export default function Globe() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true }}
      style={{ background: 'transparent' }}
    >
      {/* 태양광 (방향광) */}
      <directionalLight position={[5, 2, 5]} intensity={2.2} color="#fff4e0" />
      {/* 낮은 주변광 - 밤 쪽이 완전히 검게 안 보이도록 */}
      <ambientLight intensity={0.15} />

      <Earth />

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