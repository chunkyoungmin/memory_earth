export default function TripStorySlider({ photos, index, onChange }) {
  if (!photos || photos.length === 0) return null
  const photo = photos[index]

  return (
    <div className="fixed bottom-6 inset-x-0 flex flex-col items-center gap-3 z-40 px-6">
      {photo && (
        <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl">
          <img
            src={`/uploads/${photo.file_path.split('/').pop()}`}
            alt=""
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div>
            <p className="text-white text-sm font-medium">
              {photo.title || photo.city || `${index + 1}번째 장소`}
            </p>
            {photo.taken_at && (
              <p className="text-white/50 text-xs">
                {new Date(photo.taken_at).toLocaleDateString('ko-KR')}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 w-full max-w-md">
        <span className="text-white/50 text-xs w-6 text-right">1</span>
        <input
          type="range"
          min={0}
          max={photos.length - 1}
          value={index}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-white"
        />
        <span className="text-white/50 text-xs w-6">{photos.length}</span>
      </div>
    </div>
  )
}