import { Router } from 'express'
import { getStats, listAllPhotos, deletePhoto, getProfile } from '../controllers/adminController.js'

const router = Router()

router.get('/stats', getStats)
router.get('/profile', getProfile)
router.get('/photos', listAllPhotos)
router.delete('/photos/:id', deletePhoto)

export default router