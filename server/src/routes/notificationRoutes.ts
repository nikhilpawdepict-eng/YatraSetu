import { Router } from 'express'
import {
  sendWhatsAppMessage,
  sendEmailNotification,
  sendSmsNotification,
  getNotificationLogs,
} from '../controllers/notificationController.js'

const router = Router()

router.post('/send-whatsapp', sendWhatsAppMessage)
router.post('/send-email', sendEmailNotification)
router.post('/send-sms', sendSmsNotification)
router.get('/logs', getNotificationLogs)

export default router
