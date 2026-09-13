import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapView({ lat, lng, onClose }) {
  return (
    <div className="fixed inset-0 z-[90] bg-black">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>

      <button
        onClick={onClose}
        className="fixed top-5 left-5 z-[100] px-4 py-2 rounded-full
                   bg-black/70 backdrop-blur-md border border-white/20
                   text-white text-sm hover:bg-black/90 transition-all"
      >
        🌍 지구본으로 돌아가기
      </button>
    </div>
  )
}