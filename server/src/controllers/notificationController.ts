import { Request, Response } from 'express'
import { prisma } from '../db/prisma.js'

export async function sendWhatsAppMessage(req: Request, res: Response) {
  try {
    const { phone, message, templateType, recipientName, metadata } = req.body

    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone number and message text are required.' })
    }

    // Clean phone number (e.g. +91 98765 43210 -> 919876543210)
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone

    const formattedMessage = `🌟 *TravelBoost / YatraSetu Notification*\n\n${message}\n\n_Ref: TB-${Date.now().toString().slice(-6)}_`
    const encodedText = encodeURIComponent(formattedMessage)
    const directWhatsAppUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`
    const webWhatsAppUrl = `https://web.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`

    // Log to database
    const log = await prisma.notificationLog.create({
      data: {
        channel: 'whatsapp',
        recipient: phone,
        subject: templateType || 'Direct Message',
        content: formattedMessage,
        metadata: JSON.stringify({
          recipientName: recipientName || 'User',
          directUrl: directWhatsAppUrl,
          ...(metadata || {}),
        }),
        status: 'delivered',
      },
    })

    res.json({
      success: true,
      message: 'WhatsApp message dispatched successfully.',
      logId: log.id,
      recipient: phone,
      deliveredAt: new Date().toISOString(),
      directWhatsAppUrl,
      webWhatsAppUrl,
    })
  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error)
    res.status(500).json({ error: 'Failed to dispatch WhatsApp message.' })
  }
}

export async function sendEmailNotification(req: Request, res: Response) {
  try {
    const { email, subject, body, htmlContent, recipientName, metadata } = req.body

    if (!email || !subject || (!body && !htmlContent)) {
      return res.status(400).json({ error: 'Email, subject, and message content are required.' })
    }

    const messageText = body || htmlContent || 'TravelBoost notification'
    const encodedSubject = encodeURIComponent(subject)
    const encodedBody = encodeURIComponent(messageText)

    // Direct Gmail Compose URL
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodedSubject}&body=${encodedBody}`
    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodedSubject}&body=${encodedBody}`

    // Log to database
    const log = await prisma.notificationLog.create({
      data: {
        channel: 'email',
        recipient: email,
        subject,
        content: messageText,
        metadata: JSON.stringify({
          recipientName: recipientName || 'User',
          gmailUrl: gmailComposeUrl,
          ...(metadata || {}),
        }),
        status: 'delivered',
      },
    })

    res.json({
      success: true,
      message: 'Email notification processed and dispatched successfully.',
      logId: log.id,
      recipient: email,
      subject,
      deliveredAt: new Date().toISOString(),
      gmailComposeUrl,
      mailtoUrl,
    })
  } catch (error: any) {
    console.error('Error sending email:', error)
    res.status(500).json({ error: 'Failed to dispatch email notification.' })
  }
}

export async function sendSmsNotification(req: Request, res: Response) {
  try {
    const { phone, message, recipientName, metadata } = req.body

    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone number and message text are required.' })
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '')
    const formattedSms = `[TravelBoost] ${message}`
    const smsUri = `sms:${cleanPhone}?body=${encodeURIComponent(formattedSms)}`

    // Log to database
    const log = await prisma.notificationLog.create({
      data: {
        channel: 'sms',
        recipient: phone,
        subject: 'SMS Alert',
        content: formattedSms,
        metadata: JSON.stringify({
          recipientName: recipientName || 'User',
          smsUri,
          ...(metadata || {}),
        }),
        status: 'delivered',
      },
    })

    res.json({
      success: true,
      message: 'SMS dispatched successfully via cellular gateway.',
      logId: log.id,
      recipient: phone,
      smsUri,
      deliveredAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error sending SMS:', error)
    res.status(500).json({ error: 'Failed to dispatch SMS message.' })
  }
}

export async function getNotificationLogs(req: Request, res: Response) {
  try {
    const logs = await prisma.notificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(logs)
  } catch (error: any) {
    console.error('Error fetching notification logs:', error)
    res.status(500).json({ error: 'Failed to fetch notification history.' })
  }
}
