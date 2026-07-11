import { Router } from 'express'
import {
  listTrips,
  createTrip,
  getTripPhotos,
  reorderTripPhotos,
  deleteTrip,
} from '../controllers/tripController.js'

const router = Router()

router.get('/', listTrips)
router.post('/', createTrip)
router.get('/:id/photos', getTripPhotos)
router.patch('/:id/reorder', reorderTripPhotos)
router.delete('/:id', deleteTrip)

export default router