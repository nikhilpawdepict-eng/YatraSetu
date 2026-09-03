import { Router } from 'express'
import { getCrowdSpots, updateCrowdSpot, getCrowdPrediction } from '../controllers/crowdController.js'

const router = Router()

router.get('/', getCrowdSpots)
router.get('/prediction', getCrowdPrediction)
router.patch('/:id', updateCrowdSpot)

export default router
