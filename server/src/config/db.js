import pg from 'pg'
import dotenv from 'dotenv'
import dns from 'dns'

dotenv.config()

// Node.js가 IPv6보다 IPv4를 우선 사용하도록 설정 (일부 네트워크 환경에서 IPv6 조회 실패 방지)
dns.setDefaultResultOrder('ipv4first')

const { Pool } = pg

const connectionString = process.env.DATABASE_URL

export const pool = new Pool(
  connectionString
    ? {
        connectionString,
        // Render에서 Supabase PostgreSQL에 연결할 때 TLS가 필요하다.
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'earth_memory',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
)

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error', err)
})
