import { Router } from 'express'
import { getCrowdSpots, updateCrowdSpot } from '../controllers/crowdController.js'
import { authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/spots', getCrowdSpots)
router.patch('/spots/:id', authenticate, requireRole('authority'), updateCrowdSpot)

export default router
