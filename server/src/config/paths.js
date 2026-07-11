import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 어디서 실행되든(pm2, 터미널, 다른 cwd) 항상 같은 위치를 가리키도록 절대경로로 고정
// server/src/config -> server/src -> server -> earth-memory(프로젝트 루트) -> uploads
export const UPLOAD_DIR = path.join(__dirname, '../../../uploads')