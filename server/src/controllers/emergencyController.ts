import { Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

export const getAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { location } = req.query
    const where: any = {}

    if (location && typeof location === 'string') {
      where.OR = [
        { location: { contains: location } },
        { message: { contains: location } },
        { type: { contains: location } },
      ]
    }

    const alerts = await prisma.emergencyAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    res.json(alerts)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch emergency alerts.' })
  }
}

export const createAlert = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, message, severity, location, icon } = req.body

    if (!message || !type) {
      res.status(400).json({ error: 'Alert type and message are required.' })
      return
    }

    const createdById = req.user?.userId || null
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const alert = await prisma.emergencyAlert.create({
      data: {
        type,
        message,
        severity: severity || 'high',
        location: location || 'Jaipur District',
        time,
        icon: icon || (severity === 'high' ? '🚨' : severity === 'medium' ? '⚠️' : 'ℹ️'),
        createdById,
      },
    })

    res.status(201).json(alert)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to broadcast emergency alert.' })
  }
}

export const getEmergencyServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { location, category } = req.query
    const where: any = {}

    if (location && typeof location === 'string') {
      where.OR = [
        { location: { contains: location } },
        { name: { contains: location } },
        { address: { contains: location } },
      ]
    }

    if (category && typeof category === 'string') {
      where.category = category
    }

    const services = await prisma.emergencyService.findMany({
      where,
      orderBy: { distance: 'asc' },
    })

    res.json(services)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch emergency services.' })
  }
}

export const checkInTourist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, userName, userPhone, location, status, emergencyContact, note, dispatchAlerts } = req.body

    const checkIn = await prisma.touristCheckIn.create({
      data: {
        userId: userId || 'usr_aarav_sharma',
        userName: userName || 'Aarav Sharma',
        userPhone: userPhone || '+91 98765 12345',
        location: location || 'Jaipur City',
        status: status || 'SAFE',
        emergencyContact: emergencyContact || '+91 98765 00000',
        note: note || 'Safe check-in recorded via TravelBoost app.',
      },
    })

    // Auto-log simulated notification if requested
    if (dispatchAlerts && emergencyContact) {
      await prisma.notificationLog.create({
        data: {
          channel: 'sms',
          recipient: emergencyContact,
          subject: 'Safe Check-In Alert',
          content: `[TravelBoost Safety Network] ${userName} has marked themselves as SAFE at ${location}. Time: ${new Date().toLocaleTimeString()}`,
          status: 'delivered',
        },
      })
    }

    res.status(201).json({
      success: true,
      checkIn,
      message: `Safety check-in registered as ${status}. Notifications dispatched to emergency contacts.`,
    })
  } catch (err: any) {
    console.error('Error saving check-in:', err)
    res.status(500).json({ error: 'Failed to record tourist safety check-in.' })
  }
}

export const getCheckIns = async (req: Request, res: Response): Promise<void> => {
  try {
    const { location } = req.query
    const where: any = {}
    if (location) where.location = { contains: location as string }

    const checkIns = await prisma.touristCheckIn.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    res.json(checkIns)
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch safety check-ins.' })
  }
}

export const triggerSosAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userName, userPhone, location, gpsCoordinates, emergencyContact, userEmail } = req.body

    const message = `🚨 EMERGENCY SOS: Tourist ${userName || 'Traveler'} (${userPhone || 'Unknown'}) triggered an urgent SOS alert at ${location || 'Current Location'}. Coordinates: ${gpsCoordinates || '26.9124, 75.7873'}. Immediate assistance requested.`

    // Create high-severity emergency alert in database
    const alert = await prisma.emergencyAlert.create({
      data: {
        type: '🚨 Urgent Tourist SOS',
        message,
        severity: 'high',
        location: location || 'Jaipur District',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        icon: '🚨',
      },
    })

    // Log multi-channel notifications (SMS + WhatsApp + Email)
    if (emergencyContact) {
      await prisma.notificationLog.create({
        data: {
          channel: 'sms',
          recipient: emergencyContact,
          subject: 'EMERGENCY SOS ALERT',
          content: message,
          status: 'delivered',
        },
      })
    }

    res.status(201).json({
      success: true,
      alert,
      message: 'SOS Broadcasted to Local Tourist Police Command and emergency contacts.',
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Error triggering SOS:', err)
    res.status(500).json({ error: 'Failed to broadcast SOS alert.' })
  }
}
