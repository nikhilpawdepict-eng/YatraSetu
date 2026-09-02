import { Request, Response } from 'express'
import { prisma } from '../db/prisma.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

export const getThreadMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const threadId = Array.isArray(req.params.threadId) ? req.params.threadId[0] : req.params.threadId

    const messages = await prisma.message.findMany({
      where: { threadId: String(threadId) },
      orderBy: { createdAt: 'asc' },
    })

    res.json(messages)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch thread messages.' })
  }
}

export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const threadId = Array.isArray(req.params.threadId) ? req.params.threadId[0] : req.params.threadId
    const { text, senderRole, receiverId, senderId } = req.body

    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Message text is required.' })
      return
    }

    const actualSenderId = req.user?.userId || senderId || 'u101'
    const actualRole = req.user?.role || senderRole || 'user'

    const message = await prisma.message.create({
      data: {
        threadId: String(threadId),
        senderId: String(actualSenderId),
        senderRole: String(actualRole),
        receiverId: receiverId ? String(receiverId) : null,
        text: String(text).trim(),
      },
    })

    res.status(201).json(message)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send message.' })
  }
}
