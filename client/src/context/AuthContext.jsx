import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('earthmemory_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('earthmemory_token', token)
    } else {
      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('earthmemory_token')
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    axios
      .get('/api/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const res = await axios.post('/api/auth/login', { email, password })
    setToken(res.data.token)
    setUser(res.data.user)
  }

  async function signup(email, password, displayName) {
    const res = await axios.post('/api/auth/signup', { email, password, displayName })
    setToken(res.data.token)
    setUser(res.data.user)
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}