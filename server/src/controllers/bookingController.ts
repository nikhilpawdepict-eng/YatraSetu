import { Response } from 'express'
import { prisma } from '../db/prisma.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

export const getBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user

    let bookings
    if (user?.role === 'local') {
      bookings = await prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
      })
    } else if (user?.role === 'user') {
      bookings = await prisma.booking.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      bookings = await prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
      })
    }

    res.json(bookings)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch bookings.' })
  }
}

export const createBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      serviceId,
      serviceName,
      serviceType,
      date,
      guests,
      price,
      message,
      userName,
      userLocation,
      userAvatar,
    } = req.body

    if (!serviceName || !serviceType) {
      res.status(400).json({ error: 'Service name and service type are required.' })
      return
    }

    const userId = req.user?.userId || 'u101'
    const finalUserName = req.user?.name || userName || 'Aarav Sharma'
    const finalUserLocation = userLocation || 'Jaipur, Rajasthan'
    const finalUserAvatar = userAvatar || '👤'

    const booking = await prisma.booking.create({
      data: {
        serviceId: String(serviceId || '1'),
        serviceName: String(serviceName),
        serviceType: String(serviceType || 'Homestay'),
        userId: String(userId),
        userName: String(finalUserName),
        userLocation: String(finalUserLocation),
        userAvatar: String(finalUserAvatar),
        date: String(date || 'Flexible dates'),
        guests: Number(guests) || 1,
        price: String(price || '₹2,500'),
        message: String(message || 'Booking request submitted via YatraSetu.'),
        status: 'pending',
      },
    })

    res.status(201).json(booking)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create booking request.' })
  }
}

export const updateBookingStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { status } = req.body

    if (!['accepted', 'declined', 'pending'].includes(status)) {
      res.status(400).json({ error: 'Status must be accepted, declined, or pending.' })
      return
    }

    const booking = await prisma.booking.update({
      where: { id: String(id) },
      data: { status: String(status) },
    })

    res.json(booking)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update booking status.' })
  }
}
