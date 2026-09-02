// Real Weather Service using Open-Meteo Public Weather API

export interface RealWeatherData {
  temperature: number
  apparentTemperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  weatherCode: number
  weatherDescription: string
  weatherIcon: string
  isLive: boolean
  dataSource: 'Open-Meteo API (Live)' | 'Cached Live Data' | 'Simulated / Fallback'
  dailyForecast?: {
    maxTemp: number
    minTemp: number
    precipitationProbability: number
    weatherDescription: string
  }
}

// WMO Weather Interpretation Codes (WW)
const WMO_CODE_MAP: Record<number, { description: string; icon: string }> = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Foggy', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Moderate drizzle', icon: '🌦️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  61: { description: 'Slight rain', icon: '🌧️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  71: { description: 'Slight snow fall', icon: '🌨️' },
  73: { description: 'Moderate snow fall', icon: '🌨️' },
  75: { description: 'Heavy snow fall', icon: '❄️' },
  80: { description: 'Slight rain showers', icon: '🌦️' },
  81: { description: 'Moderate rain showers', icon: '🌧️' },
  82: { description: 'Violent rain showers', icon: '⛈️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
}

const WEATHER_CACHE_KEY_PREFIX = 'yatrasetu_weather_'
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes

export async function fetchRealWeather(lat: number, lon: number): Promise<RealWeatherData> {
  const cacheKey = `${WEATHER_CACHE_KEY_PREFIX}${lat.toFixed(2)}_${lon.toFixed(2)}`

  // Check cached data
  try {
    const cachedItem = sessionStorage.getItem(cacheKey)
    if (cachedItem) {
      const { timestamp, data } = JSON.parse(cachedItem)
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        return {
          ...data,
          isLive: true,
          dataSource: 'Cached Live Data',
        }
      }
    }
  } catch (e) {
    console.warn('Weather cache read notice', e)
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4500)

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}`)
    }

    const json = await res.json()
    const current = json.current || {}
    const daily = json.daily || {}

    const code = current.weather_code ?? 0
    const wmo = WMO_CODE_MAP[code] || { description: 'Fair', icon: '🌤️' }

    const dailyCode = daily.weather_code?.[0] ?? code
    const dailyWmo = WMO_CODE_MAP[dailyCode] || wmo

    const weatherData: RealWeatherData = {
      temperature: Math.round(current.temperature_2m ?? 30),
      apparentTemperature: Math.round(current.apparent_temperature ?? 32),
      humidity: Math.round(current.relative_humidity_2m ?? 50),
      precipitation: current.precipitation ?? 0,
      windSpeed: Math.round(current.wind_speed_10m ?? 8),
      weatherCode: code,
      weatherDescription: wmo.description,
      weatherIcon: wmo.icon,
      isLive: true,
      dataSource: 'Open-Meteo API (Live)',
      dailyForecast: {
        maxTemp: Math.round(daily.temperature_2m_max?.[0] ?? (current.temperature_2m + 3)),
        minTemp: Math.round(daily.temperature_2m_min?.[0] ?? (current.temperature_2m - 5)),
        precipitationProbability: Math.round(daily.precipitation_probability_max?.[0] ?? 10),
        weatherDescription: dailyWmo.description,
      },
    }

    // Cache valid data
    try {
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ timestamp: Date.now(), data: weatherData })
      )
    } catch {}

    return weatherData
  } catch (err) {
    console.info('Open-Meteo API notice (using fallback weather model):', err)

    // Honest Fallback
    return {
      temperature: 31,
      apparentTemperature: 33,
      humidity: 48,
      precipitation: 0,
      windSpeed: 10,
      weatherCode: 2,
      weatherDescription: 'Partly Cloudy',
      weatherIcon: '⛅',
      isLive: false,
      dataSource: 'Simulated / Fallback',
      dailyForecast: {
        maxTemp: 34,
        minTemp: 26,
        precipitationProbability: 15,
        weatherDescription: 'Partly Cloudy',
      },
    }
  }
}
