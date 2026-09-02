// Central Destination and Location Management Service for YatraSetu

export interface DestinationLocation {
  id: string
  name: string
  city: string
  state: string
  country: string
  displayName: string
  latitude: number
  longitude: number
  source: 'gps' | 'manual' | 'preset'
}

export const PRESET_DESTINATIONS: DestinationLocation[] = [
  {
    id: 'pimpri-chinchwad',
    name: 'Pimpri-Chinchwad, Maharashtra',
    city: 'Pimpri-Chinchwad',
    state: 'Maharashtra',
    country: 'India',
    displayName: 'Pimpri-Chinchwad, Maharashtra',
    latitude: 18.6298,
    longitude: 73.7997,
    source: 'preset',
  },
  {
    id: 'pune',
    name: 'Pune, Maharashtra',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    displayName: 'Pune, Maharashtra',
    latitude: 18.5204,
    longitude: 73.8567,
    source: 'preset',
  },
  {
    id: 'delhi',
    name: 'New Delhi, NCR',
    city: 'Delhi',
    state: 'Delhi NCR',
    country: 'India',
    displayName: 'New Delhi, NCR',
    latitude: 28.6139,
    longitude: 77.2090,
    source: 'preset',
  },
  {
    id: 'jaipur',
    name: 'Jaipur, Rajasthan',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    displayName: 'Jaipur, Rajasthan',
    latitude: 26.9124,
    longitude: 75.7873,
    source: 'preset',
  },
  {
    id: 'varanasi',
    name: 'Varanasi, Uttar Pradesh',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    displayName: 'Varanasi, Uttar Pradesh',
    latitude: 25.3176,
    longitude: 82.9739,
    source: 'preset',
  },
  {
    id: 'udaipur',
    name: 'Udaipur, Rajasthan',
    city: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    displayName: 'Udaipur, Rajasthan',
    latitude: 24.5854,
    longitude: 73.7125,
    source: 'preset',
  },
  {
    id: 'agra',
    name: 'Agra, Uttar Pradesh',
    city: 'Agra',
    state: 'Uttar Pradesh',
    country: 'India',
    displayName: 'Agra, Uttar Pradesh',
    latitude: 27.1767,
    longitude: 78.0081,
    source: 'preset',
  },
]

export const DEFAULT_DESTINATION: DestinationLocation = PRESET_DESTINATIONS[0] // Pimpri-Chinchwad / Jaipur

const LOCATION_STORAGE_KEY = 'yatrasetu_active_destination'

export function getSavedLocation(): DestinationLocation {
  try {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.latitude && parsed.longitude && parsed.displayName) {
        return {
          id: parsed.id || parsed.city.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: parsed.name || parsed.displayName,
          city: parsed.city,
          state: parsed.state || 'India',
          country: parsed.country || 'India',
          displayName: parsed.displayName,
          latitude: parsed.latitude,
          longitude: parsed.longitude,
          source: parsed.source || 'preset',
        }
      }
    }
  } catch (e) {
    console.warn('Could not read saved location', e)
  }
  // Default to Jaipur preset for established demo data or Pimpri-Chinchwad
  return PRESET_DESTINATIONS.find((p) => p.id === 'jaipur') || PRESET_DESTINATIONS[0]
}

export function saveLocation(loc: DestinationLocation): void {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc))
  } catch (e) {
    console.warn('Could not save location', e)
  }
}

/**
 * Normalized comparison helper to check if a location string matches an active destination.
 */
