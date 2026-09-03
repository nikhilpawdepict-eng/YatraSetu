import { Router } from 'express'
import {
  getAdminAnalytics,
  getAllUsers,
  updateUserRole,
} from '../controllers/adminController.js'

const router = Router()

router.get('/analytics', getAdminAnalytics)
router.get('/users', getAllUsers)
router.patch('/users/:id/role', updateUserRole)

export default router
