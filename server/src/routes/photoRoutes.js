import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { uploadPhoto, setManualLocation, listPhotos } from '../controllers/photoController.js'

const router = Router()

router.get('/', listPhotos)
router.post('/upload', upload.single('photo'), uploadPhoto)
router.patch('/:id/location', setManualLocation)

export default router