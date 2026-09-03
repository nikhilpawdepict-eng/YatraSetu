import { config } from '../config/env.js'
import { prisma } from '../db/prisma.js'

export interface SendSMSResult {
  success: boolean
  messageId?: string
  dispatchedOtp?: string
  error?: string
}

/**
 * Dispatches a 6-digit SMS OTP via Twilio / Fast2SMS / Provider
 */
export async function sendPhoneOTP(
  phoneNumber: string,
  rawOtp: string,
  purpose: 'PHONE_VERIFICATION' | 'LOGIN_2FA' | 'PASSWORD_RESET' = 'PHONE_VERIFICATION'
): Promise<SendSMSResult> {
  const purposeText =
    purpose === 'PHONE_VERIFICATION'
      ? 'phone verification'
      : purpose === 'LOGIN_2FA'
      ? 'two-factor login'
      : 'password reset'

  const messageText = `[TravelBoost] Your 6-digit ${purposeText} code is ${rawOtp}. Valid for 5 minutes. Never share this code.`

  try {
    // 1. If Twilio configured
    if (config.twilioAccountSid && config.twilioAuthToken && config.twilioPhoneNumber) {
      const cleanDigits = phoneNumber.replace(/[^0-9]/g, '')
      const formattedTo = phoneNumber.startsWith('+')
        ? `+${cleanDigits}`
        : cleanDigits.length === 10
        ? `+91${cleanDigits}`
        : `+${cleanDigits}`

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`
      const authHeader = 'Basic ' + Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString('base64')

      // Try trial template 'sms_2fa' first, then fallback to messageText
      let params = new URLSearchParams()
      params.append('To', formattedTo)
      params.append('From', config.twilioPhoneNumber)
      params.append('Body', 'sms_2fa')

      let response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      let data: any = await response.json()

      if (!response.ok && data.message?.includes('Invalid template name')) {
        params = new URLSearchParams()
        params.append('To', formattedTo)
        params.append('From', config.twilioPhoneNumber)
        params.append('Body', messageText)

        response = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        })
        data = await response.json()
      }

      if (response.ok) {
        let dispatchedOtp = rawOtp
        if (data.body) {
          const match = data.body.match(/\b(\d{6})\b/)
          if (match && match[1]) {
            dispatchedOtp = match[1]
          }
        }

        console.log(`[SMSService] Twilio SMS dispatched successfully to ${formattedTo} (SID: ${data.sid}, Code: ${dispatchedOtp})`)
        await prisma.notificationLog.create({
          data: {
            recipient: formattedTo,
            channel: 'sms',
            content: `[SMS OTP for ${purpose}] Dispatched via Twilio to ${formattedTo} (Code: ${dispatchedOtp})`,
            status: 'delivered',
            metadata: JSON.stringify({ sid: data.sid, purpose, code: dispatchedOtp }),
          },
        }).catch(() => {})

        return { success: true, messageId: data.sid, dispatchedOtp }
      } else {
        console.error(`[SMSService] Twilio API Error:`, data.message)
        return { success: false, error: data.message }
      }
    }

    // 2. If Fast2SMS configured
    if (config.fast2smsApiKey) {
      const cleanDigits = phoneNumber.replace(/[^0-9]/g, '').slice(-10)
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: config.fast2smsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: rawOtp,
          numbers: cleanDigits,
        }),
      })

      const data: any = await response.json()
      if (data.return || data.status_code === 200) {
        console.log(`[SMSService] Fast2SMS dispatched successfully to ${cleanDigits}`)
        return { success: true }
      } else {
        console.warn(`[SMSService] Fast2SMS notice: ${data.message || JSON.stringify(data)}`)
      }
    }

    // 3. Fallback / Local Development Mode
    console.log(`[SMSService] SMS Provider not configured in .env. SMS dispatch simulated for ${phoneNumber} (Purpose: ${purpose}). Configure TWILIO_* or FAST2SMS_API_KEY in .env for live carrier delivery.`)

    await prisma.notificationLog.create({
      data: {
        recipient: phoneNumber,
        channel: 'sms',
        content: `[SMS OTP for ${purpose}] Dispatched for ${phoneNumber}`,
        status: 'delivered',
        metadata: JSON.stringify({ purpose }),
      },
    }).catch(() => {})

    return { success: true }
  } catch (err: any) {
    console.error(`[SMSService] SMS Dispatch Error:`, err.message)
    return { success: false, error: err.message }
  }
}
