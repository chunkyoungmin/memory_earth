import { latLngToVector3 } from './geo'

// 현재 시각 기준 태양이 지구 어디쯤 수직으로 떠 있는지(subsolar point) 계산
// -> 그 지점을 향하는 방향이 곧 "태양 빛이 오는 방향"
export function getSunDirection(date = new Date()) {
  // 1년 중 며칠째인지 (계절에 따른 태양 고도 변화 - 위도 방향)
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0))
  const dayOfYear = Math.floor((date - start) / 86400000)

  // 태양의 적위(declination) - 대략적인 근사식, 하지/동지 ±23.44도
  const declination = 23.44 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180)

  // UTC 시각 기준 태양이 수직으로 떠있는 경도
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  const rawLng = 15 * (12 - utcHours)
  const lng = (((rawLng + 180) % 360) + 360) % 360 - 180 // -180~180 범위로 정규화

  return latLngToVector3(declination, lng, 1) // 단위 벡터 (방향값)
}