import { Line } from '@react-three/drei'
import { greatCircleArcPoints } from '../utils/geo'

export default function TripPath({ photos, radius = 2 }) {
  const withGps = photos.filter((p) => p.latitude != null && p.longitude != null)
  if (withGps.length < 2) return null

  const segments = []
  for (let i = 0; i < withGps.length - 1; i++) {
    const a = withGps[i]
    const b = withGps[i + 1]
    segments.push(greatCircleArcPoints(a.latitude, a.longitude, b.latitude, b.longitude, radius))
  }

  return (
    <>
      {segments.map((points, i) => (
        <Line key={i} points={points} color="#ffd166" lineWidth={1.5} transparent opacity={0.85} />
      ))}
    </>
  )
}