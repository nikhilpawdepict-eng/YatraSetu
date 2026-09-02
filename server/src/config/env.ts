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
}
