import { Request, Response } from 'express'
import { prisma } from '../db/prisma.js'

export const getCrowdSpots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { festival } = req.query
    const where: any = {}

    if (festival && typeof festival === 'string' && festival !== 'All Events & Pilgrimages') {
      where.festival = festival
    }

    const spots = await prisma.crowdSpot.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    res.json(spots)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch crowd spots.' })
  }
}

export const updateCrowdSpot = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { count, open, density, densityLevel, trend, waitTime } = req.body

    const spot = await prisma.crowdSpot.findUnique({ where: { id: String(id) } })
    if (!spot) {
      res.status(404).json({ error: 'Spot not found.' })
      return
    }

    const newCount = count !== undefined ? Number(count) : spot.count
    let finalDensity = density || spot.density
    let finalDensityLevel = densityLevel || spot.densityLevel

    // If count was updated without explicit density, calculate categorical density
    if (count !== undefined && !density) {
      const ratio = newCount / spot.capacity
      if (ratio > 0.8) {
        finalDensity = 'High'
        finalDensityLevel = 'high'
      } else if (ratio > 0.45) {
        finalDensity = 'Moderate'
        finalDensityLevel = 'medium'
      } else {
        finalDensity = 'Low'
        finalDensityLevel = 'low'
      }
    }

    const updated = await prisma.crowdSpot.update({
      where: { id: String(id) },
      data: {
        count: newCount,
        open: open !== undefined ? Boolean(open) : spot.open,
        density: String(finalDensity),
        densityLevel: String(finalDensityLevel),
        trend: trend ? String(trend) : spot.trend,
        waitTime: waitTime ? String(waitTime) : spot.waitTime,
      },
    })

    res.json(updated)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update crowd spot.' })
  }
}
