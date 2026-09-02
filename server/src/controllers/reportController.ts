import { Response } from 'express'
import { prisma } from '../db/prisma.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'

export const getReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, status, myReports } = req.query
    const currentUserId = req.user?.userId

    const where: any = {}

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (status && typeof status === 'string' && status !== 'All') {
      where.currentStatus = status
    }

    if (myReports === 'true' && currentUserId) {
      where.OR = [
        { reportedById: currentUserId },
        { voteList: { some: { userId: currentUserId } } },
      ]
    }

    const dbReports = await prisma.cleanlinessReport.findMany({
      where,
      include: {
        voteList: currentUserId ? { where: { userId: currentUserId } } : false,
      },
      orderBy: [{ rank: 'asc' }, { createdAt: 'desc' }],
    })

    const parsedReports = dbReports.map((r) => ({
      id: r.id,
      rank: r.rank,
      medal: r.medal,
      name: r.name,
      location: r.location,
      votes: r.votes,
      impact: r.impact,
      evidence: JSON.parse(r.evidence || '[]'),
      comments: JSON.parse(r.comments || '[]'),
      userSolutions: JSON.parse(r.userSolutions || '[]'),
      authorityResponse: r.authorityResponse,
      currentStatus: r.currentStatus,
      reportedBy: r.reportedByName,
      reportedAt: r.reportedAt,
      description: r.description,
      hasUpvoted: Array.isArray(r.voteList) && r.voteList.length > 0,
    }))

    res.json(parsedReports)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch reports.' })
  }
}

export const createReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, location, impact, evidence, comments, userSolutions, description } = req.body

    if (!name || !location) {
      res.status(400).json({ error: 'Problem title and location are required.' })
      return
    }

    const currentCount = await prisma.cleanlinessReport.count()
    const rank = currentCount + 1

    const reportedByName = req.user?.name || 'Community Member'
    const reportedById = req.user?.userId || null

    const reportedAt =
      new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' ' +
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const newReport = await prisma.cleanlinessReport.create({
      data: {
        name: String(name),
        location: String(location),
        impact: impact ? String(impact) : 'Medium',
        rank,
        votes: 1,
        evidence: JSON.stringify(Array.isArray(evidence) ? evidence : []),
        comments: JSON.stringify(Array.isArray(comments) ? comments : [description ? `Initial report: "${description}"` : 'Problem submitted by citizen.']),
        userSolutions: JSON.stringify(Array.isArray(userSolutions) ? userSolutions : []),
        authorityResponse: null,
        currentStatus: 'Open',
        reportedById,
        reportedByName,
        reportedAt,
        description: description ? String(description) : '',
      },
    })

    if (reportedById) {
      await prisma.reportVote.create({
        data: {
          reportId: newReport.id,
          userId: reportedById,
        },
      }).catch(() => {})
    }

    res.status(201).json({
      id: newReport.id,
      rank: newReport.rank,
      medal: newReport.medal,
      name: newReport.name,
      location: newReport.location,
      votes: newReport.votes,
      impact: newReport.impact,
      evidence: JSON.parse(newReport.evidence),
      comments: JSON.parse(newReport.comments),
      userSolutions: JSON.parse(newReport.userSolutions),
      authorityResponse: newReport.authorityResponse,
      currentStatus: newReport.currentStatus,
      reportedBy: newReport.reportedByName,
      reportedAt: newReport.reportedAt,
      description: newReport.description,
      hasUpvoted: true,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit report.' })
  }
}

export const toggleVote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({ error: 'Authentication required to vote on reports.' })
      return
    }

    const report = await prisma.cleanlinessReport.findUnique({ where: { id: String(id) } })
    if (!report) {
      res.status(404).json({ error: 'Report not found.' })
      return
    }

    const existingVote = await prisma.reportVote.findUnique({
      where: {
        reportId_userId: {
          reportId: String(id),
          userId: String(userId),
        },
      },
    })

    let hasUpvoted = false
    let newVoteCount = report.votes

    if (existingVote) {
      await prisma.reportVote.delete({
        where: { id: existingVote.id },
      })
      newVoteCount = Math.max(0, report.votes - 1)
      await prisma.cleanlinessReport.update({
        where: { id: String(id) },
        data: { votes: newVoteCount },
      })
      hasUpvoted = false
    } else {
      await prisma.reportVote.create({
        data: {
          reportId: String(id),
          userId: String(userId),
        },
      })
      newVoteCount = report.votes + 1
      await prisma.cleanlinessReport.update({
        where: { id: String(id) },
        data: { votes: newVoteCount },
      })
      hasUpvoted = true
    }

    res.json({ success: true, votes: newVoteCount, hasUpvoted })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Vote operation failed.' })
  }
}

export const addSolution = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { solution } = req.body

    if (!solution || typeof solution !== 'string') {
      res.status(400).json({ error: 'Solution text is required.' })
      return
    }

    const report = await prisma.cleanlinessReport.findUnique({ where: { id: String(id) } })
    if (!report) {
      res.status(404).json({ error: 'Report not found.' })
      return
    }

    const currentSolutions: string[] = JSON.parse(report.userSolutions || '[]')
    currentSolutions.push(solution.trim())

    const updated = await prisma.cleanlinessReport.update({
      where: { id: String(id) },
      data: {
        userSolutions: JSON.stringify(currentSolutions),
      },
    })

    res.json({ success: true, userSolutions: JSON.parse(updated.userSolutions) })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit solution.' })
  }
}

export const updateStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { status } = req.body

    if (!['Open', 'In Progress', 'Resolved'].includes(status)) {
      res.status(400).json({ error: 'Status must be Open, In Progress, or Resolved.' })
      return
    }

    const updated = await prisma.cleanlinessReport.update({
      where: { id: String(id) },
      data: { currentStatus: String(status) },
    })

    res.json({
      id: updated.id,
      currentStatus: updated.currentStatus,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update report status.' })
  }
}

export const addAuthorityResponse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
    const { response } = req.body

    if (!response || typeof response !== 'string') {
      res.status(400).json({ error: 'Authority response text is required.' })
      return
    }

    const updated = await prisma.cleanlinessReport.update({
      where: { id: String(id) },
      data: { authorityResponse: response.trim() },
    })

    res.json({
      id: updated.id,
      authorityResponse: updated.authorityResponse,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to publish authority response.' })
  }
}
