import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[API Error]:', err)

  if (err.name === 'MulterError') {
    res.status(400).json({ error: `Upload error: ${err.message}` })
    return
  }

  if (err.message && err.message.includes('Invalid file type')) {
    res.status(400).json({ error: err.message })
    return
  }

  const statusCode = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  })
}
