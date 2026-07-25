import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-earth-bg text-white flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-1">🌍 Earth Memory</h1>
        <p className="text-white/50 text-sm mb-8">로그인</p>

        {error && (
          <p className="mb-4 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          required
          className="w-full mb-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm
                     placeholder-white/30 outline-none focus:border-white/30"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          required
          className="w-full mb-5 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm
                     placeholder-white/30 outline-none focus:border-white/30"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-white text-black text-sm font-medium
                     hover:bg-white/90 disabled:opacity-50"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        <p className="text-center text-white/40 text-sm mt-5">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-white underline">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  )
}