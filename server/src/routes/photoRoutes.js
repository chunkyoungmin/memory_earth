import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { requireAuth } from '../middleware/auth.js'
import {
  uploadPhoto,
  setManualLocation,
  listPhotos,
  toggleFavorite,
} from '../controllers/photoController.js'

const router = Router()

router.get('/', listPhotos)
router.post('/upload', requireAuth, upload.single('photo'), uploadPhoto)
router.patch('/:id/location', requireAuth, setManualLocation)
router.patch('/:id/favorite', requireAuth, toggleFavorite)

export default router