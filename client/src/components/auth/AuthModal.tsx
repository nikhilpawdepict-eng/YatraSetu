import React, { useState, useEffect } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import {
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  User,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  X,
  RefreshCw,
  Send,
  KeyRound,
} from 'lucide-react'

export type ModalView =
  | 'login'
  | 'register'
  | 'verify_email'
  | 'verify_phone'
  | 'verify_2fa'
  | 'forgot_password'
  | 'reset_password'

interface Props {
  isOpen: boolean
  initialView?: ModalView
  onClose: () => void
  onSuccess?: () => void
}

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
]

export default function AuthModal({ isOpen, initialView = 'login', onClose, onSuccess }: Props) {
  const {
    authState,
    pendingInfo,
    login,
    verifyLogin2FA,
    register,
    verifyEmailOtp,
    resendEmailOtp,
    verifyPhoneOtp,
    resendPhoneOtp,
    googleLogin,
    setPendingStep,
  } = useAuth()

  const [view, setView] = useState<ModalView>(initialView)

  // Align view with global authState if in a pending step
  useEffect(() => {
    if (authState === 'PENDING_EMAIL_VERIFICATION') {
      setView('verify_email')
    } else if (authState === 'PENDING_PHONE_VERIFICATION') {
      setView('verify_phone')
    } else if (authState === 'PENDING_2FA') {
      setView('verify_2fa')
    } else {
      setView(initialView)
    }
  }, [authState, initialView, isOpen])

  // Form States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Registration Inputs
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState<'user' | 'local' | 'authority'>('user')

  // Direct Phone Verification Inputs
  const [verifyPhoneNum, setVerifyPhoneNum] = useState('')
  const [verifyPhoneCountryCode, setVerifyPhoneCountryCode] = useState('+91')

  // Direct Email Verification Inputs
  const [verifyEmailAddr, setVerifyEmailAddr] = useState('')

  // Login Inputs
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // 6-Digit OTP Boxes State
  const [emailOtpDigits, setEmailOtpDigits] = useState(['', '', '', '', '', ''])
  const [phoneOtpDigits, setPhoneOtpDigits] = useState(['', '', '', '', '', ''])
  const [twoFaOtpDigits, setTwoFaOtpDigits] = useState(['', '', '', '', '', ''])
  const [resetOtpDigits, setResetOtpDigits] = useState(['', '', '', '', '', ''])

  // Forgot / Reset Password Inputs
  const [resetChannel, setResetChannel] = useState<'email' | 'phone'>('email')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotPhone, setForgotPhone] = useState('')
  const [forgotPhoneCountryCode, setForgotPhoneCountryCode] = useState('+91')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Timers (start at 0 so user can immediately click Send OTP)
  const [emailResendTimer, setEmailResendTimer] = useState(0)
  const [phoneResendTimer, setPhoneResendTimer] = useState(0)
  const [twoFaResendTimer, setTwoFaResendTimer] = useState(60)
  const [resetResendTimer, setResetResendTimer] = useState(60)

  // WhatsApp & Dev OTP Helpers
  const [phoneWhatsappUri, setPhoneWhatsappUri] = useState<string | null>(null)
  const [phoneDevOtp, setPhoneDevOtp] = useState<string | null>(null)

  useEffect(() => {
    let t: any
    if (emailResendTimer > 0) t = setTimeout(() => setEmailResendTimer((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [emailResendTimer])

  useEffect(() => {
    let t: any
    if (phoneResendTimer > 0) t = setTimeout(() => setPhoneResendTimer((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phoneResendTimer])

  useEffect(() => {
    let t: any
    if (twoFaResendTimer > 0) t = setTimeout(() => setTwoFaResendTimer((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [twoFaResendTimer])

  useEffect(() => {
    let t: any
    if (resetResendTimer > 0) t = setTimeout(() => setResetResendTimer((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resetResendTimer])

  if (!isOpen) return null

  // Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[a-z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) score++
    return score
  }

  const passStrengthScore = getPasswordStrength(regPassword)
  const newPassStrengthScore = getPasswordStrength(newPassword)

  // OTP Box Change Handler with Auto-Focus
  const handleOtpBoxChange = (
    index: number,
    val: string,
    prefix: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (val.length > 1) {
      const digits = val.replace(/[^0-9]/g, '').slice(0, 6).split('')
      setter((prev) => {
        const next = [...prev]
        digits.forEach((d, i) => {
          if (i < 6) next[i] = d
        })
        return next
      })
      const lastIdx = Math.min(5, digits.length - 1)
      const el = document.getElementById(`${prefix}-${lastIdx}`)
      if (el) el.focus()
      return
    }

    const digit = val.replace(/[^0-9]/g, '')
    setter((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })

    if (digit && index < 5) {
      const nextEl = document.getElementById(`${prefix}-${index + 1}`)
      if (nextEl) nextEl.focus()
    }
  }

  // 1. Submit Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (regName.trim().length < 2) {
      setError('Full Name must be at least 2 characters long.')
      return
    }
    if (!regEmail.toLowerCase().trim().endsWith('@gmail.com')) {
      setError('Only Google Gmail addresses (@gmail.com) are accepted for verified accounts.')
      return
    }
    if (regPhone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.')
      return
    }
    if (passStrengthScore < 5) {
      setError('Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.')
      return
    }

    setLoading(true)
    try {
      const fullPhone = `${countryCode} ${regPhone.trim()}`
      setVerifyPhoneNum(regPhone.trim())
      setVerifyPhoneCountryCode(countryCode)
      setVerifyEmailAddr(regEmail.toLowerCase().trim())

      await register({
        name: regName.trim(),
        email: regEmail.toLowerCase().trim(),
        phone: fullPhone,
        password: regPassword,
        role: regRole,
      })
      setEmailResendTimer(60)
      setPhoneResendTimer(60)
      setView('verify_email')
      setSuccessMsg(`Verification email with 6-digit code sent to ${regEmail}. Please check your Gmail.`)
    } catch (err: any) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Submit Email OTP Verification
  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otp = emailOtpDigits.join('')
    if (otp.length < 6) {
      setError('Please enter all 6 digits of the email verification code.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const targetEmail = verifyEmailAddr || pendingInfo?.email || ''
      const res = await verifyEmailOtp(otp, targetEmail)
      setSuccessMsg(res.message)
      if (res.phoneVerified) {
        setView('login')
        setLoginEmail(targetEmail)
      } else {
        setView('verify_phone')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email verification code.')
    } finally {
      setLoading(false)
    }
  }

  // 3. Send/Resend Email OTP
  const handleSendEmailOtp = async () => {
    if (emailResendTimer > 0 || loading) return
    setError(null)
    setSuccessMsg(null)
    const targetEmail = verifyEmailAddr || pendingInfo?.email || ''
    if (!targetEmail || !targetEmail.endsWith('@gmail.com')) {
      setError('Please enter a valid Gmail address (@gmail.com).')
      return
    }
    setLoading(true)
    try {
      await api.auth.resendEmailOtp({
        email: targetEmail,
        userId: pendingInfo?.userId,
      })
      setEmailResendTimer(60)
      setSuccessMsg(`A new 6-digit verification code has been dispatched to ${targetEmail}.`)
      const firstInput = document.getElementById('email-otp-0')
      if (firstInput) firstInput.focus()
    } catch (err: any) {
      setError(err.message || 'Failed to send email code.')
    } finally {
      setLoading(false)
    }
  }

  // 4. Send Mobile Phone OTP
  const handleSendPhoneOtp = async () => {
    if (phoneResendTimer > 0 || loading) return
    setError(null)
    setSuccessMsg(null)
    const num = verifyPhoneNum.trim() || (pendingInfo?.phone ? pendingInfo.phone.replace(/[^0-9]/g, '').slice(-10) : '')
    if (!num || num.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number.')
      return
    }
    const fullPhone = `${verifyPhoneCountryCode} ${num}`
    setLoading(true)
    try {
      const res = await api.auth.sendPhoneOtp({
        phone: fullPhone,
        userId: pendingInfo?.userId,
      })
      if (res.whatsappUri) setPhoneWhatsappUri(res.whatsappUri)
      if (res.devOtp) setPhoneDevOtp(res.devOtp)
      setPhoneResendTimer(60)
      setSuccessMsg(`6-digit OTP code dispatched to ${fullPhone}. Please check your phone messages.`)
      const firstInput = document.getElementById('phone-otp-0')
      if (firstInput) firstInput.focus()
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch phone OTP.')
    } finally {
      setLoading(false)
    }
  }

  // 5. Submit Phone OTP Verification
  const handleVerifyPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otp = phoneOtpDigits.join('')
    if (otp.length < 6) {
      setError('Please enter all 6 digits of the mobile verification code.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const fullPhone = verifyPhoneNum ? `${verifyPhoneCountryCode} ${verifyPhoneNum.trim()}` : pendingInfo?.phone
      const res = await api.auth.verifyPhoneOtp({
        phone: fullPhone,
        userId: pendingInfo?.userId,
        otp,
      })
      setSuccessMsg(res.message)
      if (res.accountStatus === 'active') {
        setView('login')
        setLoginEmail(pendingInfo?.email || verifyEmailAddr || '')
      } else if (!res.emailVerified) {
        setView('verify_email')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid phone verification code.')
    } finally {
      setLoading(false)
    }
  }

  // 6. Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)
    try {
      const res = await login(loginEmail.toLowerCase().trim(), loginPassword)

      if (res.requires2FA) {
        setView('verify_2fa')
        setTwoFaResendTimer(60)
        setSuccessMsg('Two-factor verification code dispatched to your verified email.')
        return
      }

      if (res.token && res.user) {
        onSuccess?.()
        onClose()
      }
    } catch (err: any) {
      if (err.message && err.message.includes('verification incomplete')) {
        setError(err.message)
        if (err.emailVerified === false) {
          setPendingStep('PENDING_EMAIL_VERIFICATION', { email: loginEmail })
          setView('verify_email')
        } else if (err.phoneVerified === false) {
          setPendingStep('PENDING_PHONE_VERIFICATION', { email: loginEmail, phone: err.phone })
          setView('verify_phone')
        }
      } else {
        setError(err.message || 'Invalid email address or password.')
      }
    } finally {
      setLoading(false)
    }
  }

  // 7. Submit 2FA Login OTP
  const handleVerify2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otp = twoFaOtpDigits.join('')
    if (otp.length < 6) {
      setError('Please enter the 6-digit Two-Factor code.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await verifyLogin2FA(otp)
      if (res.token && res.user) {
        onSuccess?.()
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Invalid 2FA code.')
    } finally {
      setLoading(false)
    }
  }

  // 8. Google OAuth Success Handler
  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      setError('No credential received from Google.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await googleLogin(credentialResponse.credential)
      if (res.phoneVerificationRequired) {
        setView('verify_phone')
        setSuccessMsg('Google identity verified! Please verify your mobile phone to complete activation.')
        return
      }

      if (res.token && res.user) {
        onSuccess?.()
        onClose()
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  // 9. Send Password Reset Code (Supports Gmail and Mobile Phone)
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (resetChannel === 'email') {
      if (!forgotEmail || !forgotEmail.endsWith('@gmail.com')) {
        setError('Please enter a valid Gmail address (@gmail.com).')
        return
      }
    } else {
      if (!forgotPhone || forgotPhone.trim().length < 10) {
        setError('Please enter a valid 10-digit mobile phone number.')
        return
      }
    }

    setLoading(true)
    try {
      const payload =
        resetChannel === 'email'
          ? { email: forgotEmail.toLowerCase().trim() }
          : { phone: `${forgotPhoneCountryCode} ${forgotPhone.trim()}` }

      const res = await api.auth.forgotPassword(payload)
      setResetResendTimer(60)
      setView('reset_password')
      setSuccessMsg(
        resetChannel === 'email'
          ? `6-digit password reset code sent to ${forgotEmail}. Please check your Gmail.`
          : `6-digit password reset OTP sent to ${forgotPhoneCountryCode} ${forgotPhone}. Please check your phone.`
      )
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch password reset code.')
    } finally {
      setLoading(false)
    }
  }

  // 10. Submit New Password with 6-Digit Reset OTP (Supports Gmail and Mobile Phone)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otp = resetOtpDigits.join('')
    if (otp.length < 6) {
      setError('Please enter all 6 digits of the password reset code.')
      return
    }
    if (newPassStrengthScore < 5) {
      setError('New password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const payload = {
        ...(resetChannel === 'email'
          ? { email: forgotEmail.toLowerCase().trim() }
          : { phone: `${forgotPhoneCountryCode} ${forgotPhone.trim()}` }),
        otp,
        newPassword,
      }

      const res = await api.auth.resetPassword(payload)
      setSuccessMsg(res.message || 'Password updated successfully! You can now log in.')
      setTimeout(() => {
        setView('login')
        if (resetChannel === 'email') setLoginEmail(forgotEmail)
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#E4E7E5] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0F6E5C] via-[#0A4E42] to-[#141B18] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-sm font-bold">
              🛡️
            </div>
            <div>
              <h3 className="font-800 text-base" style={{ fontFamily: 'Fraunces, serif' }}>
                {view === 'register' && 'Create Verified Account'}
                {view === 'verify_email' && 'Verify Your Gmail Address'}
                {view === 'verify_phone' && 'Verify Your Mobile Number'}
                {view === 'login' && 'Secure Account Login'}
                {view === 'verify_2fa' && 'Two-Factor Authentication'}
                {view === 'forgot_password' && 'Reset Your Password'}
                {view === 'reset_password' && 'Enter 6-Digit Code & New Password'}
              </h3>
              <p className="text-[10px] text-white/80 font-medium">
                Production-Grade Cryptographic Auth · YatraSetu Ecosystem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts Banner */}
        <div className="px-6 pt-4 space-y-2 flex-shrink-0">
          {error && (
            <div className="p-3 rounded-xl bg-[#FDE8E8] text-[#9B1C1C] text-xs font-700 flex items-start gap-2 border border-[#D64545]/20 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-[#E4F7EC] text-[#0F5A31] text-xs font-700 flex items-start gap-2 border border-[#1E9E5A]/20 animate-in fade-in">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{successMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* ========================================================================= */}
          {/* VIEW: REGISTER                                                            */}
          {/* ========================================================================= */}
          {view === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#7B8582] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-600 focus:outline-none focus:border-[#0F6E5C]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-700 text-[#141B18] uppercase tracking-wider">
                    Email Address (Gmail) *
                  </label>
                  <span className="text-[10px] text-[#0F6E5C] font-800">Gmail only (@gmail.com)</span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7B8582] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-600 focus:outline-none focus:border-[#0F6E5C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                  Mobile Phone Number *
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-28 px-2 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-700 text-xs"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Smartphone className="w-4 h-4 text-[#7B8582] absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="98765 12345"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-700 tracking-wider focus:outline-none focus:border-[#0F6E5C]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7B8582] absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-600 focus:outline-none focus:border-[#0F6E5C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#7B8582] hover:text-[#141B18] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {regPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-700">
                      <span className="text-[#505D58]">Password Strength:</span>
                      <span
                        className={
                          passStrengthScore >= 5
                            ? 'text-[#1E9E5A]'
                            : passStrengthScore >= 4
                            ? 'text-[#0F6E5C]'
                            : passStrengthScore >= 3
                            ? 'text-[#D89A1C]'
                            : 'text-[#D64545]'
                        }
                      >
                        {passStrengthScore >= 5 ? 'Excellent (Secure)' : passStrengthScore >= 3 ? 'Moderate' : 'Too Weak'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E4E7E5] rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-full flex-1 rounded-full transition-all ${
                            passStrengthScore >= i
                              ? passStrengthScore >= 5
                                ? 'bg-[#1E9E5A]'
                                : passStrengthScore >= 3
                                ? 'bg-[#D89A1C]'
                                : 'bg-[#D64545]'
                              : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1.5">
                  Registering As *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      regRole === 'user'
                        ? 'border-[#0F6E5C] bg-[#E4F3EF] shadow-2xs'
                        : 'border-[#E4E7E5] bg-[#F7F6F2] hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="regRole"
                      checked={regRole === 'user'}
                      onChange={() => setRegRole('user')}
                      className="hidden"
                    />
                    <span className="text-lg block">👤</span>
                    <span className="font-800 text-[11px] text-[#141B18] block mt-0.5">Tourist</span>
                    <span className="text-[9px] text-[#7B8582]">Traveler</span>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      regRole === 'local'
                        ? 'border-[#0F6E5C] bg-[#E4F3EF] shadow-2xs'
                        : 'border-[#E4E7E5] bg-[#F7F6F2] hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="regRole"
                      checked={regRole === 'local'}
                      onChange={() => setRegRole('local')}
                      className="hidden"
                    />
                    <span className="text-lg block">🏡</span>
                    <span className="font-800 text-[11px] text-[#141B18] block mt-0.5">Local Host</span>
                    <span className="text-[9px] text-[#7B8582]">Guide / SHG</span>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      regRole === 'authority'
                        ? 'border-[#0F6E5C] bg-[#E4F3EF] shadow-2xs'
                        : 'border-[#E4E7E5] bg-[#F7F6F2] hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="regRole"
                      checked={regRole === 'authority'}
                      onChange={() => setRegRole('authority')}
                      className="hidden"
                    />
                    <span className="text-lg block">🛡️</span>
                    <span className="font-800 text-[11px] text-[#141B18] block mt-0.5">Civic Authority</span>
                    <span className="text-[9px] text-[#7B8582]">Municipal</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#0F6E5C] hover:bg-[#0A4E42] text-white font-800 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Create Account & Send Verification Codes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[#505D58] text-[11px]">
                  <span>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setError(null)
                        setSuccessMsg(null)
                        setView('login')
                      }}
                      className="text-[#0F6E5C] font-800 hover:underline cursor-pointer"
                    >
                      Login
                    </button>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setError(null)
                      setSuccessMsg(null)
                      setView('verify_phone')
                    }}
                    className="text-[#0F6E5C] font-800 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Verify Mobile</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* VIEW: VERIFY GMAIL OTP                                                    */}
          {/* ========================================================================= */}
          {view === 'verify_email' && (
            <form onSubmit={handleVerifyEmailSubmit} className="space-y-4 text-xs">
              <div className="space-y-1 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#E4F3EF] text-[#0F6E5C] flex items-center justify-center text-xl mx-auto">
                  ✉️
                </div>
                <h4 className="font-800 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Verify Your Gmail Address
                </h4>
                <p className="text-[#505D58]">
                  We've sent a 6-digit verification code to <strong>{verifyEmailAddr || pendingInfo?.email || 'your Gmail address'}</strong>.
                </p>
              </div>

              {/* Email Address & Send Code Button */}
              <div>
                <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                  Gmail Address
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-[#7B8582] absolute left-3 top-3" />
                    <input
                      type="email"
                      value={verifyEmailAddr || pendingInfo?.email || ''}
                      onChange={(e) => setVerifyEmailAddr(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-600 focus:outline-none focus:border-[#0F6E5C]"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={emailResendTimer > 0 || loading}
                    onClick={handleSendEmailOtp}
                    className="px-4 py-2.5 rounded-xl bg-[#0F6E5C] hover:bg-[#0A4E42] text-white font-800 text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50 whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{emailResendTimer > 0 ? `Sent (${emailResendTimer}s)` : 'Send Code'}</span>
                  </button>
                </div>
              </div>

              {/* 6 Digit OTP Boxes */}
              <div className="py-2">
                <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex justify-center gap-2">
                  {emailOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`email-otp-${idx}`}
                      type="text"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpBoxChange(idx, e.target.value, 'email-otp', setEmailOtpDigits)}
                      className="w-11 h-12 rounded-xl border-2 border-[#0F6E5C] text-center text-lg font-900 bg-[#F7F6F2] text-[#141B18] focus:bg-white focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView('verify_phone')}
                  className="px-4 py-3 rounded-xl border border-[#E4E7E5] hover:bg-[#F7F6F2] text-[#505D58] font-700 text-xs cursor-pointer"
                >
                  Switch to Mobile
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-[#0F6E5C] hover:bg-[#0A4E42] text-white font-800 text-xs transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Gmail'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* VIEW: VERIFY PHONE OTP (WITH PROMINENT SEND OTP BUTTON)                   */}
          {/* ========================================================================= */}
          {view === 'verify_phone' && (
            <form onSubmit={handleVerifyPhoneSubmit} className="space-y-4 text-xs">
              <div className="space-y-1 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#E4F3EF] text-[#0F6E5C] flex items-center justify-center text-xl mx-auto">
                  📱
                </div>
                <h4 className="font-800 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Verify Your Mobile Number
                </h4>
                <p className="text-[#505D58]">
                  Enter your mobile number and click <strong>"Send OTP"</strong> to receive your 6-digit code.
                </p>
              </div>

              {/* Mobile Phone Number Input + Prominent SEND OTP Button */}
              <div>
                <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                  Mobile Phone Number *
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex gap-2 flex-1">
                    <select
                      value={verifyPhoneCountryCode}
                      onChange={(e) => setVerifyPhoneCountryCode(e.target.value)}
                      className="w-24 px-2 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-700 text-xs"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <Smartphone className="w-4 h-4 text-[#7B8582] absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={verifyPhoneNum}
                        onChange={(e) => setVerifyPhoneNum(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder={pendingInfo?.phone ? pendingInfo.phone.replace(/[^0-9]/g, '').slice(-10) : '8459963052'}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-700 tracking-wider focus:outline-none focus:border-[#0F6E5C]"
                      />
                    </div>
                  </div>

                  {/* PROMINENT "SEND OTP" BUTTON */}
                  <button
                    type="button"
                    disabled={phoneResendTimer > 0 || loading}
                    onClick={handleSendPhoneOtp}
                    className="px-5 py-2.5 rounded-xl bg-[#0F6E5C] hover:bg-[#0A4E42] text-white font-800 text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{phoneResendTimer > 0 ? `Sent (${phoneResendTimer}s)` : 'Send OTP'}</span>
                  </button>
                </div>
              </div>

              {/* 6 Digit OTP Boxes */}
              <div className="py-2">
                <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit SMS Verification Code
                </label>
                <div className="flex justify-center gap-2">
                  {phoneOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`phone-otp-${idx}`}
                      type="text"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpBoxChange(idx, e.target.value, 'phone-otp', setPhoneOtpDigits)}
                      className="w-11 h-12 rounded-xl border-2 border-[#0F6E5C] text-center text-lg font-900 bg-[#F7F6F2] text-[#141B18] focus:bg-white focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#7B8582]">
                <span>Code valid for 5 minutes</span>
                <button
                  type="button"
                  disabled={phoneResendTimer > 0 || loading}
                  onClick={handleSendPhoneOtp}
                  className="text-[#0F6E5C] font-800 hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {phoneResendTimer > 0 ? `Resend OTP in ${phoneResendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="px-4 py-3 rounded-xl border border-[#E4E7E5] hover:bg-[#F7F6F2] text-[#505D58] font-700 text-xs cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-[#0F6E5C] hover:bg-[#0A4E42] text-white font-800 text-xs transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify Mobile Phone'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* VIEW: LOGIN                                                               */}
          {/* ========================================================================= */}
          {view === 'login' && (
            <div className="space-y-4 text-xs">
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                    Gmail Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#7B8582] absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-600 focus:outline-none focus:border-[#0F6E5C]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-700 text-[#141B18] uppercase tracking-wider">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null)
                        setSuccessMsg(null)
                        setForgotEmail(loginEmail)
                        setView('forgot_password')
                      }}
                      className="text-[10px] text-[#0F6E5C] font-800 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#7B8582] absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-600 focus:outline-none focus:border-[#0F6E5C]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#7B8582] hover:text-[#141B18] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#0F6E5C] hover:bg-[#0A4E42] text-white font-800 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Login to Account'}
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#E4E7E5]"></div>
                <span className="flex-shrink mx-3 text-[#7B8582] text-[10px] uppercase font-bold">or continue with</span>
                <div className="flex-grow border-t border-[#E4E7E5]"></div>
              </div>

              {/* Official Google OAuth Sign-In Component */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign-In was cancelled or failed.')}
                  useOneTap={false}
                  shape="pill"
                  size="large"
                  text="continue_with"
                />
              </div>

              <div className="flex items-center justify-between text-[#505D58] text-[11px] pt-1">
                <span>
                  New here?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null)
                      setSuccessMsg(null)
                      setView('register')
                    }}
                    className="text-[#0F6E5C] font-800 hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setSuccessMsg(null)
                    setView('verify_phone')
                  }}
                  className="text-[#0F6E5C] font-800 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Verify Mobile</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: TWO-FACTOR AUTHENTICATION (LOGIN 2FA)                                */}
          {/* ========================================================================= */}
          {view === 'verify_2fa' && (
            <form onSubmit={handleVerify2FASubmit} className="space-y-4 text-xs">
              <div className="space-y-1 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#E4F3EF] text-[#0F6E5C] flex items-center justify-center text-xl mx-auto">
                  🔐
                </div>
                <h4 className="font-800 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Two-Factor Authentication
                </h4>
                <p className="text-[#505D58]">
                  Enter the 6-digit login verification code sent to {pendingInfo?.maskedEmail || pendingInfo?.email}.
                </p>
              </div>

              {/* 6 Digit OTP Boxes */}
              <div className="py-2">
                <div className="flex justify-center gap-2">
                  {twoFaOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`twofa-otp-${idx}`}
                      type="text"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpBoxChange(idx, e.target.value, 'twofa-otp', setTwoFaOtpDigits)}
                      className="w-11 h-12 rounded-xl border-2 border-[#0F6E5C] text-center text-lg font-900 bg-[#F7F6F2] text-[#141B18] focus:bg-white focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#7B8582]">
                <span>Code valid for 5 minutes</span>
                <button
                  type="button"
                  disabled={twoFaResendTimer > 0}
                  onClick={() => {
                    setTwoFaResendTimer(60)
                    setSuccessMsg('2FA code resent to your verified email.')
                  }}
                  className="text-[#0F6E5C] font-800 hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {twoFaResendTimer > 0 ? `Resend Code in ${twoFaResendTimer}s` : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#0F6E5C] hover:bg-[#0A4E42] text-white font-800 text-xs transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loading ? 'Verifying 2FA...' : 'Verify & Enter Dashboard'}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* VIEW: FORGOT PASSWORD (STEP 1: SELECT CHANNEL & ENTER GMAIL / PHONE)      */}
          {/* ========================================================================= */}
          {view === 'forgot_password' && (
            <form onSubmit={handleSendResetCode} className="space-y-4 text-xs">
              <div className="space-y-1">
                <h4 className="font-800 text-sm text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Reset Your Password
                </h4>
                <p className="text-[#505D58]">
                  Select how you would like to receive your 6-digit password reset code:
                </p>
              </div>

              {/* Channel Selector: Gmail or Mobile Phone */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setResetChannel('email')}
                  className={`p-2.5 rounded-xl border font-700 text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    resetChannel === 'email'
                      ? 'border-[#0F6E5C] bg-[#E4F3EF] text-[#0F6E5C] shadow-2xs font-800'
                      : 'border-[#E4E7E5] bg-[#F7F6F2] text-[#505D58] hover:bg-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Via Gmail Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setResetChannel('phone')}
                  className={`p-2.5 rounded-xl border font-700 text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    resetChannel === 'phone'
                      ? 'border-[#0F6E5C] bg-[#E4F3EF] text-[#0F6E5C] shadow-2xs font-800'
                      : 'border-[#E4E7E5] bg-[#F7F6F2] text-[#505D58] hover:bg-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Via Mobile OTP</span>
                </button>
              </div>

              {resetChannel === 'email' ? (
                <div>
                  <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                    Registered Gmail Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#7B8582] absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-600 focus:outline-none focus:border-[#0F6E5C]"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                    Registered Mobile Number *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={forgotPhoneCountryCode}
                      onChange={(e) => setForgotPhoneCountryCode(e.target.value)}
                      className="w-28 px-2 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-700 text-xs"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <Smartphone className="w-4 h-4 text-[#7B8582] absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="8459963052"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-700 tracking-wider focus:outline-none focus:border-[#0F6E5C]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setSuccessMsg(null)
                    setView('login')
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#E4E7E5] text-[#505D58] font-700 hover:bg-[#F7F6F2] cursor-pointer"
                >
                  Back to Login
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#0F6E5C] hover:bg-[#0A4E42] text-white font-800 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* VIEW: RESET PASSWORD (STEP 2: ENTER OTP & NEW PASSWORD)                   */}
          {/* ========================================================================= */}
          {view === 'reset_password' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              <div className="space-y-1 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#E4F3EF] text-[#0F6E5C] flex items-center justify-center text-xl mx-auto">
                  🔑
                </div>
                <h4 className="font-800 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  Create New Password
                </h4>
                <p className="text-[#505D58]">
                  Enter the 6-digit code sent to{' '}
                  <strong>
                    {resetChannel === 'email' ? forgotEmail : `${forgotPhoneCountryCode} ${forgotPhone}`}
                  </strong>{' '}
                  and your new password.
                </p>
              </div>

              {/* 6 Digit OTP Boxes for Password Reset */}
              <div>
                <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-2 text-center">
                  6-Digit Reset Code ({resetChannel === 'email' ? 'from Gmail' : 'from Mobile SMS'}) *
                </label>
                <div className="flex justify-center gap-2">
                  {resetOtpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`reset-otp-${idx}`}
                      type="text"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpBoxChange(idx, e.target.value, 'reset-otp', setResetOtpDigits)}
                      className="w-11 h-12 rounded-xl border-2 border-[#0F6E5C] text-center text-lg font-900 bg-[#F7F6F2] text-[#141B18] focus:bg-white focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7B8582] absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-600 focus:outline-none focus:border-[#0F6E5C]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#7B8582] hover:text-[#141B18] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-700">
                      <span className="text-[#505D58]">Password Strength:</span>
                      <span
                        className={
                          newPassStrengthScore >= 5
                            ? 'text-[#1E9E5A]'
                            : newPassStrengthScore >= 4
                            ? 'text-[#0F6E5C]'
                            : newPassStrengthScore >= 3
                            ? 'text-[#D89A1C]'
                            : 'text-[#D64545]'
                        }
                      >
                        {newPassStrengthScore >= 5 ? 'Excellent (Secure)' : newPassStrengthScore >= 3 ? 'Moderate' : 'Too Weak'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E4E7E5] rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-full flex-1 rounded-full transition-all ${
                            newPassStrengthScore >= i
                              ? newPassStrengthScore >= 5
                                ? 'bg-[#1E9E5A]'
                                : newPassStrengthScore >= 3
                                ? 'bg-[#D89A1C]'
                                : 'bg-[#D64545]'
                              : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block font-700 text-[#141B18] uppercase tracking-wider mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7B8582] absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D0D7D4] bg-[#F7F6F2] font-600 focus:outline-none focus:border-[#0F6E5C]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#7B8582]">
                <span>Code valid for 5 minutes</span>
                <button
                  type="button"
                  disabled={resetResendTimer > 0 || loading}
                  onClick={handleSendResetCode}
                  className="text-[#0F6E5C] font-800 hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {resetResendTimer > 0 ? `Resend Code in ${resetResendTimer}s` : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#0F6E5C] hover:bg-[#0A4E42] text-white font-800 text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Update Password & Return to Login'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
