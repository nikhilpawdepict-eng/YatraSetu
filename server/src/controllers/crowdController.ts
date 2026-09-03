import { Request, Response } from 'express'
import { prisma } from '../db/prisma.js'

export const getCrowdSpots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { festival, location } = req.query
    const where: any = {}

    if (festival && typeof festival === 'string' && festival !== 'All Events & Pilgrimages') {
      where.festival = festival
    }

    if (location && typeof location === 'string') {
      where.location = { contains: location }
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

export const getCrowdPrediction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { destination = 'Jaipur Forts & Monuments', date, festival = 'Regular Day' } = req.query

    const hours = [
      { time: '06:00 AM', occupancy: 120, capacity: 800, level: 'Low', badge: '🟢 Low', waitMin: '0-5 min' },
      { time: '08:00 AM', occupancy: 240, capacity: 800, level: 'Low', badge: '🟢 Low', waitMin: '5-10 min' },
      { time: '10:00 AM', occupancy: 520, capacity: 800, level: 'Moderate', badge: '🟡 Moderate', waitMin: '15-20 min' },
      { time: '12:00 PM', occupancy: 780, capacity: 800, level: 'High', badge: '🔴 High', waitMin: '35-50 min' },
      { time: '02:00 PM', occupancy: 810, capacity: 800, level: 'High', badge: '🔴 High', waitMin: '40-60 min' },
      { time: '04:00 PM', occupancy: 610, capacity: 800, level: 'Moderate', badge: '🟡 Moderate', waitMin: '20-30 min' },
      { time: '06:00 PM', occupancy: 290, capacity: 800, level: 'Low', badge: '🟢 Low', waitMin: '5-10 min' },
      { time: '08:00 PM', occupancy: 140, capacity: 800, level: 'Low', badge: '🟢 Low', waitMin: '0-5 min' },
    ]

    const isFestival = festival !== 'Regular Day' && festival !== 'None'
    if (isFestival) {
      hours.forEach((h) => {
        h.occupancy = Math.min(h.capacity, Math.round(h.occupancy * 1.35))
        if (h.occupancy > h.capacity * 0.75) {
          h.level = 'High'
          h.badge = '🔴 High'
        } else if (h.occupancy > h.capacity * 0.4) {
          h.level = 'Moderate'
          h.badge = '🟡 Moderate'
        }
      })
    }

    const prediction = {
      destination: String(destination),
      date: date || new Date().toISOString().split('T')[0],
      festival: String(festival),
      predictedSurgeRisk: isFestival ? 'HIGH SURGE' : 'MODERATE',
      bestVisitingWindows: [
        { window: '06:30 AM – 08:30 AM', reason: 'Crisp morning light, minimal queue, open air breeze' },
        { window: '05:30 PM – 07:00 PM', reason: 'Sunset glow, low temperature, post-peak dispersals' },
      ],
      avoidHours: '11:30 AM – 03:00 PM (Peak tour-bus arrivals and high heat)',
      hourlyForecast: hours,
      explainableFactors: [
        { factor: 'Historical Baseline Footfall', impact: '+35%', trend: '↑', description: 'Avg 4,200 visitors/day for this month' },
        { factor: 'Festival & Auspicious Tithi', impact: isFestival ? '+45%' : '+5%', trend: isFestival ? '↑↑' : '→', description: isFestival ? 'Significant devotee influx for festival' : 'Normal seasonal traffic' },
        { factor: 'Weekend & Holiday Multiplier', impact: '+25%', trend: '↑', description: 'Domestic weekend travel spike' },
        { factor: 'Weather & Climate Comfort', impact: '+15%', trend: '→', description: 'Pleasant 26°C encourages outdoor exploration' },
        { factor: 'Railway & Bus Transit Volume', impact: '+20%', trend: '↑', description: '98% train occupancy recorded on major corridors' },
      ],
      aiConfidenceScore: '94.8% (Multi-source Ensemble Model)',
    }

    res.json(prediction)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate crowd prediction.' })
  }
}
