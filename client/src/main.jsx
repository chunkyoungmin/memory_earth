import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

// 로컬 개발에서는 Vite 프록시를, Render에서는 별도 API Web Service를 사용한다.
// VITE_API_URL 예: https://earth-memory-api.onrender.com
const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

axios.interceptors.request.use((config) => {
  if (apiBaseUrl && config.url?.startsWith('/api/')) {
    config.url = `${apiBaseUrl}${config.url}`
  }
  return config
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
