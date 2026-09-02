import { Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

// Homestays
export const getHomestays = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query
    const where: any = {}

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const homestays = await prisma.homestay.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    const parsed = homestays.map((h) => ({
      ...h,
      facilities: JSON.parse(h.facilities || '[]'),
      availableDates: JSON.parse(h.availableDates || '[]'),
    }))

    res.json(parsed)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch homestays.' })
  }
}

export const createHomestay = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      image,
      rating,
      location,
      priceNumber,
      price,
      available,
      description,
      facilities,
      contactImg,
      hostName,
      availableDates,
    } = req.body

    if (!name || !location) {
      res.status(400).json({ error: 'Name and location are required.' })
      return
    }

    const hostId = req.user?.userId || null
    const finalHostName = hostName || req.user?.name || 'Local Host'

    const homestay = await prisma.homestay.create({
      data: {
        name,
        image: image || 'https://images.unsplash.com/photo-1643474003587-8bbf4bbc01d9?w=600&h=400&fit=crop&auto=format',
        rating: rating ? parseFloat(rating) : 4.8,
        location,
        priceNumber: priceNumber ? parseInt(priceNumber, 10) : 2500,
        price: price || `₹${priceNumber || 2500}`,
        available: available !== undefined ? Boolean(available) : true,
        description: description || 'Authentic local homestay.',
        facilities: JSON.stringify(Array.isArray(facilities) ? facilities : ['WiFi', 'Home Kitchen']),
        contactImg: contactImg || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format',
        hostName: finalHostName,
        hostId,
        availableDates: JSON.stringify(Array.isArray(availableDates) ? availableDates : []),
      },
    })

    res.status(201).json({
      ...homestay,
      facilities: JSON.parse(homestay.facilities),
      availableDates: JSON.parse(homestay.availableDates),
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create homestay listing.' })
  }
}

// Guides
export const getGuides = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query
    const where: any = {}

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
        { speciality: { contains: search } },
      ]
    }

    const guides = await prisma.guide.findMany({
      where,
      orderBy: { rating: 'desc' },
    })

    const parsed = guides.map((g) => ({
      ...g,
      languages: JSON.parse(g.languages || '[]'),
      places: JSON.parse(g.places || '[]'),
      availableDates: JSON.parse(g.availableDates || '[]'),
    }))

    res.json(parsed)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch guides.' })
  }
}

export const createGuide = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      photo,
      verified,
      rating,
      location,
      languages,
      speciality,
      places,
      priceNumber,
      price,
      priceUnit,
      available,
      tours,
      availableDates,
    } = req.body

    if (!name || !location) {
      res.status(400).json({ error: 'Name and location are required.' })
      return
    }

    const guideId = req.user?.userId || null

    const guide = await prisma.guide.create({
      data: {
        name,
        photo: photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format',
        verified: verified !== undefined ? Boolean(verified) : true,
        rating: rating ? parseFloat(rating) : 4.9,
        location,
        languages: JSON.stringify(Array.isArray(languages) ? languages : ['Hindi', 'English']),
        speciality: speciality || 'Heritage & Forts Expert',
        places: JSON.stringify(Array.isArray(places) ? places : ['Amber Fort', 'City Palace']),
        priceNumber: priceNumber ? parseInt(priceNumber, 10) : 1500,
        price: price || `₹${priceNumber || 1500}`,
        priceUnit: priceUnit || 'per day',
        available: available !== undefined ? Boolean(available) : true,
        tours: tours ? parseInt(tours, 10) : 10,
        guideId,
        availableDates: JSON.stringify(Array.isArray(availableDates) ? availableDates : []),
      },
    })

    res.status(201).json({
      ...guide,
      languages: JSON.parse(guide.languages),
      places: JSON.parse(guide.places),
      availableDates: JSON.parse(guide.availableDates),
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create guide listing.' })
  }
}

// Products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query
    const where: any = {}

    if (category && typeof category === 'string' && category !== 'All') {
      where.category = category
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { material: { contains: search } },
        { seller: { contains: search } },
        { location: { contains: search } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    res.json(products)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch products.' })
  }
}

export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      image,
      priceNumber,
      price,
      rating,
      material,
      durability,
      category,
      seller,
      location,
      contact,
      stock,
    } = req.body

    if (!name || !priceNumber) {
      res.status(400).json({ error: 'Product name and price are required.' })
      return
    }

    const sellerId = req.user?.userId || null
    const finalSeller = seller || req.user?.name || 'Local Artisan'

    const product = await prisma.product.create({
      data: {
        name,
        image: image || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop&auto=format',
        priceNumber: parseInt(priceNumber, 10),
        price: price || `₹${priceNumber}`,
        rating: rating ? parseFloat(rating) : 4.8,
        material: material || 'Handmade natural materials',
        durability: durability || 'Heritage GI-tagged quality',
        category: category || 'Handicrafts',
        seller: finalSeller,
        sellerId,
        location: location || 'Jaipur, Rajasthan',
        contact: contact || '+91 98765 43210',
        stock: stock ? parseInt(stock, 10) : 10,
      },
    })

    res.status(201).json(product)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create product listing.' })
  }
}
