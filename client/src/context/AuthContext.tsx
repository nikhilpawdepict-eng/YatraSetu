import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, setAuthToken, getAuthToken } from '../services/api'

export type AuthState =
  | 'AUTHENTICATING'
  | 'UNAUTHENTICATED'
  | 'PENDING_EMAIL_VERIFICATION'
  | 'PENDING_PHONE_VERIFICATION'
  | 'PENDING_2FA'
  | 'AUTHENTICATED'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'user' | 'local' | 'authority' | 'admin'
  avatar: string
  phone?: string
  location?: string
  speciality?: string
  points: number
  emailVerified: boolean
  phoneVerified: boolean
  accountStatus: 'pending_verification' | 'active' | 'suspended'
}

interface PendingAuthInfo {
  userId?: string
  email: string
  phone?: string
  maskedEmail?: string
  maskedPhone?: string
  role?: string
}

interface AuthContextType {
  authState: AuthState
  user: UserProfile | null
  pendingInfo: PendingAuthInfo | null
  login: (email: string, password: string) => Promise<any>
  verifyLogin2FA: (otp: string) => Promise<any>
  register: (data: { name: string; email: string; phone?: string; password: string; role?: string }) => Promise<any>
  verifyEmailOtp: (otp: string) => Promise<any>
  resendEmailOtp: () => Promise<any>
  verifyPhoneOtp: (otp: string) => Promise<any>
  resendPhoneOtp: () => Promise<any>
  googleLogin: (credential: string) => Promise<any>
  logout: () => Promise<void>
  setPendingStep: (state: AuthState, info?: Partial<PendingAuthInfo>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>('AUTHENTICATING')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [pendingInfo, setPendingInfo] = useState<PendingAuthInfo | null>(null)

  // Verify session on startup (GET /auth/me)
  useEffect(() => {
    async function verifyInitialSession() {
      const storedToken = getAuthToken()
      if (!storedToken) {
        setAuthState('UNAUTHENTICATED')
        setUser(null)
        return
      }

      try {
        const res = await api.auth.getCurrentUser()
        if (res && res.user && res.user.accountStatus === 'active') {
          setUser(res.user)
          setAuthState('AUTHENTICATED')
        } else if (res && res.user && !res.user.emailVerified) {
          setUser(res.user)
          setPendingInfo({ userId: res.user.id, email: res.user.email, phone: res.user.phone })
          setAuthState('PENDING_EMAIL_VERIFICATION')
        } else if (res && res.user && !res.user.phoneVerified) {
          setUser(res.user)
          setPendingInfo({ userId: res.user.id, email: res.user.email, phone: res.user.phone })
          setAuthState('PENDING_PHONE_VERIFICATION')
        } else {
          setAuthToken(null)
          setUser(null)
          setAuthState('UNAUTHENTICATED')
        }
      } catch (err) {
        console.warn('[AuthContext] Session expired or invalid, setting unauthenticated.')
        setAuthToken(null)
        setUser(null)
        setAuthState('UNAUTHENTICATED')
      }
    }

    verifyInitialSession()
  }, [])

  // 1. Login
  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password })

    if (res.requires2FA) {
      setPendingInfo({
        userId: res.userId,
        email,
        maskedEmail: res.emailMasked,
        maskedPhone: res.phoneMasked,
      })
      setAuthState('PENDING_2FA')
      return res
    }

    if (res.token && res.user) {
      setUser(res.user)
      setAuthState('AUTHENTICATED')
      return res
    }

    return res
  }

  // 2. Verify 2FA Login OTP
  const verifyLogin2FA = async (otp: string) => {
    if (!pendingInfo?.userId) throw new Error('Session state invalid. Please try logging in again.')
    const res = await api.auth.verifyLoginOtp({
      userId: pendingInfo.userId,
      otp,
    })

    if (res.token && res.user) {
      setUser(res.user)
      setPendingInfo(null)
      setAuthState('AUTHENTICATED')
      return res
    }
    return res
  }

  // 3. Register
  const register = async (data: { name: string; email: string; phone?: string; password: string; role?: string }) => {
    const res = await api.auth.register(data)
    setPendingInfo(null)
    setAuthState('UNAUTHENTICATED')
    return res
  }

  // 4. Verify Email OTP
  const verifyEmailOtp = async (otp: string, emailOverride?: string) => {
    const targetEmail = emailOverride || pendingInfo?.email
    if (!targetEmail && !pendingInfo?.userId) throw new Error('Please enter your Gmail address.')
    const res = await api.auth.verifyEmailOtp({
      email: targetEmail,
      userId: pendingInfo?.userId,
      otp,
    })

    if (res.phoneVerified) {
      // Both verified!
      setAuthState('UNAUTHENTICATED') // Ready for login
      return res
    } else {
      // Proceed to Phone verification
      setAuthState('PENDING_PHONE_VERIFICATION')
      return res
    }
  }

  // 5. Resend Email OTP
  const resendEmailOtp = async (emailOverride?: string) => {
    const targetEmail = emailOverride || pendingInfo?.email
    if (!targetEmail && !pendingInfo?.userId) throw new Error('Please enter your Gmail address.')
    return api.auth.resendEmailOtp({
      email: targetEmail,
      userId: pendingInfo?.userId,
    })
  }

  // 6. Verify Phone OTP
  const verifyPhoneOtp = async (otp: string, phoneOverride?: string) => {
    const targetPhone = phoneOverride || pendingInfo?.phone
    if (!targetPhone && !pendingInfo?.userId) throw new Error('Please enter your mobile phone number.')
    const res = await api.auth.verifyPhoneOtp({
      phone: targetPhone,
      userId: pendingInfo?.userId,
      otp,
    })

    if (res.emailVerified || res.accountStatus === 'active') {
      setAuthState('UNAUTHENTICATED') // Ready for login
      return res
    } else {
      setAuthState('PENDING_EMAIL_VERIFICATION')
      return res
    }
  }

  // 7. Resend Phone OTP
  const resendPhoneOtp = async (phoneOverride?: string) => {
    const targetPhone = phoneOverride || pendingInfo?.phone
    if (!targetPhone && !pendingInfo?.userId) throw new Error('Please enter your mobile phone number.')
    return api.auth.resendPhoneOtp({
      phone: targetPhone,
      userId: pendingInfo?.userId,
    })
  }

  // 8. Google OAuth
  const googleLogin = async (credential: string) => {
    const res = await api.auth.googleAuth(credential)

    if (res.phoneVerificationRequired) {
      setPendingInfo({
        userId: res.userId,
        email: res.email,
        phone: res.phone,
        role: res.role,
      })
      setAuthState('PENDING_PHONE_VERIFICATION')
      return res
    }

    if (res.token && res.user) {
      setUser(res.user)
      setAuthState('AUTHENTICATED')
      return res
    }

    return res
  }

  // 9. Logout
  const logout = async () => {
    try {
      await api.auth.logout()
    } catch (_) {}
    setAuthToken(null)
    setUser(null)
    setPendingInfo(null)
    setAuthState('UNAUTHENTICATED')
  }

  const setPendingStep = (state: AuthState, info?: Partial<PendingAuthInfo>) => {
    if (info) {
      setPendingInfo((prev) => ({ ...prev, email: info.email || prev?.email || '', ...info }))
    }
    setAuthState(state)
  }

  return (
    <AuthContext.Provider
      value={{
        authState,
        user,
        pendingInfo,
        login,
        verifyLogin2FA,
        register,
        verifyEmailOtp,
        resendEmailOtp,
        verifyPhoneOtp,
        resendPhoneOtp,
        googleLogin,
        logout,
        setPendingStep,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
