import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { prisma } from '../db/prisma.js'

export interface AuthPayload {
  userId: string
  role: 'user' | 'local' | 'authority' | 'admin'
  email: string
  name: string
}

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. No Bearer token provided.' })
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true },
    })

    if (!user) {
      res.status(401).json({ error: 'User associated with this token no longer exists.' })
      return
    }

    req.user = {
      userId: user.id,
      role: user.role as 'user' | 'local' | 'authority',
      email: user.email,
      name: user.name,
    }
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token.' })
  }
}

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, email: true, role: true },
      })
      if (user) {
        req.user = {
          userId: user.id,
          role: user.role as 'user' | 'local' | 'authority',
          email: user.email,
          name: user.name,
        }
      }
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next()
}

export const authenticateToken = authenticate

export const requireRole = (...allowedRoles: ('user' | 'local' | 'authority' | 'admin')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: This operation requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is '${req.user.role}'.`,
      })
      return
    }

    next()
  }
}