export function matchesDestination(itemLocation: string | undefined, activeCity: string): boolean {
  if (!itemLocation || !activeCity) return false
  const normItem = itemLocation.toLowerCase().replace(/[^a-z0-9]/g, ' ')
  const normCity = activeCity.toLowerCase().replace(/[^a-z0-9]/g, ' ')

  // Specific city aliases
  if (normCity.includes('pimpri') || normCity.includes('chinchwad')) {
    return (
      normItem.includes('pimpri') ||
      normItem.includes('chinchwad') ||
      normItem.includes('nigdi') ||
      normItem.includes('pcmc') ||
      normItem.includes('pradhikaran')
    )
  }

  if (normCity.includes('pune')) {
    // If Pune is active, avoid matching Pimpri-Chinchwad specific addresses unless needed
    return normItem.includes('pune') && !normItem.includes('pimpri') && !normItem.includes('chinchwad')
  }

  if (normCity.includes('delhi')) {
    return (
      normItem.includes('delhi') ||
      normItem.includes('ncr') ||
      normItem.includes('new delhi') ||
      normItem.includes('chandni chowk') ||
      normItem.includes('connaught place')
    )
  }

  if (normCity.includes('jaipur')) {
    return (
      normItem.includes('jaipur') ||
      normItem.includes('amber') ||
      normItem.includes('amer') ||
      normItem.includes('nahargarh') ||
      normItem.includes('pink city')
    )
  }

  if (normCity.includes('varanasi') || normCity.includes('kashi') || normCity.includes('banaras')) {
    return (
      normItem.includes('varanasi') ||
      normItem.includes('kashi') ||
      normItem.includes('banaras') ||
      normItem.includes('ghat') ||
      normItem.includes('sarnath')
    )
  }

  if (normCity.includes('udaipur')) {
    return (
      normItem.includes('udaipur') ||
      normItem.includes('pichola') ||
      normItem.includes('fateh sagar')
    )
  }

  if (normCity.includes('agra')) {
    return (
      normItem.includes('agra') ||
      normItem.includes('taj') ||
      normItem.includes('fatehpur')
    )
  }

  const cityTokens = normCity.split(' ').filter((t) => t.length > 2)
  return cityTokens.some((tok) => normItem.includes(tok))
}

/**
 * Reverse geocodes coordinates via OpenStreetMap Nominatim API with fallback.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<DestinationLocation> {
  const cacheKey = `geo_${lat.toFixed(3)}_${lon.toFixed(3)}`
  try {
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) return JSON.parse(cached)
  } catch {}

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'YatraSetu-SIH2026-TourismApp/1.0',
        },
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      const addr = data.address || {}
      const city = addr.city || addr.town || addr.municipality || addr.state_district || 'Local Area'
      const state = addr.state || 'India'
      const country = addr.country || 'India'
      const displayName = `${city}, ${state}`

      const loc: DestinationLocation = {
        id: city.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: displayName,
        city,
        state,
        country,
        displayName,
        latitude: lat,
        longitude: lon,
        source: 'gps',
      }

      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(loc))
      } catch {}

      return loc
    }
  } catch (err) {
    console.info('Reverse geocoding notice (using coordinate approximation):', err)
  }

  // Fallback if network fails
  return {
    id: `gps-${lat.toFixed(2)}-${lon.toFixed(2)}`,
    name: `Detected Area (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
    city: 'Detected Location',
    state: 'India',
    country: 'India',
    displayName: `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`,
    latitude: lat,
    longitude: lon,
    source: 'gps',
  }
}

/**
 * Searches destinations via Nominatim API with fallback to presets.
 */
export async function searchDestinationsOnline(query: string): Promise<DestinationLocation[]> {
  const q = query.trim().toLowerCase()
  if (!q) return PRESET_DESTINATIONS

  // Check presets first
  const matchedPresets = PRESET_DESTINATIONS.filter(
    (p) =>
      p.city.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q) ||
      p.displayName.toLowerCase().includes(q)
  )

  if (matchedPresets.length > 0) {
    return matchedPresets
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=5&countrycodes=in`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'YatraSetu-SIH2026-TourismApp/1.0',
        },
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      return data.map((item: any) => {
        const parts = item.display_name.split(',')
        const city = parts[0]?.trim() || query
        const state = parts[parts.length - 2]?.trim() || 'India'
        return {
          id: city.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: `${city}, ${state}`,
          city,
          state,
          country: 'India',
          displayName: `${city}, ${state}`,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          source: 'manual' as const,
        }
      })
    }
  } catch {}

  return matchedPresets
}
