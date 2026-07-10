import { useMemo } from 'react'

export default function Timeline({ photos, selectedYear, onChange }) {
  const years = useMemo(() => {
    const yearSet = new Set(
      photos.filter((p) => p.taken_at).map((p) => new Date(p.taken_at).getFullYear())
    )
    return [...yearSet].sort((a, b) => a - b)
  }, [photos])

  if (years.length === 0) return null

  const minYear = years[0]
  const maxYear = years[years.length - 1]

  return (
    <div className="fixed bottom-6 inset-x-0 flex flex-col items-center gap-2 z-40 px-6">
      <div className="flex items-center gap-3 w-full max-w-md">
        <span className="text-white/50 text-xs w-10">{minYear}</span>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={selectedYear ?? maxYear}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-white"
        />
        <span className="text-white/50 text-xs w-10 text-right">{maxYear}</span>
      </div>
      <p className="text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">
        {selectedYear ?? maxYear}년까지
      </p>
    </div>
  )
}