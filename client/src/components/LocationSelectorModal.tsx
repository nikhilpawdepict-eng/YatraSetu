import React, { useState } from 'react'
import Modal from './ui/Modal'
import {
  PRESET_DESTINATIONS,
  type DestinationLocation,
  searchDestinationsOnline,
} from '../services/locationService'
import { useApp } from '../context/AppContext'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function LocationSelectorModal({ isOpen, onClose }: Props) {
  const { currentLocation, setCurrentLocation, requestBrowserLocation, showToast } = useApp()
  const [search, setSearch] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [searchResults, setSearchResults] = useState<DestinationLocation[]>(PRESET_DESTINATIONS)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    if (!val.trim()) {
      setSearchResults(PRESET_DESTINATIONS)
      return
    }

    setIsSearching(true)
    const results = await searchDestinationsOnline(val)
    setSearchResults(results)
    setIsSearching(false)
  }

  const handleSelect = (dest: DestinationLocation) => {
    setCurrentLocation(dest)
    showToast(`Destination switched to ${dest.displayName}! Weather & places updated.`, 'success')
    onClose()
  }

  const handleUseGPS = async () => {
    setIsLocating(true)
    try {
      await requestBrowserLocation()
      onClose()
    } catch {
      // already handled with toast in context
    } finally {
      setIsLocating(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Destination & Region"
      icon="📍"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* GPS Current Location Option */}
        <button
          onClick={handleUseGPS}
          disabled={isLocating}
          className="w-full p-3.5 rounded-2xl bg-[#E4F3EF] border border-[#0F6E5C]/30 hover:bg-[#d5ebe5] transition-all flex items-center justify-between group cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F6E5C] text-white flex items-center justify-center text-lg shadow-xs">
              {isLocating ? '⏳' : '🎯'}
            </div>
            <div>
              <p className="font-700 text-sm text-[#0F6E5C]">
                {isLocating ? 'Detecting GPS Coordinates...' : 'Use My Current Location'}
              </p>
              <p className="text-xs text-[#4B5551]">
                Real-time Open-Meteo weather & OpenStreetMap POIs for your area
              </p>
            </div>
          </div>
          <span className="text-xs font-700 text-[#0F6E5C] group-hover:translate-x-0.5 transition-transform">
            Auto-Detect →
          </span>
        </button>

        {/* Search Input */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#7B8582]">🔍</span>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search any Indian city, tourist circuit, or district..."
            className="w-full h-11 pl-9 pr-3 rounded-xl border border-[#E4E7E5] text-xs md:text-sm text-[#141B18] placeholder-[#7B8582] focus:outline-none focus:border-[#0F6E5C]"
          />
          {isSearching && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7B8582] animate-spin">
              ⌛
            </span>
          )}
        </div>

        {/* Preset & Matched Destinations */}
        <div>
          <p className="text-[11px] font-700 uppercase tracking-wide text-[#7B8582] mb-2">
            {search ? 'Matching Locations' : 'Popular Tourism Circuits'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-hide">
            {searchResults.map((dest) => {
              const isCurrent =
                currentLocation.city.toLowerCase() === dest.city.toLowerCase() &&
                currentLocation.state.toLowerCase() === dest.state.toLowerCase()

              return (
                <button
                  key={`${dest.city}-${dest.state}`}
                  onClick={() => handleSelect(dest)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'border-[#0F6E5C] bg-[#E4F3EF]/60 shadow-xs'
                      : 'border-[#E4E7E5] bg-white hover:border-[#0F6E5C]/40 hover:bg-[#F7F6F2]'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-700 text-xs text-[#141B18] truncate">{dest.displayName}</p>
                    <p className="text-[10px] text-[#7B8582]">
                      Lat {dest.latitude.toFixed(2)}, Lon {dest.longitude.toFixed(2)}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] bg-[#0F6E5C] text-white px-2 py-0.5 rounded-full font-bold">
                      Active
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Data attribution footer */}
        <p className="text-[10px] text-[#7B8582] text-center pt-2 border-t border-[#E4E7E5]">
          Live Geocoding © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">OpenStreetMap</a> contributors · Weather powered by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline">Open-Meteo</a>
        </p>
      </div>
    </Modal>
  )
}
