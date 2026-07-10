import * as THREE from 'three'

// 위도/경도 -> 구 표면의 3D 좌표
export function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

// 클릭한 3D 좌표 -> 위도/경도 (사용자가 지구본을 직접 클릭했을 때)
export function vector3ToLatLng(point) {
  const normalized = point.clone().normalize()
  const lat = 90 - (Math.acos(normalized.y) * 180) / Math.PI
  let lng = (Math.atan2(normalized.z, -normalized.x) * 180) / Math.PI - 180
  if (lng < -180) lng += 360

  return { lat, lng }
}
// 두 지점을 잇는 곡선(비행 경로 느낌) 좌표 배열 생성
export function greatCircleArcPoints(latA, lngA, latB, lngB, radius, segments = 40) {
  const pointA = latLngToVector3(latA, lngA, radius)
  const pointB = latLngToVector3(latB, lngB, radius)

  // 중간 지점을 살짝 바깥으로 띄워서 곡선 형태로 만듦
  const midpoint = pointA.clone().add(pointB).multiplyScalar(0.5)
  const distance = pointA.distanceTo(pointB)
  midpoint.normalize().multiplyScalar(radius + distance * 0.3)

  const curve = new THREE.QuadraticBezierCurve3(pointA, midpoint, pointB)
  return curve.getPoints(segments)
}