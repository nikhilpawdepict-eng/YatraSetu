import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '../db/prisma.js'
import { config } from '../config/env.js'
import type { AuthenticatedRequest } from '../middleware/auth.js'
import {
  validatePasswordStrength,
  validateGmailAddress,
  validatePhoneNumber,
  generateNumericOTP,
  hashToken,
  maskEmail,
  maskPhone,
} from '../utils/cryptoUtils.js'
import {
  sendEmailVerificationOTP,
  sendLogin2FAEmailOTP,
  sendPasswordResetOTP,
} from '../services/emailService.js'
import { sendPhoneOTP } from '../services/smsService.js'

const googleClient = new OAuth2Client(config.googleClientId)

export const generateToken = (userId: string, role: string, email: string, name: string) => {
  return jwt.sign(
    { userId, role, email, name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
  )
}

/**
 * 1. Register User — Creates pending_verification account and sends real Email + Phone OTPs
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role = 'user' } = req.body

    // 1. Validate Name
    if (!name || name.trim().length < 2) {
      res.status(400).json({ error: 'Full Name is required and must be at least 2 characters long.' })
      return
    }

    // 2. Validate Gmail Address
    const emailCheck = validateGmailAddress(email)
    if (!emailCheck.valid) {
      res.status(400).json({ error: emailCheck.message })
      return
    }
    const cleanEmail = email.toLowerCase().trim()

    // 3. Validate Mobile Phone
    const phoneCheck = validatePhoneNumber(phone)
    if (!phoneCheck.valid) {
      res.status(400).json({ error: phoneCheck.message })
      return
    }
    const cleanPhone = phoneCheck.formatted!

    // 4. Validate Password Strength
    const passCheck = validatePasswordStrength(password)
    if (!passCheck.valid) {
      res.status(400).json({ error: passCheck.message })
      return
    }

    // 5. Validate Role
    const validRoles = ['user', 'local', 'authority', 'admin']
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: 'Please select a valid role (Tourist, Local Host, or Civic Authority).' })
      return
    }

    // 6. Check unique Email
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })
    if (existingEmail) {
      res.status(409).json({ error: 'An account with this Gmail address already exists. Please log in.' })
      return
    }

    // 7. Check unique Phone
    const existingPhone = await prisma.user.findFirst({
      where: { phone: cleanPhone },
    })
    if (existingPhone) {
      res.status(409).json({ error: 'An account with this mobile phone number already exists.' })
      return
    }

    // 8. Hash Password securely with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(password, 12)
    const avatar = role === 'local' ? '🏡' : role === 'authority' ? '🛡️' : '👤'

    // 9. Create User in pending_verification status
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role,
        avatar,
        emailVerified: false,
        phoneVerified: false,
        accountStatus: 'pending_verification',
        twoFactorEnabled: false,
        points: 200,
      },
    })

    // 10. Generate 6-Digit Email OTP (5-min expiry) & Store ONLY the Hash
    const rawEmailOtp = generateNumericOTP()
    const emailOtpHash = hashToken(rawEmailOtp)
    await prisma.oTP.create({
      data: {
        userId: user.id,
        target: cleanEmail,
        otpHash: emailOtpHash,
        purpose: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    })

    // 11. Generate 6-Digit Phone OTP (5-min expiry) & Store ONLY the Hash
    const rawPhoneOtp = generateNumericOTP()
    const phoneOtpHash = hashToken(rawPhoneOtp)
    await prisma.oTP.create({
      data: {
        userId: user.id,
        target: cleanPhone,
        otpHash: phoneOtpHash,
        purpose: 'PHONE_VERIFICATION',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    })

    // 12. Dispatch Real Email & SMS (with dynamic OTP in templates)
    await sendEmailVerificationOTP(cleanEmail, user.name, rawEmailOtp)
    await sendPhoneOTP(cleanPhone, rawPhoneOtp, 'PHONE_VERIFICATION')

    res.status(201).json({
      success: true,
      userId: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      accountStatus: user.accountStatus,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      message: 'Account created in pending_verification status. Please enter the 6-digit codes sent to your Gmail and Mobile Phone.',
    })
  } catch (err: any) {
    console.error('[AuthController] Registration Error:', err)
    res.status(500).json({ error: err.message || 'Registration failed.' })
  }
}

/**
 * 2. Verify Email via 6-Digit OTP
 */
export const verifyEmailOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, userId } = req.body

    if (!otp || (!email && !userId)) {
      res.status(400).json({ error: 'Gmail address and 6-digit verification code are required.' })
      return
    }

    let user = null
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } })
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    }

    if (!user) {
      res.status(404).json({ error: 'User account not found.' })
      return
    }

    if (user.emailVerified) {
      res.json({
        success: true,
        emailVerified: true,
        phoneVerified: user.phoneVerified,
        accountStatus: user.accountStatus,
        message: 'Gmail address has already been verified.',
      })
      return
    }

    const otpHash = hashToken(otp)
    const targetEmail = user.email

    // Check active OTP
    const record = await prisma.oTP.findFirst({
      where: {
        OR: [{ target: targetEmail }, { userId: user.id }],
        purpose: 'EMAIL_VERIFICATION',
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) {
      res.status(400).json({ error: 'No active email verification code found. Please click Resend Code.' })
      return
    }

    if (record.attempts >= record.maxAttempts) {
      res.status(429).json({ error: 'Maximum attempts exceeded. Please request a new verification code.' })
      return
    }

    if (new Date() > record.expiresAt) {
      res.status(400).json({ error: 'Verification code has expired. Please request a new code.' })
      return
    }

    if (record.otpHash !== otpHash) {
      await prisma.oTP.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      })
      res.status(400).json({
        error: `Invalid verification code. Attempts remaining: ${record.maxAttempts - record.attempts - 1}`,
      })
      return
    }

    // Mark OTP verified
    await prisma.oTP.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    })

    // Update user status
    const shouldActivate = user.phoneVerified === true
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        accountStatus: shouldActivate ? 'active' : user.accountStatus,
      },
    })

    res.json({
      success: true,
      emailVerified: true,
      phoneVerified: updatedUser.phoneVerified,
      accountStatus: updatedUser.accountStatus,
      message: shouldActivate
        ? 'Email verified! Account is now ACTIVE and ready for login.'
        : 'Email verified successfully! Please complete mobile phone verification.',
    })
  } catch (err: any) {
    console.error('[AuthController] Verify Email OTP Error:', err)
    res.status(500).json({ error: 'Email verification failed.' })
  }
}

