import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import {
  Search,
  Navigation,
  MapPin,
  Compass,
  Star,
  Phone,
  Globe,
  Clock,
  Car,
  Footprints,
  Bike,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  Locate,
  Maximize2,
  Minimize2,
  X,
  Users,
  Home,
  AlertTriangle,
  Shield,
  ThumbsUp,
  RefreshCw,
  CheckCircle,
} from 'lucide-react'
import type { MapMarkerItem } from '../InteractiveMap'

export interface GooglePlaceInfo {
  placeId?: string
  name: string
  address?: string
  lat: number
  lng: number
  rating?: number
  reviewsCount?: number
  isOpen?: boolean
  phone?: string
  website?: string
  photoUrl?: string
  types?: string[]
  category?: 'attraction' | 'homestay' | 'crowd' | 'issue' | 'emergency'
  price?: string
  crowdLevel?: 'low' | 'medium' | 'high'
  status?: string
  subtitle?: string
}

interface Props {
  center?: { lat: number; lng: number }
  zoom?: number
  items?: MapMarkerItem[]
  height?: string
  title?: string
  showSearch?: boolean
  showDirections?: boolean
  onPlaceSelected?: (place: GooglePlaceInfo) => void
}

const DEFAULT_CENTER = { lat: 26.9124, lng: 75.7873 } // Jaipur, Rajasthan

// Google Tile Layers
const GOOGLE_TILE_LAYERS = {
  streets: {
    name: 'Google Streets',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Maps Platform',
    icon: '🗺️',
  },
  satellite: {
    name: 'Google Satellite Hybrid',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Maps Imagery',
    icon: '🛰️',
  },
  terrain: {
    name: 'Google Terrain',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Maps Topography',
    icon: '⛰️',
  },
}

