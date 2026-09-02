import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../db/prisma.js'
import { config } from '../config/env.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

export const generateToken = (userId: string, role: string, email: string, name: string) => {
  return jwt.sign(
    { userId, role, email, name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
  )
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, name, email, password, phone, speciality, location } = req.body

    if (!email || !name || !role) {
      res.status(400).json({ error: 'Name, email, and role are required fields.' })
      return
    }

    if (!['user', 'local', 'authority'].includes(role)) {
      res.status(400).json({ error: 'Role must be one of: user, local, authority.' })
      return
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      res.status(409).json({ error: 'An account with this email address already exists.' })
      return
    }

    const passwordToHash = password || 'YatraSetu@2026'
    const passwordHash = await bcrypt.hash(passwordToHash, 10)

    const avatar = role === 'local' ? '🏡' : role === 'authority' ? '🛡️' : '👤'

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        avatar,
        phone,
        speciality,
        location: location || 'Jaipur, Rajasthan',
      },
    })

    const token = generateToken(user.id, user.role, user.email, user.name)

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
        speciality: user.speciality,
      },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed.' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body

    if (!email) {
      res.status(400).json({ error: 'Email is required.' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Auto-create or reject? Let's check password if user exists
      res.status(401).json({ error: 'Invalid email or password.' })
      return
    }

    if (password) {
      const isValid = await bcrypt.compare(password, user.passwordHash)
      if (!isValid) {
        res.status(401).json({ error: 'Invalid email or password.' })
        return
      }
    }

    // Role check if role was explicitly passed
    if (role && user.role !== role) {
      res.status(403).json({ error: `Account exists as '${user.role}', not '${role}'.` })
      return
    }

    const token = generateToken(user.id, user.role, user.email, user.name)

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
        speciality: user.speciality,
      },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' })
  }
}

export const quickDemoLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body

    if (!['user', 'local', 'authority'].includes(role)) {
      res.status(400).json({ error: 'Role must be user, local, or authority.' })
      return
    }

    const demoEmail =
      role === 'user'
        ? 'aarav.sharma@example.com'
        : role === 'local'
        ? 'arjun.mehta@example.com'
        : 'rajesh.verma@rtdc.gov.in'

    let user = await prisma.user.findUnique({
      where: { email: demoEmail },
    })

    if (!user) {
      const demoName =
        role === 'user' ? 'Aarav Sharma' : role === 'local' ? 'Arjun Mehta' : 'Dr. Rajesh Verma'
      const demoHash = await bcrypt.hash('YatraSetu@2026', 10)
      user = await prisma.user.create({
        data: {
          name: demoName,
          email: demoEmail,
          passwordHash: demoHash,
          role,
          avatar: role === 'local' ? '🏡' : role === 'authority' ? '🛡️' : '👤',
          location: 'Jaipur, Rajasthan',
          speciality: role === 'local' ? 'Rajasthani Heritage & Forts Expert' : undefined,
        },
      })
    }

    const token = generateToken(user.id, user.role, user.email, user.name)

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location,
        speciality: user.speciality,
      },
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Demo login failed.' })
  }
}

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        location: true,
        speciality: true,
      },
    })

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    res.json({ user })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch user session' })
  }
}
