import { Router } from 'express'
import { getAlerts, createAlert, getEmergencyServices } from '../controllers/emergencyController.js'
import { optionalAuth, authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/alerts', getAlerts)
router.post('/alerts', authenticate, requireRole('authority'), createAlert)
router.get('/services', getEmergencyServices)

export default router
