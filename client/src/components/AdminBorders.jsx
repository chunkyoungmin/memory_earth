import { useEffect, useState, useMemo } from 'react'
import { Line } from '@react-three/drei'
import { latLngToVector3 } from '../utils/geo'

const GEOJSON_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces_lakes.geojson'

export default function AdminBorders({ radius = 2 }) {
  const [geojson, setGeojson] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (geojson || loading) return
    setLoading(true)
    fetch(GEOJSON_URL)
      .then((res) => res.json())
      .then(setGeojson)
      .catch((err) => console.warn('주/도 경계 데이터를 불러오지 못했습니다:', err))
      .finally(() => setLoading(false))
  }, [geojson, loading])

  const lines = useMemo(() => {
    if (!geojson) return []
    const result = []
    const r = radius + 0.006

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
        <Line key={i} points={points} color="#ffffff" transparent opacity={0.45} lineWidth={0.8} />
      ))}
    </>
  )
}