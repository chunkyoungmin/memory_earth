import { Router } from 'express'
import { listTrips, createTrip, getTripPhotos, reorderTripPhotos } from '../controllers/tripController.js'

const router = Router()

router.get('/', listTrips)
router.post('/', createTrip)
router.get('/:id/photos', getTripPhotos)
router.patch('/:id/reorder', reorderTripPhotos)

export default router