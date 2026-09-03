import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'yatrasetu_sih2026_super_secure_jwt_secret_key_8921',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:8443,http://localhost:3000').split(','),
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads'),
  baseUrl: process.env.BASE_URL || 'http://localhost:5000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8443',

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',

  // Email / SMTP Service
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
  emailSecure: process.env.EMAIL_SECURE === 'true' || false,
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  emailFrom: process.env.EMAIL_FROM || '"TravelBoost Support" <no-reply@travelboost.gov.in>',

  // SMS Gateway (Twilio / Fast2SMS / Generic)
  smsProvider: process.env.SMS_PROVIDER || 'fast2sms',
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  fast2smsApiKey: process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY || '',
}
