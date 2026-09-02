import { Router } from 'express'
import { getThreadMessages, sendMessage } from '../controllers/chatController.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/:threadId', getThreadMessages)
router.post('/:threadId', optionalAuth, sendMessage)

export default router
