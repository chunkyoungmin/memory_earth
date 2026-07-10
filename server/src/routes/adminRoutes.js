import { Router } from 'express'
import { getStats, listAllPhotos, deletePhoto } from '../controllers/adminController.js'

const router = Router()

router.get('/stats', getStats)
router.get('/photos', listAllPhotos)
router.delete('/photos/:id', deletePhoto)

export default router