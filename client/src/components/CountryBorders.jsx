import { useEffect, useState, useMemo } from 'react'
import { Line } from '@react-three/drei'
import { latLngToVector3 } from '../utils/geo'

// 공개 국가 경계 GeoJSON (가벼운 버전)
const GEOJSON_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json'

export default function CountryBorders({ radius = 2 }) {
  const [geojson, setGeojson] = useState(null)

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((res) => res.json())
      .then(setGeojson)
      .catch((err) => console.warn('국가 경계 데이터를 불러오지 못했습니다:', err))
  }, [])

  const lines = useMemo(() => {
    if (!geojson) return []
    const result = []
    const r = radius + 0.004 // 표면 위로 살짝 띄워서 겹침 현상 방지

    for (const feature of geojson.features) {
      const geom = feature.geometry
      if (!geom) continue

      const polygons =
        geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : []

      for (const polygon of polygons) {
        for (const ring of polygon) {
          const points = ring.map(([lng, lat]) => latLngToVector3(lat, lng, r))
          if (points.length > 1) result.push(points)
        }
      }
    }
    return result
  }, [geojson, radius])

  if (lines.length === 0) return null

  return (
    <>
      {lines.map((points, i) => (
        <Line key={i} points={points} color="#ffffff" transparent opacity={0.25} lineWidth={0.6} />
      ))}
    </>
  )
}