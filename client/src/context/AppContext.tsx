import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  type UserRole,
  type UserSession,
  type CleanlinessReport,
  type BookingRequest,
  type HomestayListing,
  type GuideListing,
  type ProductListing,
  type CrowdSpot,
  type EmergencyAlert,
  type EmergencyService,
  initialCleanlinessReports,
  initialHomestays,
  initialGuides,
  initialProducts,
  initialSpots,
  initialAlerts,
  initialServices,
  initialBookingRequests,
} from '../data/mockStore'
import { api, setAuthToken } from '../services/api'
import {
  type DestinationLocation,
  getSavedLocation,
  saveLocation,
  PRESET_DESTINATIONS,
  reverseGeocode,
} from '../services/locationService'
import { type RealWeatherData, fetchRealWeather } from '../services/weatherService'
import { type RealPlacePOI, fetchRealPlacesPOIs } from '../services/osmService'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  text: string
}

interface AppContextType {
  // Session & Auth
  currentUser: UserSession | null
  login: (role: UserRole, email?: string, password?: string) => Promise<void>
  register: (role: UserRole, name: string, email: string, password?: string, phone?: string, speciality?: string) => Promise<void>
  logout: () => void

  // Central Location System (Single Global Source of Truth)
  activeLocation: DestinationLocation
  setActiveLocation: (location: DestinationLocation) => void
  currentLocation: DestinationLocation
  setCurrentLocation: (location: DestinationLocation) => void
  requestBrowserLocation: () => Promise<void>
  selectPresetDestination: (city: string) => void

  // Real External Data (Weather & POIs)
  weather: RealWeatherData | null
  isLoadingWeather: boolean
  destinationPOIs: RealPlacePOI[]
  isLoadingPOIs: boolean

  // Cleanliness Reports (Unified Tourist ↔ Authority)
  reports: CleanlinessReport[]
  addReport: (newReport: Omit<CleanlinessReport, 'id' | 'rank' | 'votes' | 'reportedAt' | 'currentStatus' | 'authorityResponse'>) => Promise<CleanlinessReport>
  upvoteReport: (id: string) => Promise<void>
  addSolution: (reportId: string, solution: string) => Promise<void>
  updateReportStatus: (reportId: string, status: 'Open' | 'In Progress' | 'Resolved') => Promise<void>
  addAuthorityResponse: (reportId: string, response: string) => Promise<void>

  // Bookings & Requests (Tourist ↔ Host)
  bookingRequests: BookingRequest[]
  createBookingRequest: (booking: Omit<BookingRequest, 'id' | 'status' | 'createdAt'>) => Promise<void>
  updateBookingStatus: (id: string, status: 'accepted' | 'declined') => Promise<void>

  // Listings & Digital Onboarding
  homestays: HomestayListing[]
  addHomestay: (item: Omit<HomestayListing, 'id'>) => Promise<void>
  guides: GuideListing[]
  addGuide: (item: Omit<GuideListing, 'id'>) => Promise<void>
  products: ProductListing[]
  addProduct: (item: Omit<ProductListing, 'id'>) => Promise<void>

  // Crowd & Spots
  spots: CrowdSpot[]
  updateSpotCount: (id: string, delta: number) => Promise<void>

  // Alerts & Services
  alerts: EmergencyAlert[]
  addAlert: (alert: Omit<EmergencyAlert, 'id' | 'time'>) => Promise<void>
  services: EmergencyService[]

  // Toasts
  toasts: ToastMessage[]
  showToast: (text: string, type?: 'success' | 'error' | 'info' | 'warning') => void
  removeToast: (id: string) => void

