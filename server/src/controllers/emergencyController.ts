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
