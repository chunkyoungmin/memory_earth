import { useRef, useEffect } from 'react'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { createRoot } from 'react-dom/client'

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN

function createPinPopupContent(photo, onToggleFavorite) {
  const container = document.createElement('div')
  container.className = 'w-48 bg-[#161618] rounded-xl overflow-hidden border border-white/10 shadow-2xl'

  const root = createRoot(container)
  root.render(
    <div>
      <div className="relative">
        <img src={photo.file_path} alt={photo.title || ''} className="w-full h-28 object-cover" />
        <button
          onClick={() => onToggleFavorite?.(photo.id)}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full text-sm ${
            photo.is_favorite ? 'bg-yellow-400 text-black' : 'bg-black/60 text-white/70'
          }`}
        >
          ★
        </button>
      </div>
      <div className="p-3">
        <p className="text-white text-sm font-medium truncate">{photo.title || '제목 없음'}</p>
        <p className="text-white/50 text-xs mt-1">{photo.city || photo.country || '위치 정보 없음'}</p>
        {photo.taken_at && (
          <p className="text-white/40 text-xs">{new Date(photo.taken_at).toLocaleDateString('ko-KR')}</p>
        )}
      </div>
    </div>
  )
  return container
}

export default function Globe({
  photos = [],
  placingMode = false,
  onLocationPick,
  tripPhotos = null,
  focusLatLng = null,
  onToggleFavorite,
}) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const entitiesRef = useRef([])
  const popupElRef = useRef(null)

  // 최초 생성
  useEffect(() => {
    if (viewerRef.current) return

    const viewer = new Cesium.Viewer(containerRef.current, {
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      // 프로젝트에 포함된 equirectangular 지구 텍스처를 전체 지구 레이어로 사용한다.
      // 외부 Ion 지도 타일 없이도 처음 진입한 지구본이 항상 표시된다.
      baseLayer: new Cesium.ImageryLayer(
        new Cesium.SingleTileImageryProvider({
          url: '/textures/8k_earth_daymap.jpg',
        })
      ),
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
    })

    // 미니멀한 배경 - 우주/별 배경 제거하고 심플한 단색
    viewer.scene.skyBox.show = false
    viewer.scene.skyAtmosphere.show = true
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#0a0a0c')
    viewer.scene.globe.enableLighting = true // 낮/밤 실시간 태양광 반영 (Cesium 기본 제공)
    viewer.scene.moon.show = false
    viewer.scene.sun.show = true

    // Cesium 1.145의 Viewer에는 creditContainer 속성이 없다.
    // 크레딧은 Cesium의 사용 조건에 따라 기본 표시한다.

    // 시작 위치: 지구 전체가 보이도록
    viewer.camera.flyHome(0)

    viewerRef.current = viewer

    return () => {
      viewer.destroy()
      viewerRef.current = null
    }
  }, [])

  // 지구본 클릭 -> 위치 수동 지정
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    handler.setInputAction((movement) => {
      if (!placingMode) return
      const cartesian = viewer.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid)
      if (!cartesian) return
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
      const lat = Cesium.Math.toDegrees(cartographic.latitude)
      const lng = Cesium.Math.toDegrees(cartographic.longitude)
      onLocationPick?.(lat, lng)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    return () => handler.destroy()
  }, [placingMode, onLocationPick])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    viewer.scene.canvas.style.cursor = placingMode ? 'crosshair' : ''
  }, [placingMode])

  // 사진 핀 렌더링
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    entitiesRef.current.forEach((e) => viewer.entities.remove(e))
    entitiesRef.current = []

    photos.forEach((photo) => {
      if (photo.latitude == null || photo.longitude == null) return

      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(photo.longitude, photo.latitude),
        point: {
          pixelSize: 10,
          color: photo.is_favorite
            ? Cesium.Color.fromCssColorString('#ffd166')
            : Cesium.Color.fromCssColorString('#ff5a5f'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      })
      entity._photo = photo
      entitiesRef.current.push(entity)
    })
  }, [photos])

  // 핀 클릭 -> 팝업 카드 표시 (직접 화면 좌표 계산해서 HTML 오버레이)
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

    handler.setInputAction((click) => {
      // 기존 팝업 제거
      if (popupElRef.current) {
        popupElRef.current.remove()
        popupElRef.current = null
      }

      const picked = viewer.scene.pick(click.position)
      if (!Cesium.defined(picked) || !picked.id?._photo) return

      const photo = picked.id._photo
      const popupContent = createPinPopupContent(photo, onToggleFavorite)
      popupContent.style.position = 'absolute'
      popupContent.style.left = `${click.position.x + 10}px`
      popupContent.style.top = `${click.position.y - 10}px`
      popupContent.style.zIndex = 50
      containerRef.current.appendChild(popupContent)
      popupElRef.current = popupContent
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    return () => handler.destroy()
  }, [onToggleFavorite])

  // 여행 경로 선 그리기
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    const pathId = 'trip-path-entity'
    const existing = viewer.entities.getById(pathId)
    if (existing) viewer.entities.remove(existing)

    const withGps = (tripPhotos || []).filter((p) => p.latitude != null && p.longitude != null)
    if (withGps.length < 2) return

    const positions = withGps.flatMap((p) => [p.longitude, p.latitude])

    viewer.entities.add({
      id: pathId,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(positions),
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString('#ffd166'),
        }),
        clampToGround: true,
      },
    })
  }, [tripPhotos])

  // 특정 위치로 카메라 이동 (Memory Replay, 여행 스토리 슬라이더)
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !focusLatLng) return

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(focusLatLng.lng, focusLatLng.lat, 15000),
      duration: 2.5,
    })
  }, [focusLatLng])

  return <div ref={containerRef} className="w-full h-full relative" />
}
