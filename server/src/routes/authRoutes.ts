import { Router } from 'express'
import {
  register,
  verifyEmailOtp,
  resendEmailOtp,
  verifyPhoneOtp,
  resendPhoneOtp,
  login,
  verifyLoginOtp,
  googleAuth,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
} from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// Registration & Verification
router.post('/register', register)
router.post('/verify-email-otp', verifyEmailOtp)
router.post('/resend-email-otp', resendEmailOtp)
router.post('/verify-phone-otp', verifyPhoneOtp)
router.post('/resend-phone-otp', resendPhoneOtp)

// Authentication & Two-Factor
router.post('/login', login)
router.post('/verify-login-otp', verifyLoginOtp)
router.post('/google', googleAuth)
router.post('/logout', logout)

// Password Management
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

// Session
router.get('/me', authenticate, getMe)

export default router
