import { Router } from 'express'
import { register, login, quickDemoLogin, getMe } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/quick-demo', quickDemoLogin)
router.get('/me', authenticate, getMe)

export default router
