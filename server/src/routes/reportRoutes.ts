import { Router } from 'express'
import {
  getReports,
  createReport,
  toggleVote,
  addSolution,
  updateStatus,
  addAuthorityResponse,
} from '../controllers/reportController.js'
import { optionalAuth, authenticate, requireRole } from '../middleware/auth.js'

const router = Router()

// Public / Tourist reads reports (with optional auth to check if user has upvoted)
router.get('/', optionalAuth, getReports)

// Create report (auth optional or required; if token present, ties to user)
router.post('/', optionalAuth, createReport)

// Upvote report (requires authenticated user)
router.post('/:id/vote', authenticate, toggleVote)

// Community solution proposal
router.post('/:id/solution', optionalAuth, addSolution)

// Authority status update (Open -> In Progress -> Resolved)
router.patch('/:id/status', authenticate, requireRole('authority'), updateStatus)

// Authority official response
router.post('/:id/authority-response', authenticate, requireRole('authority'), addAuthorityResponse)

export default router
