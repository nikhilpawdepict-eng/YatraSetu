import express from 'express'
import cors from 'cors'
import path from 'path'
import bcrypt from 'bcryptjs'
import { prisma } from './db/prisma.js'
import { config } from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'

// Import Routes
import authRoutes from './routes/authRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import listingRoutes from './routes/listingRoutes.js'
import crowdRoutes from './routes/crowdRoutes.js'
import emergencyRoutes from './routes/emergencyRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import plannerRoutes from './routes/plannerRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import communityRoutes from './routes/communityRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const app = express()

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching CORS list
      if (!origin || config.corsOrigin.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true)
      } else {
        callback(null, true) // Permissive for local demo/hackathon evaluations
      }
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

// Static uploads folder
app.use('/uploads', express.static(config.uploadDir))

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    project: 'TravelBoost / YatraSetu',
    version: '2.0.0 (SIH 2026)',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  })
})

// Mount API Routes
app.use('/api/auth', authRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/crowd', crowdRoutes)
app.use('/api/emergency', emergencyRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/planner', plannerRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/admin', adminRoutes)

// 404 Route Handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found on YatraSetu API.' })
})

// Centralized Error Handling Middleware
app.use(errorHandler)

async function ensureDbInitialized() {
  try {
    const count = await prisma.user.count()
    if (count === 0) {
      console.log('🌱 Initializing default verified accounts...')
      const pwd = await bcrypt.hash('YatraSetu@2026', 10)
      const userPwd = await bcrypt.hash('Nikhil@1234', 10)

      await prisma.user.createMany({
        data: [
          {
            id: 'usr_nikhil',
            name: 'Nikhil Pawde',
            email: 'nikhilpawdepict@gmail.com',
            passwordHash: userPwd,
            role: 'user',
            avatar: '👤',
            phone: '+918459963052',
            location: 'Jaipur, Rajasthan',
            emailVerified: true,
            phoneVerified: true,
          },
          {
            id: 'usr_aarav_sharma',
            name: 'Aarav Sharma',
            email: 'aarav.sharma@example.com',
            passwordHash: pwd,
            role: 'user',
            avatar: '👤',
            phone: '+919876512345',
            location: 'Jaipur, Rajasthan',
            emailVerified: true,
            phoneVerified: true,
          },
          {
            id: 'usr_arjun_mehta',
            name: 'Arjun Mehta',
            email: 'arjun.mehta@example.com',
            passwordHash: pwd,
            role: 'local',
            avatar: '🏡',
            phone: '+919876543210',
            location: 'Jaipur, Rajasthan',
            speciality: 'Rajasthani Heritage & Forts Expert',
            emailVerified: true,
            phoneVerified: true,
          },
          {
            id: 'usr_rajesh_verma',
            name: 'Dr. Rajesh Verma',
            email: 'rajesh.verma@rtdc.gov.in',
            passwordHash: pwd,
            role: 'authority',
            avatar: '🛡️',
            phone: '+919876500000',
            location: 'Rajasthan Tourism Dept',
            speciality: 'Civic Grievance Redressal Officer',
            emailVerified: true,
            phoneVerified: true,
          },
          {
            id: 'usr_admin_sih',
            name: 'Admin Command',
            email: 'admin@yatrasetu.gov.in',
            passwordHash: pwd,
            role: 'admin',
            avatar: '⚡',
            phone: '+919876599999',
            location: 'National Tourism Control Center',
            emailVerified: true,
            phoneVerified: true,
          },
        ],
      })
      console.log('✅ Accounts seeded successfully on Render!')
    }
  } catch (e) {
    console.warn('DB initialization check:', e)
  }
}

// Start Server
app.listen(config.port, async () => {
  await ensureDbInitialized()
  console.log(`
  =======================================================
  🚀 YatraSetu API Server (SIH 2026) is running!
  📡 URL:         http://localhost:${config.port}
  🩺 Health:      http://localhost:${config.port}/api/health
  📂 Uploads:     http://localhost:${config.port}/uploads
  🛡️ Environment: ${config.nodeEnv}
  =======================================================
  `)
})

export default app
