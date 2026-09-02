import { Request, Response } from 'express'
import { config } from '../config/env.js'

export const handleFileUpload = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file uploaded.' })
    return
  }

  const fileUrl = `${config.baseUrl}/uploads/${req.file.filename}`

  res.status(201).json({
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  })
}