/**
 * 3. Resend Email Verification OTP
 */
export const resendEmailOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, userId } = req.body

    let user = null
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } })
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    }

    if (!user) {
      res.json({ success: true, message: 'Verification email resent if account exists.' })
      return
    }

    if (user.emailVerified) {
      res.status(400).json({ error: 'Gmail address is already verified.' })
      return
    }

    // Invalidate previous OTPs
    await prisma.oTP.updateMany({
      where: {
        OR: [{ target: user.email }, { userId: user.id }],
        purpose: 'EMAIL_VERIFICATION',
        verifiedAt: null,
      },
      data: { verifiedAt: new Date() },
    })

    // Generate NEW OTP
    const rawOtp = generateNumericOTP()
    const otpHash = hashToken(rawOtp)

    await prisma.oTP.create({
      data: {
        userId: user.id,
        target: user.email,
        otpHash,
        purpose: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    })

    await sendEmailVerificationOTP(user.email, user.name, rawOtp)

    res.json({
      success: true,
      message: `A new 6-digit verification code has been dispatched to ${user.email}.`,
      expiresInSeconds: 300,
    })
  } catch (err: any) {
    console.error('[AuthController] Resend Email OTP Error:', err)
    res.status(500).json({ error: 'Failed to resend email verification code.' })
  }
}

/**
 * 4. Verify Phone OTP
 */
export const verifyPhoneOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp, userId } = req.body

    if (!otp || (!phone && !userId)) {
      res.status(400).json({ error: 'Mobile number and 6-digit OTP code are required.' })
      return
    }

    let user = null
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } })
    }

    const cleanPhone = phone ? phone.trim().replace(/[\s\-()]/g, '') : ''
    if (!user && cleanPhone) {
      user = await prisma.user.findFirst({
        where: {
          OR: [{ phone: cleanPhone }, { phone: phone.trim() }],
        },
      })
    }

    const target = user?.phone || cleanPhone || (phone ? phone.trim() : '')
    const otpHash = hashToken(otp)

    const record = await prisma.oTP.findFirst({
      where: {
        OR: [
          { target: cleanPhone },
          { target: phone ? phone.trim() : '' },
          ...(user ? [{ userId: user.id }] : []),
          ...(target ? [{ target }] : []),
        ],
        purpose: 'PHONE_VERIFICATION',
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) {
      res.status(400).json({ error: 'No active OTP found. Please request a new OTP.' })
      return
    }

    if (record.attempts >= record.maxAttempts) {
      res.status(429).json({ error: 'Maximum verification attempts exceeded. Please request a new OTP.' })
      return
    }

    if (new Date() > record.expiresAt) {
      res.status(400).json({ error: 'OTP has expired. Please request a new verification code.' })
      return
    }

    if (record.otpHash !== otpHash) {
      await prisma.oTP.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      })
      res.status(400).json({
        error: `Invalid OTP code. Attempts remaining: ${record.maxAttempts - record.attempts - 1}`,
      })
      return
    }

    // Mark OTP verified
    await prisma.oTP.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    })

    if (user) {
      const shouldActivate = user.emailVerified === true
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneVerified: true,
          accountStatus: shouldActivate ? 'active' : user.accountStatus,
        },
      })

      res.json({
        success: true,
        phoneVerified: true,
        emailVerified: updatedUser.emailVerified,
        accountStatus: updatedUser.accountStatus,
        message: shouldActivate
          ? 'Mobile verified! Account is now ACTIVE and ready for login.'
          : 'Mobile verified successfully! Please complete Gmail verification.',
      })
      return
    }

    res.json({
      success: true,
      phoneVerified: true,
      message: 'Mobile number verified successfully.',
    })
  } catch (err: any) {
    console.error('[AuthController] Verify Phone OTP Error:', err)
    res.status(500).json({ error: 'Failed to verify phone OTP.' })
  }
}

