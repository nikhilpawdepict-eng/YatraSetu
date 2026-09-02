// Statistical Demographic & Census Data Architecture for YatraSetu

export interface PopulationRecord {
  value: number | null
  formatted: string
  geographicArea: string
  year: number | null
  source: string | null
  isAvailable: boolean
}

// Authoritative census reference statistics for Indian municipal districts
const CENSUS_RECORDS: Record<string, PopulationRecord> = {
  jaipur: {
    value: 3046163,
    formatted: '3.05 Million',
    geographicArea: 'Jaipur Municipal Corporation',
    year: 2011,
    source: 'Census of India (Office of the Registrar General & Census Commissioner)',
    isAvailable: true,
  },
  pune: {
    value: 3124458,
    formatted: '3.12 Million',
    geographicArea: 'Pune Municipal Corporation (PMC)',
    year: 2011,
    source: 'Census of India (Office of the Registrar General & Census Commissioner)',
    isAvailable: true,
  },
  delhi: {
    value: 16787941,
    formatted: '16.79 Million',
    geographicArea: 'National Capital Territory of Delhi',
    year: 2011,
    source: 'Census of India (Office of the Registrar General & Census Commissioner)',
    isAvailable: true,
  },
  varanasi: {
    value: 1198491,
    formatted: '1.20 Million',
    geographicArea: 'Varanasi Municipal Corporation',
    year: 2011,
    source: 'Census of India (Office of the Registrar General & Census Commissioner)',
    isAvailable: true,
  },
}

/**
 * Retrieves authoritative statistical population data for a city/district.
 * Returns honest 'unavailable' status if statistical census data is not registered.
 */
export function getAuthoritativePopulation(cityName: string): PopulationRecord {
  const key = cityName.toLowerCase().trim()
  if (CENSUS_RECORDS[key]) {
    return CENSUS_RECORDS[key]
  }

  return {
    value: null,
    formatted: 'Population data unavailable',
    geographicArea: cityName,
    year: null,
    source: null,
    isAvailable: false,
  }
}
