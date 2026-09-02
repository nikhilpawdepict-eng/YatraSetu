import express from 'express'
import cors from 'cors'
import path from 'path'
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
    project: 'YatraSetu',
    version: '1.0.0',
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

// 404 Route Handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found on YatraSetu API.' })
})

// Centralized Error Handling Middleware
app.use(errorHandler)

// Start Server
app.listen(config.port, () => {
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
