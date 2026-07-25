import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import {
  listTrips,
  createTrip,
  getTripPhotos,
  reorderTripPhotos,
  deleteTrip,
} from '../controllers/tripController.js'

const router = Router()

router.get('/', requireAuth, listTrips)
router.post('/', requireAuth, createTrip)
router.get('/:id/photos', getTripPhotos)
router.patch('/:id/reorder', requireAuth, reorderTripPhotos)
router.delete('/:id', requireAuth, deleteTrip)

export default router