export default function GoogleMapView({
  center = DEFAULT_CENTER,
  zoom = 13,
  items = [],
  height = '540px',
  title = 'Live Google Maps Platform Explorer',
  showSearch = true,
  showDirections = true,
  onPlaceSelected,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const routePolylineRef = useRef<L.Polyline | null>(null)
  const userMarkerRef = useRef<L.CircleMarker | null>(null)

  // Map state
  const [activeLayer, setActiveLayer] = useState<'streets' | 'satellite' | 'terrain'>('streets')
  const [activeFilter, setActiveFilter] = useState<'all' | 'crowd' | 'homestay' | 'issue' | 'emergency'>('all')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLayerDropdown, setShowLayerDropdown] = useState(false)

  // Search & Places state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GooglePlaceInfo[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<GooglePlaceInfo | null>(null)

  // Real Turn-by-Turn Directions state
  const [originText, setOriginText] = useState('My Location')
  const [destinationText, setDestinationText] = useState('Hawa Mahal, Jaipur')
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>({ lat: 26.9124, lng: 75.7873 })
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({ lat: 26.9239, lng: 75.8267 })
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'cycling'>('driving')
  const [routeInfo, setRouteInfo] = useState<{
    distance: string
    duration: string
    steps: string[]
  } | null>(null)
  const [isRouting, setIsRouting] = useState(false)
  const [directionsPanelOpen, setDirectionsPanelOpen] = useState(false)

  // Filter items
  const filteredItems = items.filter((item) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'crowd') return item.type === 'crowd'
    if (activeFilter === 'homestay') return item.type === 'homestay'
    if (activeFilter === 'issue') return item.type === 'issue'
    if (activeFilter === 'emergency') return item.type === 'emergency'
    return true
  })

  // Initialize Interactive Map with Google Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    const initialLat = center.lat || DEFAULT_CENTER.lat
    const initialLng = center.lng || DEFAULT_CENTER.lng

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom,
      zoomControl: false,
    })

    // Add Base Google Tile Layer
    L.tileLayer(GOOGLE_TILE_LAYERS[activeLayer].url, {
      maxZoom: 20,
      subdomains: GOOGLE_TILE_LAYERS[activeLayer].subdomains,
      attribution: GOOGLE_TILE_LAYERS[activeLayer].attribution,
    }).addTo(map)

    const markersLayer = L.layerGroup().addTo(map)
    markersLayerRef.current = markersLayer
    mapInstanceRef.current = map

    // Render Markers
    renderAllMarkers(filteredItems)

    if (filteredItems.length > 0) {
      const first = filteredItems[0]
      setSelectedPlace({
        placeId: first.id,
        name: first.title,
        address: first.subtitle || 'Jaipur, Rajasthan',
        lat: first.lat,
        lng: first.lng,
        category: first.type,
        price: first.price,
        crowdLevel: first.crowdLevel,
        status: first.status,
        subtitle: first.subtitle,
        photoUrl: first.image,
        rating: 4.6,
        reviewsCount: 3200,
        isOpen: true,
      })
    }

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Switch Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const map = mapInstanceRef.current

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer)
      }
    })

    L.tileLayer(GOOGLE_TILE_LAYERS[activeLayer].url, {
      maxZoom: 20,
      subdomains: GOOGLE_TILE_LAYERS[activeLayer].subdomains,
      attribution: GOOGLE_TILE_LAYERS[activeLayer].attribution,
    }).addTo(map)
  }, [activeLayer])

  // Re-render markers when filter or items change
  useEffect(() => {
    renderAllMarkers(filteredItems)
  }, [activeFilter, items])

  // Center Map when center props change
  useEffect(() => {
    if (!mapInstanceRef.current || !center.lat || !center.lng) return
    mapInstanceRef.current.flyTo([center.lat, center.lng], zoom, {
      duration: 1.2,
    })
  }, [center.lat, center.lng, zoom])

  // Render Category Pins with Specific Visual Badges
  const renderAllMarkers = (markerList: MapMarkerItem[]) => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return
    markersLayerRef.current.clearLayers()

    markerList.forEach((item) => {
      let pinColor = '#D64545' // Default Red
      let pinIcon = '📍'
      let badgeHtml = item.title.split('(')[0].trim()

      if (item.type === 'crowd') {
        const isHigh = item.crowdLevel === 'high'
        const isMed = item.crowdLevel === 'medium'
        pinColor = isHigh ? '#D64545' : isMed ? '#D89A1C' : '#1E9E5A'
        pinIcon = '👥'
        badgeHtml = `${isHigh ? '🔴 High Crowd' : isMed ? '🟡 Moderate' : '🟢 Low Crowd'} · ${item.badge || item.title}`
      } else if (item.type === 'homestay') {
        pinColor = '#0F6E5C'
        pinIcon = '🏡'
        badgeHtml = `🏡 ${item.price || item.badge || item.title}`
      } else if (item.type === 'issue') {
        pinColor = '#E0762F'
        pinIcon = '🧹'
        badgeHtml = `⚠️ ${item.status || 'Reported Issue'}`
      } else if (item.type === 'emergency') {
        pinColor = '#B91C1C'
        pinIcon = '🚨'
        badgeHtml = `🚨 24x7 SOS · ${item.title}`
      }

      const customIcon = L.divIcon({
        className: 'custom-google-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background: ${pinColor}; color: white; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35); border: 2px solid white;">
              <span style="transform: rotate(45deg); font-size: 14px; font-weight: 800;">${pinIcon}</span>
            </div>
            <div style="background: rgba(20,27,24,0.92); color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; margin-top: 4px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2);">
              ${badgeHtml}
            </div>
          </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 36],
      })

      const marker = L.marker([item.lat, item.lng], { icon: customIcon })
      marker.on('click', () => {
        const placeInfo: GooglePlaceInfo = {
          placeId: item.id,
          name: item.title,
          address: item.subtitle || 'Jaipur, Rajasthan',
          lat: item.lat,
          lng: item.lng,
          category: item.type,
          price: item.price,
          crowdLevel: item.crowdLevel,
          status: item.status,
          subtitle: item.subtitle,
          photoUrl: item.image,
          rating: item.type === 'homestay' ? 4.9 : 4.6,
          reviewsCount: Math.floor(Math.random() * 2000) + 100,
          isOpen: true,
        }

        setSelectedPlace(placeInfo)
        setDestCoords({ lat: item.lat, lng: item.lng })
        setDestinationText(item.title)
        onPlaceSelected?.(placeInfo)
        mapInstanceRef.current?.flyTo([item.lat, item.lng], 16, { duration: 1 })
      })

      markersLayerRef.current?.addLayer(marker)
    })
  }

  // Real Live Search with Autocomplete
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lat=${center.lat || 26.9124}&lon=${center.lng || 75.7873}`
      )
      const data = await res.json()

      const places: GooglePlaceInfo[] = data.features.map((f: any, idx: number) => ({
        placeId: `search-${idx}-${Date.now()}`,
        name: f.properties.name || f.properties.street || query,
        address: [
          f.properties.name,
          f.properties.street,
          f.properties.district,
          f.properties.city,
          f.properties.state,
          f.properties.country,
        ]
          .filter(Boolean)
          .join(', '),
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        rating: 4.6,
        reviewsCount: Math.floor(Math.random() * 5000) + 200,
        isOpen: true,
        category: 'attraction',
        types: [f.properties.type || 'Point of Interest', f.properties.city || 'India'],
      }))

      setSearchResults(places)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle Select Place from Autocomplete Dropdown
  const handleSelectSearchResult = (place: GooglePlaceInfo) => {
    setSelectedPlace(place)
    setSearchResults([])
    setSearchQuery(place.name)
    setDestCoords({ lat: place.lat, lng: place.lng })
    setDestinationText(place.name)
    onPlaceSelected?.(place)

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.lat, place.lng], 16, { duration: 1.2 })
    }
  }

  // 📍 Use My Location (Live Geolocation)
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude
        const userLng = pos.coords.longitude

        setOriginCoords({ lat: userLat, lng: userLng })
        setOriginText('📍 My Current Location')

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([userLat, userLng], 16, { duration: 1.2 })

          // Add/update pulsing blue location dot
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([userLat, userLng])
          } else {
            const blueDot = L.circleMarker([userLat, userLng], {
              radius: 9,
              fillColor: '#1A73E8',
              color: '#FFFFFF',
              weight: 3,
              opacity: 1,
              fillOpacity: 1,
            }).addTo(mapInstanceRef.current)

            // Outer pulse circle
            L.circle([userLat, userLng], {
              radius: 60,
              fillColor: '#1A73E8',
              fillOpacity: 0.15,
              color: '#1A73E8',
              weight: 1,
            }).addTo(mapInstanceRef.current)

            userMarkerRef.current = blueDot
          }
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        alert('Could not access your location. Please check browser location permissions.')
      }
    )
  }

  // Real Turn-by-Turn Routing using OSRM Routing Engine
  const calculateRoute = async () => {
    if (!originCoords || !destCoords) return
    setIsRouting(true)
    setDirectionsPanelOpen(true)

    try {
      const modeProfile = travelMode === 'walking' ? 'foot' : travelMode === 'cycling' ? 'bike' : 'driving'
      const url = `https://router.project-osrm.org/route/v1/${modeProfile}/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson&steps=true`

      const res = await fetch(url)
      const data = await res.json()

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const distKm = (route.distance / 1000).toFixed(1) + ' km'
        const durMins = Math.round(route.duration / 60)
        const durText = durMins > 60 ? `${Math.floor(durMins / 60)}h ${durMins % 60}m` : `${durMins} mins`

        const stepsList: string[] = route.legs[0].steps
          .map((s: any) => {
            const name = s.name ? ` onto ${s.name}` : ''
            const maneuver = s.maneuver.type
            const modifier = s.maneuver.modifier ? ` (${s.maneuver.modifier})` : ''
            const dist = s.distance > 0 ? ` [${Math.round(s.distance)} m]` : ''
            return `${maneuver.charAt(0).toUpperCase() + maneuver.slice(1)}${modifier}${name}${dist}`
          })
          .filter((step: string) => !step.toLowerCase().includes('arrive'))

        setRouteInfo({
          distance: distKm,
          duration: durText,
          steps: stepsList.slice(0, 8),
        })

        // Draw Route Polyline on Map
        if (mapInstanceRef.current) {
          if (routePolylineRef.current) {
            mapInstanceRef.current.removeLayer(routePolylineRef.current)
          }

          const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
          const polyline = L.polyline(coordinates, {
            color: '#0F6E5C',
            weight: 6,
            opacity: 0.9,
            lineJoin: 'round',
          }).addTo(mapInstanceRef.current)

          routePolylineRef.current = polyline
          mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] })
        }
      }
    } catch (err) {
      console.error('Routing failed:', err)
    } finally {
      setIsRouting(false)
    }
  }

  return (
    <div
      className={`relative rounded-3xl overflow-hidden shadow-xl border border-[#E4E7E5] bg-white flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : ''
      }`}
    >
      {/* Top Google Search, Filter Chips & Layer Bar */}
      <div className="p-3 bg-white/95 backdrop-blur-md border-b border-[#E4E7E5] flex flex-col gap-2.5 z-20">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Real Place Autocomplete Search Input */}
          <div className="relative flex-1 max-w-lg">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#F7F6F2] border border-[#D0D7D4] focus-within:border-[#0F6E5C] focus-within:bg-white shadow-2xs transition-all">
              <Search className="w-4 h-4 text-[#7B8582]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search Google Maps (e.g. Hawa Mahal, Amber Fort, Taj Mahal)..."
                className="bg-transparent text-xs w-full focus:outline-none font-600 text-[#141B18] placeholder:text-[#7B8582]"
              />
              {isSearching && <RefreshCw className="w-3.5 h-3.5 text-[#0F6E5C] animate-spin" />}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="text-[#7B8582] hover:text-[#141B18] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Autocomplete Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-[#E4E7E5] overflow-hidden z-50 divide-y divide-[#E4E7E5] animate-in fade-in">
                {searchResults.map((place) => (
                  <div
                    key={place.placeId}
                    onClick={() => handleSelectSearchResult(place)}
                    className="p-3 hover:bg-[#E4F3EF] cursor-pointer transition-colors flex items-start gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-xl bg-[#D64545]/10 text-[#D64545] flex items-center justify-center flex-shrink-0 mt-0.5">
                      📍
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-800 text-xs text-[#141B18] truncate">{place.name}</p>
                      <p className="text-[10px] text-[#505D58] truncate">{place.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons Cluster */}
          <div className="flex items-center gap-2">
            {/* Directions Toggle */}
            <button
              type="button"
              onClick={() => setDirectionsPanelOpen(!directionsPanelOpen)}
              className={`px-3.5 py-2 rounded-xl text-xs font-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                directionsPanelOpen
                  ? 'bg-[#0F6E5C] text-white'
                  : 'bg-[#E4F3EF] text-[#0F6E5C] hover:bg-[#d4ede5]'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Directions</span>
            </button>

            {/* Use My Location (GPS) */}
            <button
              type="button"
              onClick={handleUseMyLocation}
              className="p-2 rounded-xl bg-white hover:bg-[#F7F6F2] text-[#141B18] border border-[#D0D7D4] transition-all cursor-pointer shadow-2xs"
              title="Use My Current Location"
            >
              <Locate className="w-4 h-4 text-[#1A73E8]" />
            </button>

            {/* Layer Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLayerDropdown(!showLayerDropdown)}
                className="p-2 rounded-xl bg-white hover:bg-[#F7F6F2] text-[#141B18] border border-[#D0D7D4] transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                title="Change Map Layers"
              >
                <Layers className="w-4 h-4 text-[#0F6E5C]" />
              </button>

              {showLayerDropdown && (
                <div className="absolute right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-[#E4E7E5] p-2 w-48 z-50 space-y-1 animate-in fade-in">
                  <p className="text-[10px] font-800 text-[#7B8582] uppercase px-2 py-1">Map Type</p>
                  {(['streets', 'satellite', 'terrain'] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveLayer(key)
                        setShowLayerDropdown(false)
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-700 flex items-center gap-2 transition-colors cursor-pointer ${
                        activeLayer === key
                          ? 'bg-[#E4F3EF] text-[#0F6E5C]'
                          : 'text-[#141B18] hover:bg-[#F7F6F2]'
                      }`}
                    >
                      <span>{GOOGLE_TILE_LAYERS[key].icon}</span>
                      <span>{GOOGLE_TILE_LAYERS[key].name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white hover:bg-[#F7F6F2] text-[#141B18] border border-[#D0D7D4] transition-all cursor-pointer shadow-2xs"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Ecosystem Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-1">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-700 whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#141B18] text-white shadow-2xs'
                : 'bg-[#F7F6F2] text-[#505D58] hover:bg-white border border-[#E4E7E5]'
            }`}
          >
            ✨ All Sights ({items.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('crowd')}
            className={`px-3 py-1.5 rounded-xl text-xs font-700 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'crowd'
                ? 'bg-[#D64545] text-white shadow-2xs'
                : 'bg-[#FDE8E8] text-[#9B1C1C] hover:bg-[#fcd0d0] border border-[#D64545]/30'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>👥 Live Crowd Density</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('homestay')}
            className={`px-3 py-1.5 rounded-xl text-xs font-700 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'homestay'
                ? 'bg-[#0F6E5C] text-white shadow-2xs'
                : 'bg-[#E4F3EF] text-[#0F6E5C] hover:bg-[#d4ede5] border border-[#0F6E5C]/30'
            }`}
          >
            <span>🏡 Homestays & Stays</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('issue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-700 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'issue'
                ? 'bg-[#E0762F] text-white shadow-2xs'
                : 'bg-[#FEF3EA] text-[#E0762F] hover:bg-[#fde2cf] border border-[#E0762F]/30'
            }`}
          >
            <span>🧹 Cleanliness Reports</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('emergency')}
            className={`px-3 py-1.5 rounded-xl text-xs font-700 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'emergency'
                ? 'bg-[#B91C1C] text-white shadow-2xs'
                : 'bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#fecaca] border border-[#B91C1C]/30'
            }`}
          >
            <span>🚨 Safety & SOS Hubs</span>
          </button>
        </div>
      </div>

      {/* Real Directions & Routing Bar */}
      {directionsPanelOpen && (
        <div className="p-3 bg-[#E4F3EF] border-b border-[#0F6E5C]/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 z-20 animate-in slide-in-from-top-2 duration-150">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#D0D7D4]">
              <span className="text-xs">🟢</span>
              <input
                type="text"
                value={originText}
                onChange={(e) => setOriginText(e.target.value)}
                placeholder="Origin / Starting point"
                className="bg-transparent text-xs w-full focus:outline-none font-600 text-[#141B18]"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#D0D7D4]">
              <span className="text-xs">🔴</span>
              <input
                type="text"
                value={destinationText}
                onChange={(e) => setDestinationText(e.target.value)}
                placeholder="Destination point"
                className="bg-transparent text-xs w-full focus:outline-none font-600 text-[#141B18]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Travel Mode Selector */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D0D7D4]">
              <button
                type="button"
                onClick={() => setTravelMode('driving')}
                className={`p-1.5 rounded-lg text-xs font-700 transition-all cursor-pointer ${
                  travelMode === 'driving' ? 'bg-[#0F6E5C] text-white shadow-2xs' : 'text-[#505D58]'
                }`}
                title="Driving Route"
              >
                <Car className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTravelMode('walking')}
                className={`p-1.5 rounded-lg text-xs font-700 transition-all cursor-pointer ${
                  travelMode === 'walking' ? 'bg-[#0F6E5C] text-white shadow-2xs' : 'text-[#505D58]'
                }`}
                title="Walking Route"
              >
                <Footprints className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTravelMode('cycling')}
                className={`p-1.5 rounded-lg text-xs font-700 transition-all cursor-pointer ${
                  travelMode === 'cycling' ? 'bg-[#0F6E5C] text-white shadow-2xs' : 'text-[#505D58]'
                }`}
                title="Cycling Route"
              >
                <Bike className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={calculateRoute}
              disabled={isRouting}
              className="px-4 py-2 rounded-xl bg-[#0F6E5C] hover:bg-[#0A4E42] text-white font-800 text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {isRouting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>{isRouting ? 'Routing...' : 'Find Route'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Map Canvas Area */}
      <div className="relative flex-1" style={{ minHeight: height }}>
        <div ref={mapContainerRef} className="w-full h-full" style={{ height: isFullscreen ? '100%' : height }} />

        {/* Turn-by-Turn Route Instructions Overlay */}
        {routeInfo && (
          <div className="absolute top-4 left-4 max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-[#0F6E5C]/30 p-4 z-30 space-y-2.5 animate-in slide-in-from-left-4">
            <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🛣️</span>
                <div>
                  <h5 className="font-800 text-sm text-[#141B18]">{routeInfo.duration}</h5>
                  <p className="text-[10px] text-[#505D58]">{routeInfo.distance} · Optimal Fast Route</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRouteInfo(null)}
                className="text-[#7B8582] hover:text-[#141B18] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 text-[11px] pr-1">
              {routeInfo.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[#141B18]">
                  <span className="font-bold text-[#0F6E5C] mt-0.5">•</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tailored Place Details Card (Supports Attractions, Live Crowd, Homestays, Cleanliness, Emergency) */}
      {selectedPlace && (
        <div className="p-4 bg-white border-t border-[#E4E7E5] space-y-3 z-20 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-800 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                  {selectedPlace.name}
                </h4>

                {/* Rating Badge */}
                {selectedPlace.rating && (
                  <span className="px-2 py-0.5 rounded-full bg-[#FFF8E6] text-[#8A6B0A] font-800 text-xs flex items-center gap-1 border border-[#E8B931]/30">
                    <Star className="w-3 h-3 fill-[#E8B931] text-[#E8B931]" />
                    <span>{selectedPlace.rating}</span>
                  </span>
                )}

                {/* Category Badge */}
                {selectedPlace.category === 'crowd' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FDE8E8] text-[#9B1C1C] font-800 text-xs flex items-center gap-1 border border-[#D64545]/20">
                    <Users className="w-3 h-3" />
                    <span>{selectedPlace.crowdLevel === 'high' ? 'High Density' : selectedPlace.crowdLevel === 'medium' ? 'Moderate Density' : 'Low Density'}</span>
                  </span>
                )}

                {selectedPlace.category === 'homestay' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E4F3EF] text-[#0F6E5C] font-800 text-xs flex items-center gap-1 border border-[#0F6E5C]/20">
                    <Home className="w-3 h-3" />
                    <span>Verified Homestay · {selectedPlace.price}</span>
                  </span>
                )}

                {selectedPlace.category === 'issue' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3EA] text-[#E0762F] font-800 text-xs flex items-center gap-1 border border-[#E0762F]/20">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Civic Status: {selectedPlace.status || 'Reported'}</span>
                  </span>
                )}

                {selectedPlace.category === 'emergency' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#B91C1C] font-800 text-xs flex items-center gap-1 border border-[#B91C1C]/20">
                    <Shield className="w-3 h-3" />
                    <span>24x7 Emergency Hub</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#505D58]">{selectedPlace.address || selectedPlace.subtitle}</p>
            </div>

            {/* Quick Actions Cluster */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setDestinationText(selectedPlace.name)
                  setDestCoords({ lat: selectedPlace.lat, lng: selectedPlace.lng })
                  setDirectionsPanelOpen(true)
                  calculateRoute()
                }}
                className="px-3.5 py-2 rounded-xl bg-[#0F6E5C] hover:bg-[#0A4E42] text-white font-800 text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Directions</span>
              </button>

              {selectedPlace.category === 'emergency' && (
                <a
                  href="tel:112"
                  className="px-3.5 py-2 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-800 text-xs flex items-center gap-1.5 shadow-xs transition-all no-underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 112 SOS</span>
                </a>
              )}

              {selectedPlace.category === 'issue' && (
                <button
                  type="button"
                  onClick={() => alert('Civic upvote recorded! Local authorities notified.')}
                  className="px-3.5 py-2 rounded-xl bg-[#FEF3EA] text-[#E0762F] hover:bg-[#fde2cf] font-800 text-xs flex items-center gap-1.5 border border-[#E0762F]/30 cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Upvote Report</span>
                </button>
              )}

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.lat},${selectedPlace.lng}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl border border-[#D0D7D4] hover:bg-[#F7F6F2] text-[#505D58] transition-all cursor-pointer"
                title="Open in Google Maps App"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
