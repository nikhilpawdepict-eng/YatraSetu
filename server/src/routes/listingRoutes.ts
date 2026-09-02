import { Router } from 'express'
import {
  getHomestays,
  createHomestay,
  getGuides,
  createGuide,
  getProducts,
  createProduct,
} from '../controllers/listingController.js'
import { optionalAuth, authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

// Homestays
router.get('/homestays', getHomestays)
router.post('/homestays', optionalAuth, createHomestay)

// Guides
router.get('/guides', getGuides)
router.post('/guides', optionalAuth, createGuide)

// Products
router.get('/products', getProducts)
router.post('/products', optionalAuth, createProduct)

export default router
