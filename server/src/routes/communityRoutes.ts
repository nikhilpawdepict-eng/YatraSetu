import { Router } from 'express'
import {
  getCommunityPosts,
  createCommunityPost,
  likeCommunityPost,
  analyzeReviewSentiment,
  getHiddenGems,
} from '../controllers/communityController.js'

const router = Router()

router.get('/posts', getCommunityPosts)
router.post('/posts', createCommunityPost)
router.post('/posts/:id/like', likeCommunityPost)
router.post('/reviews/sentiment', analyzeReviewSentiment)
router.get('/hidden-gems', getHiddenGems)

export default router