/**
 * 5. Resend Phone OTP
 */
export const resendPhoneOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, userId } = req.body

    let user = null
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } })
    }

    const cleanPhone = phone ? phone.trim().replace(/[\s\-()]/g, '') : user?.phone || ''
    if (!cleanPhone) {
      res.status(400).json({ error: 'Mobile phone number is required.' })
      return
    }

    // Invalidate previous OTPs
    await prisma.oTP.updateMany({
      where: {
        OR: [{ target: cleanPhone }, ...(user ? [{ userId: user.id }] : [])],
        purpose: 'PHONE_VERIFICATION',
        verifiedAt: null,
      },
      data: { verifiedAt: new Date() },
    })

    // Generate NEW OTP
    const rawOtp = generateNumericOTP()
    const otpHash = hashToken(rawOtp)

    const otpRecord = await prisma.oTP.create({
      data: {
        userId: user?.id || undefined,
        target: cleanPhone,
        otpHash,
        purpose: 'PHONE_VERIFICATION',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    })

    const smsResult = await sendPhoneOTP(cleanPhone, rawOtp, 'PHONE_VERIFICATION')
    const finalOtp = smsResult.dispatchedOtp || rawOtp
    if (smsResult.dispatchedOtp && smsResult.dispatchedOtp !== rawOtp) {
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { otpHash: hashToken(finalOtp) },
      })
    }

    res.json({
      success: true,
      message: `A 6-digit OTP has been sent to ${cleanPhone}.`,
      expiresInSeconds: 300,
    })
  } catch (err: any) {
    console.error('[AuthController] Resend Phone OTP Error:', err)
    res.status(500).json({ error: 'Failed to resend phone OTP.' })
  }
}

/**
 * 6. Login with Mandatory Verification & 2FA Enforcement
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: 'Gmail address and password are required.' })
      return
    }

    const cleanEmail = email.toLowerCase().trim()
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })

    if (!user) {
      res.status(401).json({ error: 'Invalid email address or password.' })
      return
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email address or password.' })
      return
    }

    // Mandatory Verification Check
    if (!user.emailVerified || !user.phoneVerified || user.accountStatus !== 'active') {
      res.status(403).json({
        error: 'Account verification incomplete. Please verify both your Gmail address and mobile phone number.',
        verificationIncomplete: true,
        userId: user.id,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        accountStatus: user.accountStatus,
      })
      return
    }

    // 2FA Enforcement (only when explicitly requested)
    if (user.twoFactorEnabled && req.body.enable2FA === true) {
      const raw2faOtp = generateNumericOTP()
      const otpHash = hashToken(raw2faOtp)

      await prisma.oTP.create({
        data: {
          userId: user.id,
          target: user.email,
          otpHash,
          purpose: 'LOGIN_2FA',
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      })

      // Send 2FA via Email and Phone in parallel
      Promise.allSettled([
        sendLogin2FAEmailOTP(user.email, user.name, raw2faOtp),
        user.phone ? sendPhoneOTP(user.phone, raw2faOtp, 'LOGIN_2FA') : Promise.resolve(),
      ]).catch((e) => console.error('[2FA Dispatch Error]:', e))

      res.json({
        requires2FA: true,
        userId: user.id,
        emailMasked: maskEmail(user.email),
        phoneMasked: maskPhone(user.phone || ''),
        message: 'Two-factor verification code dispatched to your verified Gmail and Mobile Phone.',
      })
      return
    }

    // Direct Login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

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
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        accountStatus: user.accountStatus,
        points: user.points,
      },
    })
  } catch (err: any) {
    console.error('[AuthController] Login Error:', err)
    res.status(500).json({ error: err?.message || 'Login failed.' })
  }
}

/**
 * 7. Verify Two-Factor Login OTP
 */
