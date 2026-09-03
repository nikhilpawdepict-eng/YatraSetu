import { Router } from 'express'
import {
  generateItinerary,
  modifyItinerary,
  saveItinerary,
  getUserSavedItineraries,
} from '../controllers/plannerController.js'

const router = Router()

router.post('/generate', generateItinerary)
router.post('/modify', modifyItinerary)
router.post('/save', saveItinerary)
router.get('/saved', getUserSavedItineraries)

export default router
