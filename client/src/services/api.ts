// TravelBoost / YatraSetu API Client Service

import type {
  UserSession,
  UserRole,
  CleanlinessReport,
  BookingRequest,
  HomestayListing,
  GuideListing,
  ProductListing,
  CrowdSpot,
  EmergencyAlert,
  EmergencyService,
} from '../data/mockStore'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const TOKEN_STORAGE_KEY = 'yatrasetu_jwt_token'

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  } catch (e) {
    console.warn('Failed to persist auth token', e)
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errMsg = `API error: ${response.status} ${response.statusText}`
    try {
      const errJson = await response.json()
      if (errJson.error) errMsg = errJson.error
    } catch {
      // Use fallback error message
    }
    throw new Error(errMsg)
  }

  return response.json()
}

export const api = {
  // Authentication
  auth: {
    async register(data: {
      name: string
      email: string
      phone: string
      password: string
      role?: string
    }): Promise<{
      success: boolean
      userId: string
      email: string
      phone: string
      role: string
      accountStatus: string
      emailVerified: boolean
      phoneVerified: boolean
      message: string
    }> {
      return request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async verifyEmailOtp(data: { email?: string; otp: string; userId?: string }): Promise<{
      success: boolean
      emailVerified: boolean
      phoneVerified: boolean
      accountStatus: string
      message: string
    }> {
      return request('/auth/verify-email-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async resendEmailOtp(data: { email?: string; userId?: string }): Promise<{
      success: boolean
      message: string
      expiresInSeconds: number
    }> {
      return request('/auth/resend-email-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async sendPhoneOtp(data: { phone?: string; userId?: string }): Promise<{
      success: boolean
      message: string
      whatsappUri?: string
      devOtp?: string
      expiresInSeconds: number
    }> {
      return request('/auth/resend-phone-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async resendPhoneOtp(data: { phone?: string; userId?: string }): Promise<{
      success: boolean
      message: string
      whatsappUri?: string
      devOtp?: string
      expiresInSeconds: number
    }> {
      return request('/auth/resend-phone-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async verifyPhoneOtp(data: { phone?: string; otp: string; userId?: string }): Promise<{
      success: boolean
      phoneVerified: boolean
      emailVerified?: boolean
      accountStatus?: string
      message: string
    }> {
      return request('/auth/verify-phone-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async login(data: { email: string; password?: string }): Promise<{
      token?: string
      user?: any
      requires2FA?: boolean
      userId?: string
      emailMasked?: string
      phoneMasked?: string
      message?: string
    }> {
      const res = await request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (res.token) setAuthToken(res.token)
      return res
    },

    async verifyLoginOtp(data: { userId: string; otp: string }): Promise<{
      success: boolean
      token: string
      user: any
      message: string
    }> {
      const res = await request<any>('/auth/verify-login-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (res.token) setAuthToken(res.token)
      return res
    },

    async googleAuth(credential: string, role: string = 'user'): Promise<{
      success?: boolean
      token?: string
      user?: any
      phoneVerificationRequired?: boolean
      userId?: string
      email?: string
      name?: string
      role?: string
      message?: string
    }> {
      const res = await request<any>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential, role }),
      })
      if (res.token) setAuthToken(res.token)
      return res
    },

    async forgotPassword(data: { email?: string; phone?: string } | string): Promise<{
      success: boolean
      message: string
      channel?: string
      target?: string
      expiresInSeconds?: number
    }> {
      const payload = typeof data === 'string' ? { email: data } : data
      return request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },

    async resetPassword(data: { email?: string; phone?: string; otp: string; newPassword: string }): Promise<{
      success: boolean
      message: string
    }> {
      return request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async getCurrentUser(): Promise<any> {
      return request('/auth/me')
    },

    logout() {
      setAuthToken(null)
    },
  },

  // AI Personalized Travel Planner
  planner: {
    async generate(params: {
      destination: string
      duration?: number
      startDate?: string
      budget?: number
      people?: number
      interests?: string[]
      transportPref?: string
      stayPref?: string
      foodPref?: string
      startLocation?: string
      intensity?: string
    }) {
      return request<{
        success: boolean
        destination: string
        startDate: string
        durationDays: number
        groupSize: number
        userBudget: number
        plans: any[]
        generatedAt: string
      }>('/planner/generate', {
        method: 'POST',
        body: JSON.stringify(params),
      })
    },

    async modify(params: {
      currentPlan: any
      prompt: string
      modificationType?: string
    }) {
      return request<{
        success: boolean
        modifiedPlan: any
        changeSummary: string
        timestamp: string
      }>('/planner/modify', {
        method: 'POST',
        body: JSON.stringify(params),
      })
    },

    async save(data: {
      userId?: string
      destination: string
      startDate: string
      durationDays: number
      budgetTier: string
      totalCost: number
      remainingBudget: number
      summary: string
      plan: any
    }) {
      return request<{ success: boolean; savedItinerary: any }>('/planner/save', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async getSaved(userId?: string) {
      const q = userId ? `?userId=${encodeURIComponent(userId)}` : ''
      return request<any[]>(`/planner/saved${q}`)
    },
  },

  // Multi-Channel Notifications (WhatsApp, Gmail, Phone SMS)
  notifications: {
    async sendWhatsApp(data: {
      phone: string
      message: string
      templateType?: string
      recipientName?: string
      metadata?: any
    }) {
      return request<{
        success: boolean
        message: string
        logId: string
        recipient: string
        deliveredAt: string
        directWhatsAppUrl: string
        webWhatsAppUrl: string
      }>('/notifications/send-whatsapp', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async sendEmail(data: {
      email: string
      subject: string
      body?: string
      htmlContent?: string
      recipientName?: string
      metadata?: any
    }) {
      return request<{
        success: boolean
        message: string
        logId: string
        recipient: string
        subject: string
        deliveredAt: string
        gmailComposeUrl: string
        mailtoUrl: string
      }>('/notifications/send-email', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async sendSms(data: {
      phone: string
      message: string
      recipientName?: string
      metadata?: any
    }) {
      return request<{
        success: boolean
        message: string
        logId: string
        recipient: string
        smsUri: string
        deliveredAt: string
      }>('/notifications/send-sms', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async getLogs() {
      return request<any[]>('/notifications/logs')
    },
  },

  // Community Tourism, Reviews, Hidden Gems
  community: {
    async getPosts(category?: string, location?: string, hiddenOnly?: boolean) {
      const params = new URLSearchParams()
      if (category && category !== 'All') params.append('category', category)
      if (location) params.append('location', location)
      if (hiddenOnly) params.append('hiddenOnly', 'true')
      const qs = params.toString() ? `?${params.toString()}` : ''
      return request<any[]>(`/community/posts${qs}`)
    },

    async createPost(data: {
      authorName?: string
      authorAvatar?: string
      authorRole?: string
      location: string
      title: string
      content: string
      images?: string[]
      category?: string
      rating?: number
      tips?: string
      isHiddenGem?: boolean
    }) {
      return request<{ success: boolean; post: any }>('/community/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async likePost(id: string) {
      return request<{ success: boolean; likes: number }>(`/community/posts/${id}/like`, {
        method: 'POST',
      })
    },

    async getReviewSentiment(location?: string) {
      return request<any>('/community/reviews/sentiment', {
        method: 'POST',
        body: JSON.stringify({ location: location || 'Jaipur' }),
      })
    },

    async getHiddenGems() {
      return request<any[]>('/community/hidden-gems')
    },
  },

  // Cleanliness Reports
  reports: {
    async getAll(params?: { search?: string; status?: string; myReports?: boolean }): Promise<CleanlinessReport[]> {
      const searchParams = new URLSearchParams()
      if (params?.search) searchParams.append('search', params.search)
      if (params?.status && params.status !== 'All') searchParams.append('status', params.status)
      if (params?.myReports) searchParams.append('myReports', 'true')

      const qs = searchParams.toString() ? `?${searchParams.toString()}` : ''
      return request<CleanlinessReport[]>(`/reports${qs}`)
    },

    async getById(id: string): Promise<CleanlinessReport> {
      return request<CleanlinessReport>(`/reports/${id}`)
    },

    async create(data: {
      name: string
      location: string
      impact?: string
      description?: string
      evidence?: string[]
    }): Promise<CleanlinessReport> {
      return request<CleanlinessReport>('/reports', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async vote(reportId: string): Promise<{ success: boolean; votes: number; rank: number; medal: string | null; hasUpvoted: boolean }> {
      return request<{ success: boolean; votes: number; rank: number; medal: string | null; hasUpvoted: boolean }>(
        `/reports/${reportId}/vote`,
        { method: 'POST' }
      )
    },

    async addComment(reportId: string, comment: string): Promise<{ success: boolean; comments: string[] }> {
      return request<{ success: boolean; comments: string[] }>(`/reports/${reportId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
      })
    },

    async addSolution(reportId: string, solution: string): Promise<{ success: boolean; userSolutions: string[] }> {
      return request<{ success: boolean; userSolutions: string[] }>(`/reports/${reportId}/solution`, {
        method: 'POST',
        body: JSON.stringify({ solution }),
      })
    },

    async updateStatus(
      reportId: string,
      status: 'Open' | 'In Progress' | 'Resolved'
    ): Promise<{ id: string; currentStatus: 'Open' | 'In Progress' | 'Resolved' }> {
      return request<{ id: string; currentStatus: 'Open' | 'In Progress' | 'Resolved' }>(`/reports/${reportId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    },

    async addAuthorityResponse(
      reportId: string,
      response: string
    ): Promise<{ id: string; authorityResponse: string }> {
      return request<{ id: string; authorityResponse: string }>(`/reports/${reportId}/authority-response`, {
        method: 'POST',
        body: JSON.stringify({ response }),
      })
    },
  },

  // Listings (Homestays, Guides, Artisans/Products)
  listings: {
    async getHomestays(): Promise<HomestayListing[]> {
      return request<HomestayListing[]>('/listings/homestays')
    },
    async createHomestay(data: Omit<HomestayListing, 'id'>): Promise<HomestayListing> {
      return request<HomestayListing>('/listings/homestays', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async getGuides(): Promise<GuideListing[]> {
      return request<GuideListing[]>('/listings/guides')
    },
    async createGuide(data: Omit<GuideListing, 'id'>): Promise<GuideListing> {
      return request<GuideListing>('/listings/guides', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    async getProducts(): Promise<ProductListing[]> {
      return request<ProductListing[]>('/listings/products')
    },
    async createProduct(data: Omit<ProductListing, 'id'>): Promise<ProductListing> {
      return request<ProductListing>('/listings/products', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
  },

  // Bookings
  bookings: {
    async getAll(): Promise<BookingRequest[]> {
      return request<BookingRequest[]>('/bookings')
    },
    async create(data: Omit<BookingRequest, 'id' | 'status' | 'createdAt'>): Promise<BookingRequest> {
      return request<BookingRequest>('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    async updateStatus(id: string, status: 'accepted' | 'declined'): Promise<BookingRequest> {
      return request<BookingRequest>(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    },
  },

  // Crowd Information & Prediction
  crowd: {
    async getSpots(festival?: string, location?: string): Promise<CrowdSpot[]> {
      const params = new URLSearchParams()
      if (festival && festival !== 'All Events & Pilgrimages') params.append('festival', festival)
      if (location) params.append('location', location)
      const q = params.toString() ? `?${params.toString()}` : ''
      return request<CrowdSpot[]>(`/crowd${q}`)
    },
    async getPrediction(destination?: string, festival?: string, date?: string) {
      const params = new URLSearchParams()
      if (destination) params.append('destination', destination)
      if (festival) params.append('festival', festival)
      if (date) params.append('date', date)
      const q = params.toString() ? `?${params.toString()}` : ''
      return request<any>(`/crowd/prediction${q}`)
    },
    async updateSpot(id: string, data: Partial<CrowdSpot>): Promise<CrowdSpot> {
      return request<CrowdSpot>(`/crowd/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },
  },

  // Emergency & Safety
  emergency: {
    async getAlerts(location?: string): Promise<EmergencyAlert[]> {
      const q = location ? `?location=${encodeURIComponent(location)}` : ''
      return request<EmergencyAlert[]>(`/emergency/alerts${q}`)
    },
    async createAlert(data: Omit<EmergencyAlert, 'id' | 'time'>): Promise<EmergencyAlert> {
      return request<EmergencyAlert>('/emergency/alerts', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    async getServices(location?: string): Promise<EmergencyService[]> {
      const q = location ? `?location=${encodeURIComponent(location)}` : ''
      return request<EmergencyService[]>(`/emergency/services${q}`)
    },
    async checkIn(data: {
      userId?: string
      userName: string
      userPhone?: string
      location: string
      status?: string
      emergencyContact?: string
      note?: string
      dispatchAlerts?: boolean
    }) {
      return request<any>('/emergency/check-in', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
    async getCheckIns(location?: string) {
      const q = location ? `?location=${encodeURIComponent(location)}` : ''
      return request<any[]>(`/emergency/check-ins${q}`)
    },
    async triggerSos(data: {
      userName: string
      userPhone: string
      location: string
      gpsCoordinates?: string
      emergencyContact?: string
      userEmail?: string
    }) {
      return request<any>('/emergency/sos', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
  },

  // Chat & Messaging
  chats: {
    async getMessages(threadId: string) {
      return request<Array<{ id: string; threadId: string; senderId: string; senderRole: 'user' | 'local'; text: string; createdAt: string }>>(`/chats/${threadId}`)
    },
    async sendMessage(threadId: string, data: { text: string; senderRole?: string; receiverId?: string; senderId?: string }) {
      return request(`/chats/${threadId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
  },

  // Admin & Analytics
  admin: {
    async getAnalytics() {
      return request<any>('/admin/analytics')
    },
    async getAllUsers() {
      return request<any[]>('/admin/users')
    },
    async updateUserRole(id: string, role: string) {
      return request<any>(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      })
    },
  },

  // File Upload
  upload: {
    async uploadFile(file: File): Promise<{ url: string; filename: string }> {
      const formData = new FormData()
      formData.append('file', file)
      return request<{ url: string; filename: string }>('/upload', {
        method: 'POST',
        body: formData,
      })
    },
  },
}