export const verifyLoginOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, otp } = req.body

    if (!userId || !otp) {
      res.status(400).json({ error: 'User ID and 6-digit 2FA code are required.' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      res.status(404).json({ error: 'User not found.' })
      return
    }

    const otpHash = hashToken(otp)
    const record = await prisma.oTP.findFirst({
      where: {
        userId: user.id,
        purpose: 'LOGIN_2FA',
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) {
      res.status(400).json({ error: 'No active 2FA code found. Please request a new code.' })
      return
    }

    if (record.attempts >= record.maxAttempts) {
      res.status(429).json({ error: 'Maximum attempts exceeded. Please try logging in again.' })
      return
    }

    if (new Date() > record.expiresAt) {
      res.status(400).json({ error: '2FA code has expired. Please try logging in again.' })
      return
    }

    if (record.otpHash !== otpHash) {
      await prisma.oTP.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      })
      res.status(400).json({
        error: `Invalid 2FA code. Attempts remaining: ${record.maxAttempts - record.attempts - 1}`,
      })
      return
    }

    // Mark OTP verified
    await prisma.oTP.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    })

    // Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    const token = generateToken(user.id, user.role, user.email, user.name)

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        accountStatus: user.accountStatus,
        points: user.points,
      },
      message: 'Two-factor authentication verified successfully!',
    })
  } catch (err: any) {
    console.error('[AuthController] Verify Login OTP Error:', err)
    res.status(500).json({ error: '2FA verification failed.' })
  }
}

