import { Router } from 'express'
import {
  getAlerts,
  createAlert,
  getEmergencyServices,
  checkInTourist,
  getCheckIns,
  triggerSosAlert,
} from '../controllers/emergencyController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = Router()

router.get('/alerts', getAlerts)
router.post('/alerts', authenticateToken, createAlert)
router.get('/services', getEmergencyServices)
router.post('/check-in', checkInTourist)
router.get('/check-ins', getCheckIns)
router.post('/sos', triggerSosAlert)

export default router
