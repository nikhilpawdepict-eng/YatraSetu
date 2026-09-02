import { Router } from 'express'
import { getBookings, createBooking, updateBookingStatus } from '../controllers/bookingController.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', optionalAuth, getBookings)
router.post('/', optionalAuth, createBooking)
router.patch('/:id/status', optionalAuth, updateBookingStatus)

export default router
