import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { getStats, listAllPhotos, deletePhoto, getProfile } from '../controllers/adminController.js'

const router = Router()

router.use(requireAuth, requireAdmin)
router.get('/profile', getProfile)
router.get('/stats', getStats)
router.get('/photos', listAllPhotos)
router.delete('/photos/:id', deletePhoto)

export default router
