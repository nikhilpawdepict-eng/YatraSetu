import React, { useState } from 'react'
import GoogleMapView, { GooglePlaceInfo } from './maps/GoogleMapView'
import MockMap from './MockMap'
import { MapPin, Sparkles, Navigation, Globe } from 'lucide-react'

export interface MapMarkerItem {
  id: string
  title: string
  lat: number
  lng: number
  type: 'attraction' | 'homestay' | 'crowd' | 'issue' | 'emergency'
  subtitle?: string
  badge?: string
  status?: string
  price?: string
  crowdLevel?: 'low' | 'medium' | 'high'
  image?: string
}

interface Props {
  center?: [number, number]
  zoom?: number
  items?: MapMarkerItem[]
  height?: string
  title?: string
  showFilters?: boolean
  showRouteFinder?: boolean
  onItemSelect?: (item: MapMarkerItem) => void
}

class MapErrorBoundary extends React.Component<{ fallbackSpots: any[]; title?: string }, { hasError: boolean }> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: any) {
    console.error('Map Rendering Fallback Triggered:', error)
  }

  render() {
    if (this.state.hasError) {
      return <MockMap spots={this.props.fallbackSpots} title={this.props.title} />
    }
    return this.props.children
  }
}

export default function InteractiveMap({
  center = [26.9124, 75.7873],
  zoom = 13,
  items,
  height = '520px',
  title = 'Live Tourism Intelligence & Google Maps Platform',
  showFilters = true,
  showRouteFinder = true,
  onItemSelect,
}: Props) {
  const googleCenter = { lat: center[0], lng: center[1] }

  const fallbackSpots = [
    { id: '1', name: 'Historic Fort & Sanctuary', x: 30, y: 40, count: 420, level: 'medium' as const },
    { id: '2', name: 'Central Heritage Bazaar', x: 60, y: 55, count: 850, level: 'high' as const },
    { id: '3', name: 'Stepwell Eco-Resort', x: 75, y: 25, count: 120, level: 'low' as const },
  ]

  const handlePlaceSelected = (place: GooglePlaceInfo) => {
    if (onItemSelect) {
      onItemSelect({
        id: place.placeId || String(Date.now()),
        title: place.name,
        lat: place.lat,
        lng: place.lng,
        type: 'attraction',
        subtitle: place.address,
        image: place.photoUrl,
      })
    }
  }

  return (
    <div className="w-full">
      <MapErrorBoundary fallbackSpots={fallbackSpots} title={title}>
        <GoogleMapView
          center={googleCenter}
          zoom={zoom}
          items={items}
          height={height}
          title={title}
          showSearch={true}
          showDirections={showRouteFinder}
          onPlaceSelected={handlePlaceSelected}
        />
      </MapErrorBoundary>
    </div>
  )
}
