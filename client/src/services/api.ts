// YatraSetu API Client Service

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

export const API_BASE_URL = 'http://localhost:5000/api'
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
      // no JSON body
    }
    throw new Error(errMsg)
  }

  return response.json() as Promise<T>
}

export const api = {
  // Authentication
  auth: {
    async register(data: {
      role: UserRole
      name: string
      email: string
      password?: string
      phone?: string
      speciality?: string
    }): Promise<{ token: string; user: UserSession }> {
      const res = await request<{ token: string; user: UserSession }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setAuthToken(res.token)
      return res
    },

    async login(data: {
      email: string
      password?: string
      role?: UserRole
    }): Promise<{ token: string; user: UserSession }> {
      const res = await request<{ token: string; user: UserSession }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      setAuthToken(res.token)
      return res
    },

    async quickDemo(role: UserRole): Promise<{ token: string; user: UserSession }> {
      const res = await request<{ token: string; user: UserSession }>('/auth/quick-demo', {
        method: 'POST',
        body: JSON.stringify({ role }),
      })
      setAuthToken(res.token)
      return res
    },

    async getMe(): Promise<{ user: UserSession }> {
      return request<{ user: UserSession }>('/auth/me')
    },
  },

  // Cleanliness Reports
  reports: {
    async getAll(params?: { search?: string; status?: string; myReports?: boolean }): Promise<CleanlinessReport[]> {
      const q = new URLSearchParams()
      if (params?.search) q.set('search', params.search)
      if (params?.status && params.status !== 'All') q.set('status', params.status)
      if (params?.myReports) q.set('myReports', 'true')
      const queryString = q.toString() ? `?${q.toString()}` : ''
      return request<CleanlinessReport[]>(`/reports${queryString}`)
    },

    async create(report: {
      name: string
      location: string
      impact: 'High' | 'Medium' | 'Low'
      evidence?: string[]
      comments?: string[]
      userSolutions?: string[]
      description?: string
    }): Promise<CleanlinessReport> {
      return request<CleanlinessReport>('/reports', {
        method: 'POST',
        body: JSON.stringify(report),
      })
    },

    async toggleVote(reportId: string): Promise<{ success: boolean; votes: number; hasUpvoted: boolean }> {
      return request<{ success: boolean; votes: number; hasUpvoted: boolean }>(`/reports/${reportId}/vote`, {
        method: 'POST',
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

  // Listings
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

  // Crowd Information
  crowd: {
    async getSpots(festival?: string): Promise<CrowdSpot[]> {
      const q = festival && festival !== 'All Events & Pilgrimages' ? `?festival=${encodeURIComponent(festival)}` : ''
      return request<CrowdSpot[]>(`/crowd/spots${q}`)
    },
    async updateSpot(id: string, data: Partial<CrowdSpot>): Promise<CrowdSpot> {
      return request<CrowdSpot>(`/crowd/spots/${id}`, {
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
