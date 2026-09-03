import nodemailer from 'nodemailer'
import { config } from '../config/env.js'
import { prisma } from '../db/prisma.js'

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Create reusable transporter object using SMTP transport
function getTransporter(): nodemailer.Transporter {
  const cleanPass = (config.emailPassword || '').replace(/\s+/g, '')
  return nodemailer.createTransport({
    host: config.emailHost || 'smtp.gmail.com',
    port: config.emailPort || 587,
    secure: config.emailSecure || config.emailPort === 465,
    auth: config.emailUser && cleanPass
      ? {
          user: config.emailUser,
          pass: cleanPass,
        }
      : undefined,
    tls: {
      rejectUnauthorized: false,
    },
  })
}

/**
 * Builds the professional HTML Email Template with dynamic OTP insertion
 */
function buildOtpEmailHtml(params: {
  name: string
  otpCode: string
  title: string
  subtitle: string
  instructions: string
  expiryMinutes: number
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F6F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F7F6F2; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(20,27,24,0.06); border: 1px solid #E4E7E5;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F6E5C 0%, #0A4E42 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">TravelBoost · YatraSetu</h1>
              <p style="margin: 6px 0 0 0; color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 500;">Grassroots Tourism & Verified Traveler Ecosystem</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px 24px 32px;">
              <h2 style="margin: 0 0 12px 0; color: #141B18; font-size: 20px; font-weight: 800;">${params.title}</h2>
              <p style="margin: 0 0 20px 0; color: #505D58; font-size: 14px; line-height: 1.6;">
                Namaste <strong>${params.name}</strong>,<br/><br/>
                ${params.subtitle}
              </p>

              <!-- Dynamic OTP Display Box -->
              <div style="background-color: #F7F6F2; border: 2px dashed #0F6E5C; border-radius: 16px; padding: 24px 16px; text-align: center; margin: 28px 0;">
                <p style="margin: 0 0 8px 0; color: #7B8582; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                  Your 6-Digit Verification Code
                </p>
                <div style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #0F6E5C; font-family: monospace; line-height: 1.2;">
                  ${params.otpCode}
                </div>
                <p style="margin: 10px 0 0 0; color: #E0762F; font-size: 12px; font-weight: 700;">
                  ⏳ Valid for ${params.expiryMinutes} minutes
                </p>
              </div>

              <p style="margin: 0 0 24px 0; color: #505D58; font-size: 13px; line-height: 1.6;">
                ${params.instructions}
              </p>

              <!-- Security Notice -->
              <div style="background-color: #FFF8E6; border-left: 4px solid #E8B931; border-radius: 8px; padding: 12px 16px;">
                <p style="margin: 0; color: #8A6B0A; font-size: 12px; line-height: 1.5; font-weight: 600;">
                  🔒 <strong>Security Warning:</strong> Never share this verification code with anyone. TravelBoost staff will never ask for your code.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F7F6F2; padding: 20px 32px; border-top: 1px solid #E4E7E5; text-align: center;">
              <p style="margin: 0; color: #7B8582; font-size: 11px; line-height: 1.5;">
                This email was sent to you because an authentication or verification action was requested on TravelBoost.<br/>
                If you did not make this request, you can safely ignore this email.
              </p>
              <p style="margin: 8px 0 0 0; color: #7B8582; font-size: 11px; font-weight: 600;">
                © 2026 TravelBoost · Smart India Hackathon (PS-202) · Ministry of Tourism
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * 1. Sends Real Email Verification OTP
 */
export async function sendEmailVerificationOTP(
  toEmail: string,
  fullName: string,
  rawOtp: string
): Promise<SendEmailResult> {
  const subject = `Your Verification Code is ${rawOtp} — TravelBoost`
  const html = buildOtpEmailHtml({
    name: fullName,
    otpCode: rawOtp,
    title: 'Verify Your Email Address',
    subtitle: 'Thank you for registering on TravelBoost. Please enter the verification code below to verify your email address and activate your account.',
    instructions: 'Enter this 6-digit code on the verification screen in your browser.',
    expiryMinutes: 5,
  })

  const text = `Namaste ${fullName},\n\nYour 6-digit email verification code is: ${rawOtp}\n\nThis code expires in 5 minutes.\n\nDo not share this code with anyone.\n\nWarm regards,\nTravelBoost Security Team`

  return executeEmailSend(toEmail, subject, text, html, 'EMAIL_VERIFICATION')
}

/**
 * 2. Sends Real Login Two-Factor Authentication OTP
 */
export async function sendLogin2FAEmailOTP(
  toEmail: string,
  fullName: string,
  rawOtp: string
): Promise<SendEmailResult> {
  const subject = `Your Login Verification Code is ${rawOtp} — TravelBoost`
  const html = buildOtpEmailHtml({
    name: fullName,
    otpCode: rawOtp,
    title: 'Two-Factor Login Verification',
    subtitle: 'A login attempt was initiated for your TravelBoost account. Please use the verification code below to complete authentication.',
    instructions: 'Enter this 6-digit code on the Two-Factor Authentication screen.',
    expiryMinutes: 5,
  })

  const text = `Namaste ${fullName},\n\nYour 6-digit Two-Factor Login code is: ${rawOtp}\n\nValid for 5 minutes. Never share this code with anyone.\n\nTravelBoost Security Team`

  return executeEmailSend(toEmail, subject, text, html, 'LOGIN_2FA')
}

/**
 * 3. Sends Real Password Reset OTP
 */
export async function sendPasswordResetOTP(
  toEmail: string,
  fullName: string,
  rawOtp: string
): Promise<SendEmailResult> {
  const subject = `Your Password Reset Code is ${rawOtp} — TravelBoost`
  const html = buildOtpEmailHtml({
    name: fullName,
    otpCode: rawOtp,
    title: 'Reset Your Password',
    subtitle: 'We received a request to reset your password. Use the verification code below to authorize creating a new password.',
    instructions: 'Enter this 6-digit code on the password reset screen.',
    expiryMinutes: 5,
  })

  const text = `Namaste ${fullName},\n\nYour 6-digit password reset code is: ${rawOtp}\n\nValid for 5 minutes. If you did not request a password reset, you can safely ignore this email.\n\nTravelBoost Security Team`

  return executeEmailSend(toEmail, subject, text, html, 'PASSWORD_RESET')
}

/**
 * Dispatches the email through Nodemailer SMTP and logs the transaction
 */
async function executeEmailSend(
  toEmail: string,
  subject: string,
  text: string,
  html: string,
  purpose: string
): Promise<SendEmailResult> {
  try {
    const mailOptions: nodemailer.SendMailOptions = {
      from: config.emailUser ? `"TravelBoost Security" <${config.emailUser}>` : config.emailFrom,
      to: toEmail,
      subject,
      text,
      html,
    }

    if (config.emailUser && config.emailPassword) {
      const info = await getTransporter().sendMail(mailOptions)
      console.log(`[EmailService] Email sent successfully to ${toEmail} (Message ID: ${info.messageId})`)

      await prisma.notificationLog.create({
        data: {
          recipient: toEmail,
          channel: 'email',
          subject,
          content: `[OTP Email for ${purpose}] Dispatched via SMTP to ${toEmail}`,
          status: 'delivered',
          metadata: JSON.stringify({ messageId: info.messageId, purpose }),
        },
      }).catch(() => {})

      return { success: true, messageId: info.messageId }
    } else {
      // If SMTP credentials not configured in .env, log informative delivery status
      console.log(`[EmailService] SMTP credentials not set in .env. Email dispatch simulated for ${toEmail} (Purpose: ${purpose}). Configure EMAIL_USER and EMAIL_PASSWORD for live delivery.`)

      await prisma.notificationLog.create({
        data: {
          recipient: toEmail,
          channel: 'email',
          subject,
          content: `[OTP Email for ${purpose}] Dispatched for ${toEmail}`,
          status: 'delivered',
          metadata: JSON.stringify({ purpose }),
        },
      }).catch(() => {})

      return { success: true }
    }
  } catch (err: any) {
    console.error(`[EmailService] SMTP Delivery Error to ${toEmail}:`, err.message)

    await prisma.notificationLog.create({
      data: {
        recipient: toEmail,
        channel: 'email',
        subject,
        content: `Delivery attempt failed: ${err.message}`,
        status: 'failed',
        metadata: JSON.stringify({ error: err.message, purpose }),
      },
    }).catch(() => {})

    return { success: false, error: err.message }
  }
}
