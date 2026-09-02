import { Router } from 'express'
import { handleFileUpload } from '../controllers/uploadController.js'
import { upload } from '../middleware/upload.js'

const router = Router()

router.post('/', upload.single('file'), handleFileUpload)

export default router
