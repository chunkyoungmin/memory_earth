import { useState, useRef } from 'react'
import axios from 'axios'

export default function PhotoUploader({ onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef()

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('photo', file)

    try {
      const res = await axios.post('/api/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onUploaded?.(res.data)
    } catch (err) {
      setError('업로드에 실패했습니다. 다시 시도해주세요.')
      console.error(err)
    } finally {
      setUploading(false)
      e.target.value = '' // 같은 파일 다시 선택 가능하도록 초기화
    }
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2">
      {error && (
        <p className="text-red-400 text-xs bg-black/60 px-3 py-1.5 rounded-lg">{error}</p>
      )}

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-14 h-14 rounded-full bg-white text-black text-2xl font-light
                   flex items-center justify-center shadow-lg
                   hover:scale-105 active:scale-95 transition-transform
                   disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="사진 업로드"
      >
        {uploading ? '⏳' : '+'}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}