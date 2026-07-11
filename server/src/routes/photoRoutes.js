import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import {
  uploadPhoto,
  setManualLocation,
  listPhotos,
  toggleFavorite,
} from '../controllers/photoController.js'

const router = Router()

router.get('/', listPhotos)
router.post('/upload', upload.single('photo'), uploadPhoto)
router.patch('/:id/location', setManualLocation)
router.patch('/:id/favorite', toggleFavorite)

export default router