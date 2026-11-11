import * as Cesium from 'cesium'

const DETAIL_START_HEIGHT = 6_000_000
const DETAIL_FULL_HEIGHT = 2_000_000
const TERRITORIAL_START_HEIGHT = 1_200_000
const MARINE_WMS = 'https://geo.vliz.be/geoserver/MarineRegions/wms'

function getScale(viewer) {
  const { canvas, globe } = viewer.scene
  const center = new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2)
  const start = viewer.camera.pickEllipsoid(center, globe.ellipsoid)
  const end = viewer.camera.pickEllipsoid(
    new Cesium.Cartesian2(center.x + 100, center.y),
    globe.ellipsoid,
  )
  if (!start || !end) return null

  const distance = new Cesium.EllipsoidGeodesic(
    globe.ellipsoid.cartesianToCartographic(start),
    globe.ellipsoid.cartesianToCartographic(end),
    globe.ellipsoid,
  ).surfaceDistance
  if (!Number.isFinite(distance) || distance <= 0) return null

  const magnitude = 10 ** Math.floor(Math.log10(distance))
  const step = [5, 2, 1].find((value) => value * magnitude <= distance)
  const meters = step * magnitude
  return {
    width: Math.round(100 * meters / distance),
    label: meters >= 1000 ? `${meters / 1000} km` : `${meters} m`,
  }
}

// Providers request only visible tiles. Keep the dusk globe underneath for distant views.
export function createMapDetails(viewer, onViewChange, onErrorChange, onLoadingChange) {
  const marineCredit = new Cesium.Credit(
    '<a href="https://www.marineregions.org/" target="_blank" rel="noopener noreferrer">Marine Regions / VLIZ</a> (CC BY)',
    true,
  )
  const sources = [
    {
      key: 'streets',
      name: '지명·도로',
      enabled: true,
      createProvider: () => new Cesium.OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/',
        maximumLevel: 19,
        credit: new Cesium.Credit(
          '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          true,
        ),
      }),
    },
    {
      key: 'territorial',
      name: '영해',
      enabled: true,
      wmsLayer: 'eez_12nm',
    },
    {
      key: 'eez',
      name: 'EEZ',
      enabled: true,
      wmsLayer: 'eez_boundaries',
    },
  ]
  let disposed = false

  function reportErrors() {
    onErrorChange(sources.filter((source) => source.failed).map((source) => source.name))
  }

  function addLayer(source) {
    const provider = source.createProvider ? source.createProvider() : new Cesium.WebMapServiceImageryProvider({
      url: MARINE_WMS,
      layers: source.wmsLayer,
      parameters: { format: 'image/png', transparent: true, version: '1.1.1' },
      maximumLevel: 12,
      enablePickFeatures: false,
      credit: marineCredit,
    })
    source.layer = new Cesium.ImageryLayer(provider, { show: false })
    viewer.imageryLayers.add(source.layer)
    source.removeErrorListener = provider.errorEvent.addEventListener((error) => {
      if (disposed) return
      error.retry = error.timesRetried < 1
      if (!error.retry) {
        source.failed = true
        reportErrors()
      }
    })
  }

  function update() {
    if (disposed) return
    const height = viewer.camera.positionCartographic.height
    const amount = Cesium.Math.clamp(
      (DETAIL_START_HEIGHT - height) / (DETAIL_START_HEIGHT - DETAIL_FULL_HEIGHT), 0, 1,
    )
    const detailed = amount > 0
    const [streets, territorial, eez] = sources
    streets.layer.show = detailed
    streets.layer.alpha = amount
    territorial.layer.show = territorial.enabled && height < TERRITORIAL_START_HEIGHT
    territorial.layer.alpha = 0.22
    eez.layer.show = eez.enabled && detailed
    eez.layer.alpha = amount
    // Printed map labels need even illumination on either side of the globe.
    viewer.scene.globe.enableLighting = amount < 1
    viewer.scene.globe.maximumScreenSpaceError = detailed ? 1 : 2
    onViewChange({ detailed, scale: detailed ? getScale(viewer) : null })
  }

  sources.forEach(addLayer)
  const removeCameraListener = viewer.camera.changed.addEventListener(update)
  const removeMoveEndListener = viewer.camera.moveEnd.addEventListener(update)
  const removeLoadingListener = viewer.scene.globe.tileLoadProgressEvent.addEventListener((remaining) => {
    if (!disposed) onLoadingChange(remaining > 0)
  })
  const resizeObserver = new ResizeObserver(update)
  resizeObserver.observe(viewer.canvas)
  update()

  return {
    setVisible(key, enabled) {
      const source = sources.find((item) => item.key === key)
      if (source) source.enabled = enabled
      update()
    },
    retry() {
      sources.filter((source) => source.failed).forEach((source) => {
        source.removeErrorListener()
        viewer.imageryLayers.remove(source.layer, true)
        source.failed = false
        addLayer(source)
      })
      // Retrying the base map must keep the maritime overlays above it.
      sources.forEach((source) => viewer.imageryLayers.raiseToTop(source.layer))
      reportErrors()
      update()
    },
    destroy() {
      disposed = true
      removeCameraListener()
      removeMoveEndListener()
      removeLoadingListener()
      resizeObserver.disconnect()
      sources.forEach((source) => {
        source.removeErrorListener()
        viewer.imageryLayers.remove(source.layer, true)
      })
    },
  }
}