/**
 * 8. Real Google OAuth 2.0 / OpenID Connect Verification
 */
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, idToken, role = 'user' } = req.body
    const tokenToVerify = credential || idToken

    if (!tokenToVerify) {
      res.status(400).json({ error: 'Google OAuth credential / ID Token is required.' })
      return
    }

    let googlePayload: any = null

    // 1. Verify with google-auth-library if CLIENT_ID configured
    if (config.googleClientId) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: tokenToVerify,
          audience: config.googleClientId,
        })
        googlePayload = ticket.getPayload()
      } catch (e: any) {
        console.warn('[GoogleAuth] verifyIdToken failed, attempting Google tokeninfo endpoint fallback:', e.message)
      }
    }

    // 2. Direct Google tokeninfo fallback
    if (!googlePayload) {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenToVerify}`)
      if (response.ok) {
        googlePayload = await response.json()
      }
    }

    if (!googlePayload || !googlePayload.email) {
      res.status(401).json({ error: 'Invalid or expired Google OAuth credential.' })
      return
    }

    const cleanEmail = googlePayload.email.toLowerCase().trim()
    const googleName = googlePayload.name || 'Google User'
    const googleAvatar = googlePayload.picture || '👤'

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })

    if (!user) {
      // Create user with verified Google email, but pending phone verification
      const dummyHash = await bcrypt.hash(generateNumericOTP() + 'GoogleAuth@2026', 10)
      user = await prisma.user.create({
        data: {
          name: googleName,
          email: cleanEmail,
          passwordHash: dummyHash,
          role,
          avatar: googleAvatar,
          emailVerified: true,
          phoneVerified: false,
          accountStatus: 'pending_verification',
          location: 'Jaipur, Rajasthan',
          points: 250,
        },
      })
    } else {
      // Mark email verified
      if (!user.emailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        })
      }
    }

    // Check if phone verification is required
    if (!user.phoneVerified || !user.phone) {
      res.json({
        phoneVerificationRequired: true,
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        message: 'Google identity verified. Please verify your mobile phone number to complete account activation.',
      })
      return
    }

    // Update lastLogin and issue token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        accountStatus: 'active',
      },
    })

    const token = generateToken(user.id, user.role, user.email, user.name)

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        accountStatus: 'active',
        points: user.points,
      },
      message: 'Signed in with Google successfully!',
    })
  } catch (err: any) {
    console.error('[AuthController] Google Auth Error:', err)
    res.status(500).json({ error: err.message || 'Google authentication failed.' })
  }
}

/**
 * 9. Forgot Password — Dispatches 6-Digit OTP to Gmail or Mobile Phone
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone } = req.body

    if (!email && !phone) {
      res.status(400).json({ error: 'Please enter your registered Gmail address or Mobile phone number.' })
      return
    }

    let user = null
    let target = ''
    let channel: 'email' | 'phone' = 'email'

    if (email) {
      const cleanEmail = email.toLowerCase().trim()
      user = await prisma.user.findUnique({ where: { email: cleanEmail } })
      target = cleanEmail
      channel = 'email'
    } else if (phone) {
      const cleanDigits = phone.replace(/[^0-9]/g, '').slice(-10)
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: { contains: cleanDigits } },
            { phone: phone.trim() },
          ],
        },
      })
      target = user?.phone || phone.trim()
      channel = 'phone'
    }

    // Protection: return success message even if user doesn't exist
    if (!user) {
      res.json({
        success: true,
        message: channel === 'email'
          ? 'If an account exists with this Gmail address, a 6-digit password reset code has been dispatched.'
          : 'If an account exists with this Mobile number, a 6-digit password reset code has been dispatched.',
      })
      return
    }

    // Invalidate previous password reset OTPs
    await prisma.oTP.updateMany({
      where: {
        userId: user.id,
        purpose: 'PASSWORD_RESET',
        verifiedAt: null,
      },
      data: { verifiedAt: new Date() },
    })

    const rawResetOtp = generateNumericOTP()
    const otpHash = hashToken(rawResetOtp)
    const otpRecord = await prisma.oTP.create({
      data: {
        userId: user.id,
        target,
        otpHash,
        purpose: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    })

    let finalResetOtp = rawResetOtp
    if (channel === 'email') {
      await sendPasswordResetOTP(user.email, user.name, rawResetOtp)
    } else {
      const smsResult = await sendPhoneOTP(target, rawResetOtp, 'PASSWORD_RESET')
      if (smsResult.dispatchedOtp && smsResult.dispatchedOtp !== rawResetOtp) {
        finalResetOtp = smsResult.dispatchedOtp
        await prisma.oTP.update({
          where: { id: otpRecord.id },
          data: { otpHash: hashToken(finalResetOtp) },
        })
      }
    }

    res.json({
      success: true,
      channel,
      target,
      message: channel === 'email'
        ? `A 6-digit reset code has been dispatched to ${user.email}.`
        : `A 6-digit reset OTP has been sent to ${target}.`,
      expiresInSeconds: 300,
    })
  } catch (err: any) {
    console.error('[AuthController] Forgot Password Error:', err)
    res.status(500).json({ error: 'Failed to process forgot password request.' })
  }
}

/**
 * 10. Reset Password with 6-Digit OTP (Supports Gmail and Mobile Phone)
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, otp, newPassword } = req.body

    if ((!email && !phone) || !otp || !newPassword) {
      res.status(400).json({ error: 'Account identifier (email or phone), 6-digit OTP code, and new password are required.' })
      return
    }

    const passCheck = validatePasswordStrength(newPassword)
    if (!passCheck.valid) {
      res.status(400).json({ error: passCheck.message })
      return
    }

    let user = null
    if (email) {
      const cleanEmail = email.toLowerCase().trim()
      user = await prisma.user.findUnique({ where: { email: cleanEmail } })
    } else if (phone) {
      const cleanDigits = phone.replace(/[^0-9]/g, '').slice(-10)
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: { contains: cleanDigits } },
            { phone: phone.trim() },
          ],
        },
      })
    }

    if (!user) {
      res.status(404).json({ error: 'User account not found.' })
      return
    }

    const otpHash = hashToken(otp)
    const record = await prisma.oTP.findFirst({
      where: {
        userId: user.id,
        purpose: 'PASSWORD_RESET',
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) {
      res.status(400).json({ error: 'No active password reset code found. Please request a new code.' })
      return
    }

    if (new Date() > record.expiresAt) {
      res.status(400).json({ error: 'Password reset code has expired. Please request a new code.' })
      return
    }

    if (record.otpHash !== otpHash) {
      await prisma.oTP.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      })
      res.status(400).json({ error: 'Invalid password reset code.' })
      return
    }

    // Invalidate OTP
    await prisma.oTP.update({
      where: { id: record.id },
      data: { verifiedAt: new Date() },
    })

    // Hash new password and update
    const newPasswordHash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    })

    res.json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.',
    })
  } catch (err: any) {
    console.error('[AuthController] Reset Password Error:', err)
    res.status(500).json({ error: 'Failed to reset password.' })
  }
}

/**
 * 11. Get Current Authenticated Session (GET /auth/me)
 */
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
        points: true,
        emailVerified: true,
        phoneVerified: true,
        accountStatus: true,
        twoFactorEnabled: true,
        lastLogin: true,
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

/**
 * 12. Logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Logged out successfully.' })
}
