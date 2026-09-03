import crypto from 'crypto'

/**
 * Validates password strength according to security standards:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string; score: number } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.', score: 1 }
  }

  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 uppercase letter (A-Z).', score }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 lowercase letter (a-z).', score }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 number (0-9).', score }
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least 1 special character (!@#$%^&*...).', score }
  }

  return { valid: true, score: 5 }
}

/**
 * Validates strictly for Gmail addresses (@gmail.com) and standard RFC email format
 */
export function validateGmailAddress(email: string): { valid: boolean; message?: string } {
  if (!email) {
    return { valid: false, message: 'Email address is required.' }
  }

  const cleanEmail = email.toLowerCase().trim()
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, message: 'Please enter a valid email address format.' }
  }

  if (!cleanEmail.endsWith('@gmail.com')) {
    return { valid: false, message: 'Only Google Gmail addresses (@gmail.com) are accepted for verified accounts.' }
  }

  return { valid: true }
}

/**
 * Validates international / E.164 phone numbers
 */
export function validatePhoneNumber(phone: string): { valid: boolean; message?: string; formatted?: string } {
  if (!phone) {
    return { valid: false, message: 'Mobile phone number is required.' }
  }

  const cleanPhone = phone.trim().replace(/[\s\-()]/g, '')
  // Must be 10-15 digits, optionally starting with +
  const phoneRegex = /^\+?[0-9]{10,15}$/

  if (!phoneRegex.test(cleanPhone)) {
    return { valid: false, message: 'Please enter a valid 10 to 15 digit mobile phone number with country code.' }
  }

  return { valid: true, formatted: cleanPhone }
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP
 */
export function generateNumericOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Generates a cryptographically secure hex verification token
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}

/**
 * Computes a SHA-256 hash of a token or OTP before storing in database
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex')
}

/**
 * Masks an email for safe client-side display (e.g., a****v@gmail.com)
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '****@gmail.com'
  const [user, domain] = email.split('@')
  if (user.length <= 2) return `${user[0]}*@${domain}`
  return `${user[0]}${'*'.repeat(user.length - 2)}${user[user.length - 1]}@${domain}`
}

/**
 * Masks a phone number for safe display (e.g., +91 ****** 12345)
 */
export function maskPhone(phone: string): string {
  if (!phone) return '+91 ****** ****'
  const clean = phone.trim()
  if (clean.length < 8) return '******'
  const visibleLast = clean.slice(-4)
  const visiblePrefix = clean.slice(0, 4)
  return `${visiblePrefix} ****** ${visibleLast}`
}