  // Navigation Helper
  currentPath: string
  navigate: (path: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEYS = {
  USER: 'yatrasetu_user',
  REPORTS: 'yatrasetu_reports',
  BOOKINGS: 'yatrasetu_bookings',
  HOMESTAYS: 'yatrasetu_homestays',
  GUIDES: 'yatrasetu_guides',
  PRODUCTS: 'yatrasetu_products',
  SPOTS: 'yatrasetu_spots',
  ALERTS: 'yatrasetu_alerts',
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session State
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Central Destination Location State
  const [currentLocation, setCurrentLocationState] = useState<DestinationLocation>(() => {
    return getSavedLocation()
  })

  const setCurrentLocation = (loc: DestinationLocation) => {
    setCurrentLocationState(loc)
    saveLocation(loc)
  }

  // Real Weather State (Open-Meteo)
  const [weather, setWeather] = useState<RealWeatherData | null>(null)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)

  // Real Places & POIs State (OpenStreetMap / Overpass)
  const [destinationPOIs, setDestinationPOIs] = useState<RealPlacePOI[]>([])
  const [isLoadingPOIs, setIsLoadingPOIs] = useState(false)

  // Fetch real weather and POIs when location changes
  useEffect(() => {
    let isMounted = true

    const loadRealData = async () => {
      setIsLoadingWeather(true)
      setIsLoadingPOIs(true)

      try {
        const [wData, poiData] = await Promise.allSettled([
          fetchRealWeather(currentLocation.latitude, currentLocation.longitude),
          fetchRealPlacesPOIs(currentLocation.latitude, currentLocation.longitude, currentLocation.city),
        ])

        if (isMounted) {
          if (wData.status === 'fulfilled') {
            setWeather(wData.value)
          }
          if (poiData.status === 'fulfilled') {
            setDestinationPOIs(poiData.value)
          }
        }
      } catch (err) {
        console.warn('Real data loading error:', err)
      } finally {
        if (isMounted) {
          setIsLoadingWeather(false)
          setIsLoadingPOIs(false)
        }
      }
    }

    loadRealData()
    return () => {
      isMounted = false
    }
  }, [currentLocation.latitude, currentLocation.longitude, currentLocation.city])

  // Browser GPS Location Request
  const requestBrowserLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'warning')
      return
    }

    showToast('Requesting GPS location from browser...', 'info')

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          try {
            const loc = await reverseGeocode(lat, lon)
            setCurrentLocation(loc)
            showToast(`Location detected: ${loc.displayName}! Live weather & POIs active.`, 'success')
          } catch {
            const fallbackLoc: DestinationLocation = {
              latitude: lat,
              longitude: lon,
              city: 'Detected Location',
              state: 'GPS',
              country: 'India',
              displayName: `Coordinates (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
              source: 'gps',
            }
            setCurrentLocation(fallbackLoc)
            showToast(`Location set to coordinates (${lat.toFixed(2)}, ${lon.toFixed(2)})`, 'success')
          }
          resolve()
        },
        (error) => {
          console.warn('Geolocation denied or unavailable:', error.message)
          showToast('GPS permission denied or unavailable. Please choose your destination manually.', 'info')
          resolve()
        },
        { timeout: 8000, enableHighAccuracy: false }
      )
    })
  }

  const selectPresetDestination = (cityName: string) => {
    const found = PRESET_DESTINATIONS.find(
      (p) => p.city.toLowerCase() === cityName.toLowerCase()
    )
    if (found) {
      setCurrentLocation(found)
      showToast(`Destination switched to ${found.displayName}`, 'success')
    }
  }

  // Navigation State based on window.location.hash
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.hash.replace(/^#/, '') || (currentUser ? `/${currentUser.role}` : '/login')
  })

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '') || '/login'
      setCurrentPath(hash)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`
    window.location.hash = normalized
    setCurrentPath(normalized)
  }

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const showToast = (text: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6)
    setToasts((prev) => [...prev, { id, text, type }])
    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Sync session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser))
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER)
        setAuthToken(null)
      }
    } catch (e) {
      console.warn('Storage sync failed', e)
    }
  }, [currentUser])

  // Data collections
  const [reports, setReports] = useState<CleanlinessReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REPORTS)
      return saved ? JSON.parse(saved) : initialCleanlinessReports
    } catch {
      return initialCleanlinessReports
    }
  })

  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS)
      return saved ? JSON.parse(saved) : initialBookingRequests
    } catch {
      return initialBookingRequests
    }
  })

  const [homestays, setHomestays] = useState<HomestayListing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOMESTAYS)
      return saved ? JSON.parse(saved) : initialHomestays
    } catch {
      return initialHomestays
    }
  })

  const [guides, setGuides] = useState<GuideListing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GUIDES)
      return saved ? JSON.parse(saved) : initialGuides
    } catch {
      return initialGuides
    }
  })

  const [products, setProducts] = useState<ProductListing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
      return saved ? JSON.parse(saved) : initialProducts
    } catch {
      return initialProducts
    }
  })

  const [spots, setSpots] = useState<CrowdSpot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SPOTS)
      return saved ? JSON.parse(saved) : initialSpots
    } catch {
      return initialSpots
    }
  })

  const [alerts, setAlerts] = useState<EmergencyAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALERTS)
      return saved ? JSON.parse(saved) : initialAlerts
    } catch {
      return initialAlerts
    }
  })

  const [services, setServices] = useState<EmergencyService[]>(initialServices)

  // Fetch initial data from backend with fallback
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rep, stays, gds, prods, spt, alr, srv, bkg] = await Promise.allSettled([
          api.reports.getAll(),
          api.listings.getHomestays(),
          api.listings.getGuides(),
          api.listings.getProducts(),
          api.crowd.getSpots(),
          api.emergency.getAlerts(),
          api.emergency.getServices(),
          api.bookings.getAll(),
        ])

        if (rep.status === 'fulfilled' && rep.value.length > 0) setReports(rep.value)
        if (stays.status === 'fulfilled' && stays.value.length > 0) setHomestays(stays.value)
        if (gds.status === 'fulfilled' && gds.value.length > 0) setGuides(gds.value)
        if (prods.status === 'fulfilled' && prods.value.length > 0) setProducts(prods.value)
        if (spt.status === 'fulfilled' && spt.value.length > 0) setSpots(spt.value)
        if (alr.status === 'fulfilled' && alr.value.length > 0) setAlerts(alr.value)
        if (srv.status === 'fulfilled' && srv.value.length > 0) setServices(srv.value)
        if (bkg.status === 'fulfilled') setBookingRequests(bkg.value)
      } catch (err) {
        console.info('Backend initial sync notice (using cached/fallback store):', err)
      }
    }
    fetchData()
  }, [])

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports))
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookingRequests))
      localStorage.setItem(STORAGE_KEYS.HOMESTAYS, JSON.stringify(homestays))
      localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(guides))
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
      localStorage.setItem(STORAGE_KEYS.SPOTS, JSON.stringify(spots))
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts))
    } catch (e) {
      console.warn(e)
    }
  }, [reports, bookingRequests, homestays, guides, products, spots, alerts])

  // Auth Methods
  const login = async (role: UserRole, email = '', password = '') => {
    try {
      let res
      if (email && password) {
        res = await api.auth.login({ email, password, role })
      } else {
        res = await api.auth.quickDemo(role)
      }
      setCurrentUser(res.user)
      showToast(`Welcome back, ${res.user.name}! Signed in as ${role.toUpperCase()}.`, 'success')
      navigate(`/${role}`)
    } catch (err: any) {
      // Fallback to local session
      let displayName = ''
      if (role === 'user') displayName = 'Aarav Sharma'
      else if (role === 'local') displayName = 'Arjun Mehta'
      else displayName = 'Dr. Rajesh Verma'

      const session: UserSession = {
        id: 'usr_' + Date.now().toString().slice(-4),
        role,
        name: displayName,
        email: email || `${role}@yatrasetu.in`,
        avatar: role === 'local' ? '🏡' : role === 'authority' ? '🛡️' : '👤',
        location: `${currentLocation.city}, ${currentLocation.state}`,
        speciality: role === 'local' ? 'Heritage & Forts Expert' : undefined,
      }
      setCurrentUser(session)
      showToast(`Welcome back, ${session.name}! Signed in as ${role.toUpperCase()}.`, 'success')
      navigate(`/${role}`)
    }
  }

  const register = async (
    role: UserRole,
    name: string,
    email: string,
    password = 'Password@123',
    phone = '',
    speciality = ''
  ) => {
    try {
      const res = await api.auth.register({ role, name, email, password, phone, speciality })
      setCurrentUser(res.user)
      showToast(`Account registered successfully! Welcome to YatraSetu, ${name}.`, 'success')
      navigate(`/${role}`)
    } catch (err: any) {
      // Fallback
      const session: UserSession = {
        id: 'usr_' + Date.now().toString().slice(-4),
        role,
        name,
        email,
        phone,
        speciality,
        avatar: role === 'local' ? '🏡' : role === 'authority' ? '🛡️' : '👤',
        location: `${currentLocation.city}, ${currentLocation.state}`,
      }
      setCurrentUser(session)
      showToast(`Account registered! Welcome to YatraSetu, ${name}.`, 'success')
      navigate(`/${role}`)
    }
  }

  const logout = () => {
    setCurrentUser(null)
    setAuthToken(null)
    showToast('You have been logged out.', 'info')
    navigate('/login')
  }

  // Cleanliness Methods
  const addReport = async (
    newReport: Omit<CleanlinessReport, 'id' | 'rank' | 'votes' | 'reportedAt' | 'currentStatus' | 'authorityResponse'>
  ): Promise<CleanlinessReport> => {
    try {
      const created = await api.reports.create(newReport)
      setReports((prev) => [created, ...prev])
      showToast('Cleanliness report submitted to Authority queue & community tracker!', 'success')
      return created
    } catch {
      const nextRank = reports.length + 1
      const fallbackReport: CleanlinessReport = {
        ...newReport,
        id: Date.now().toString(),
        rank: nextRank,
        votes: 1,
        hasUpvoted: true,
        currentStatus: 'Open',
        authorityResponse: null,
        reportedBy: currentUser?.name || 'Community Member',
        reportedAt:
          new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
          ' ' +
          new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }
      setReports((prev) => [fallbackReport, ...prev])
      showToast('Cleanliness report submitted!', 'success')
      return fallbackReport
    }
  }

  const upvoteReport = async (id: string) => {
    try {
      const res = await api.reports.toggleVote(id)
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, votes: res.votes, hasUpvoted: res.hasUpvoted } : r))
      )
      showToast(res.hasUpvoted ? 'Upvote recorded!' : 'Upvote removed.', 'info')
    } catch {
      setReports((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            const hasVoted = r.hasUpvoted
            return {
              ...r,
              votes: hasVoted ? r.votes - 1 : r.votes + 1,
              hasUpvoted: !hasVoted,
            }
          }
          return r
        })
      )
      showToast('Vote updated!', 'info')
    }
  }

  const addSolution = async (reportId: string, solution: string) => {
    try {
      const res = await api.reports.addSolution(reportId, solution)
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, userSolutions: res.userSolutions } : r))
      )
      showToast('Your solution has been submitted for community review.', 'success')
    } catch {
      setReports((prev) =>
        prev.map((r) => {
          if (r.id === reportId) {
            return {
              ...r,
              userSolutions: [...r.userSolutions, solution],
            }
          }
          return r
        })
      )
      showToast('Solution proposed!', 'success')
    }
  }

  const updateReportStatus = async (reportId: string, status: 'Open' | 'In Progress' | 'Resolved') => {
    try {
      await api.reports.updateStatus(reportId, status)
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, currentStatus: status } : r))
      )
      showToast(`Report status updated to ${status}.`, 'info')
    } catch {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, currentStatus: status } : r))
      )
      showToast(`Status updated to ${status}.`, 'info')
    }
  }

  const addAuthorityResponse = async (reportId: string, response: string) => {
    try {
      await api.reports.addAuthorityResponse(reportId, response)
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, authorityResponse: response } : r))
      )
      showToast('Official response published to citizen portal.', 'success')
    } catch {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, authorityResponse: response } : r))
      )
      showToast('Official response published.', 'success')
    }
  }

  // Booking Methods
  const createBookingRequest = async (booking: Omit<BookingRequest, 'id' | 'status' | 'createdAt'>) => {
    try {
      const created = await api.bookings.create(booking)
      setBookingRequests((prev) => [created, ...prev])
      showToast(`Booking request sent to ${booking.serviceName}! Host will confirm soon.`, 'success')
    } catch {
      const newReq: BookingRequest = {
        ...booking,
        id: Date.now().toString(),
        status: 'pending',
        createdAt:
          new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
          ' ' +
          new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }
      setBookingRequests((prev) => [newReq, ...prev])
      showToast(`Booking request sent to ${booking.serviceName}!`, 'success')
    }
  }

  const updateBookingStatus = async (id: string, status: 'accepted' | 'declined') => {
    try {
      const updated = await api.bookings.updateStatus(id, status)
      setBookingRequests((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: updated.status } : b))
      )
      showToast(`Booking request ${status}.`, status === 'accepted' ? 'success' : 'info')
    } catch {
      setBookingRequests((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      )
      showToast(`Booking request ${status}.`, status === 'accepted' ? 'success' : 'info')
    }
  }

  // Listings & Onboarding Methods
  const addHomestay = async (item: Omit<HomestayListing, 'id'>) => {
    try {
      const created = await api.listings.createHomestay(item)
      setHomestays((prev) => [created, ...prev])
      showToast(`Homestay "${created.name}" published successfully!`, 'success')
    } catch {
      const newStay: HomestayListing = { ...item, id: Date.now().toString() }
      setHomestays((prev) => [newStay, ...prev])
      showToast(`Homestay "${newStay.name}" published!`, 'success')
    }
  }

  const addGuide = async (item: Omit<GuideListing, 'id'>) => {
    try {
      const created = await api.listings.createGuide(item)
      setGuides((prev) => [created, ...prev])
      showToast(`Guide listing for "${created.name}" published!`, 'success')
    } catch {
      const newGuide: GuideListing = { ...item, id: Date.now().toString() }
      setGuides((prev) => [newGuide, ...prev])
      showToast(`Guide listing for "${newGuide.name}" published!`, 'success')
    }
  }

  const addProduct = async (item: Omit<ProductListing, 'id'>) => {
    try {
      const created = await api.listings.createProduct(item)
      setProducts((prev) => [created, ...prev])
      showToast(`Product "${created.name}" added to marketplace!`, 'success')
    } catch {
      const newProd: ProductListing = { ...item, id: Date.now().toString() }
      setProducts((prev) => [newProd, ...prev])
      showToast(`Product "${newProd.name}" added!`, 'success')
    }
  }

  // Crowd methods
  const updateSpotCount = async (id: string, delta: number) => {
    const spot = spots.find((s) => s.id === id)
    if (!spot) return
    const newCount = Math.max(0, spot.count + delta)
    try {
      const updated = await api.crowd.updateSpot(id, { count: newCount })
      setSpots((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)))
    } catch {
      let density: 'High' | 'Moderate' | 'Low' | 'Closed' = 'Low'
      let densityLevel: 'high' | 'medium' | 'low' | 'closed' = 'low'
      if (!spot.open) {
        density = 'Closed'
        densityLevel = 'closed'
      } else {
        const ratio = newCount / spot.capacity
        if (ratio > 0.8) {
          density = 'High'
          densityLevel = 'high'
        } else if (ratio > 0.45) {
          density = 'Moderate'
          densityLevel = 'medium'
        }
      }
      setSpots((prev) =>
        prev.map((s) => (s.id === id ? { ...s, count: newCount, density, densityLevel } : s))
      )
    }
  }

  // Alert methods
  const addAlert = async (alert: Omit<EmergencyAlert, 'id' | 'time'>) => {
    try {
      const created = await api.emergency.createAlert(alert)
      setAlerts((prev) => [created, ...prev])
      showToast('Official emergency warning broadcasted!', 'warning')
    } catch {
      const newAlert: EmergencyAlert = {
        ...alert,
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }
      setAlerts((prev) => [newAlert, ...prev])
      showToast('Official emergency warning broadcasted!', 'warning')
    }
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        activeLocation: currentLocation,
        setActiveLocation: setCurrentLocation,
        currentLocation,
        setCurrentLocation,
        requestBrowserLocation,
        selectPresetDestination,
        weather,
        isLoadingWeather,
        destinationPOIs,
        isLoadingPOIs,
        reports,
        addReport,
        upvoteReport,
        addSolution,
        updateReportStatus,
        addAuthorityResponse,
        bookingRequests,
        createBookingRequest,
        updateBookingStatus,
        homestays,
        addHomestay,
        guides,
        addGuide,
        products,
        addProduct,
        spots,
        updateSpotCount,
        alerts,
        addAlert,
        services,
        toasts,
        showToast,
        removeToast,
        currentPath,
        navigate,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within an AppProvider')
  return context
}
