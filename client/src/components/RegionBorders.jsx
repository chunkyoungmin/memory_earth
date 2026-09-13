import { useEffect, useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { latLngToVector3, vector3ToLatLng } from '../utils/geo'

const COUNTRY_GEOJSON_URL = 'https://raw.githubusercontent.com/johan/world.g{0.15}eo.json/master/countries.geo.json'
const GEOBOUNDARIES_API = 'https://www.geoboundaries.org/api/current/gbOpen'

// 나라별로 한 번 불러온 데이터는 재사용 (다시 확대해도 재요청 안 함)
const regionCache = new Map()

function pointInRing(lng, lat, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

// 지금 보고 있는 위/경도가 어느 나라 안에 있는지 찾기 (ISO 3자리 코드 반환)
function findCountryISO(lng, lat, countryGeojson) {
  if (!countryGeojson) return null
  for (const feature of countryGeojson.features) {
    const geom = feature.geometry
    if (!geom) continue
    const polygons =
      geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : []
    for (const polygon of polygons) {
      if (polygon[0] && pointInRing(lng, lat, polygon[0])) {
        return feature.id || null
      }
    }
  }
  return null
}

export default function RegionBorders({ radius = 2, active }) {
  const { camera } = useThree()
  const [countryGeojson, setCountryGeojson] = useState(null)
  const [currentISO, setCurrentISO] = useState(null)
  const [regionLines, setRegionLines] = useState([])
  const lastCheckRef = useRef(0)

  useEffect(() => {
    fetch(COUNTRY_GEOJSON_URL)
      .then((res) => res.json())
      .then(setCountryGeojson)
      .catch((err) => console.warn('국가 데이터를 불러오지 못했습니다:', err))
  }, [])

  // 0.5초마다 "지금 화면 중심이 어느 나라인지" 체크
  useFrame(() => {
    if (!active || !countryGeojson) return
    const now = performance.now()
    if (now - lastCheckRef.current < 500) return
    lastCheckRef.current = now

    const viewPoint = camera.position.clone().normalize().multiplyScalar(radius)
    const { lat, lng } = vector3ToLatLng(viewPoint)
    const iso = findCountryISO(lng, lat, countryGeojson)

    if (iso && iso !== currentISO) {
      setCurrentISO(iso)
    }
  })

  // 나라가 바뀌면 그 나라의 시/군/구 데이터 요청
  useEffect(() => {
    if (!currentISO) return

    if (regionCache.has(currentISO)) {
      const cached = regionCache.get(currentISO)
      if (cached) setRegionLines(cached)
      return
    }

    regionCache.set(currentISO, null)

    fetch(`${GEOBOUNDARIES_API}/${currentISO}/ADM2/`)
      .then((res) => res.json())
      .then((meta) => fetch(meta.gjDownloadURL))
      .then((res) => res.json())
      .then((geojson) => {
        const r = radius + 0.008
        const lines = []
        for (const feature of geojson.features) {
          const geom = feature.geometry
          if (!geom) continue
          const polygons =
            geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : []
          for (const polygon of polygons) {
            for (const ring of polygon) {
              const points = ring.map(([lng, lat]) => latLngToVector3(lat, lng, r))
              if (points.length > 1) lines.push(points)
            }
          }
        }
        regionCache.set(currentISO, lines)
        setRegionLines(lines)
      })
      .catch((err) => {
        console.warn(`${currentISO} 시/군/구 데이터를 불러오지 못했습니다:`, err)
        regionCache.set(currentISO, [])
      })
  }, [currentISO, radius])

  if (!active || regionLines.length === 0) return null

  return (
    <>
      {regionLines.map((points, i) => (
        <Line key={i} points={points} color="#ffffff" transparent opacity={0.5} lineWidth={0.9} />
      ))}
    </>
  )
}