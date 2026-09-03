import { MapMarkerItem } from '../components/InteractiveMap'

export interface CityDataset {
  city: string
  state: string
  center: [number, number]
  zoom: number
  landmarks: string[]
  markers: MapMarkerItem[]
  defaultRoute: {
    startName: string
    startCoords: [number, number]
    endName: string
    endCoords: [number, number]
    waypoints: [number, number][]
    trafficStatus: 'fast' | 'moderate' | 'heavy'
    distance: string
    duration: string
    steps: { instruction: string; distance: string; traffic: 'fast' | 'moderate' | 'heavy' }[]
  }
}

export const DESTINATION_DATASETS: Record<string, CityDataset> = {
  jaipur: {
    city: 'Jaipur',
    state: 'Rajasthan',
    center: [26.9124, 75.7873],
    zoom: 13,
    landmarks: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Panna Meena Kund', 'Nahargarh Fort', 'Jantar Mantar'],
    markers: [
      {
        id: 'jp-1',
        title: 'Amber Fort & Palace Complex',
        lat: 26.9855,
        lng: 75.8513,
        type: 'attraction',
        subtitle: '16th-century hilltop palace • Open 8 AM – 5:30 PM',
        badge: 'Top Attraction',
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&h=250&fit=crop&auto=format',
      },
      {
        id: 'jp-2',
        title: 'Panna Meena ka Kund (Hidden Gem)',
        lat: 26.9868,
        lng: 75.8542,
        type: 'attraction',
        subtitle: 'Symmetrical geometric stepwell • Quiet morning spot',
        badge: 'Hidden Gem',
        image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=400&h=250&fit=crop&auto=format',
      },
      {
        id: 'jp-3',
        title: 'Rajwada Courtyard Haveli Stay',
        lat: 26.9248,
        lng: 75.8234,
        type: 'homestay',
        subtitle: 'Heritage Courtyard with breakfast • ₹2,400/night',
        price: '₹2,400/night',
        badge: 'Verified Host',
        image: 'https://images.unsplash.com/photo-1643474003587-8bbf4bbc01d9?w=400&h=250&fit=crop&auto=format',
      },
      {
        id: 'jp-4',
        title: 'Hawa Mahal & Johari Bazaar Area',
        lat: 26.9239,
        lng: 75.8267,
        type: 'crowd',
        subtitle: 'Live Occupancy: 810/800 • Wait time: 35 min',
        crowdLevel: 'high',
        badge: 'Live Crowd: High',
      },
      {
        id: 'jp-5',
        title: 'Gaitore Royal Cenotaphs Trail',
        lat: 26.9365,
        lng: 75.8184,
        type: 'crowd',
        subtitle: 'Live Occupancy: 35/400 • Wait time: 0 min (Quiet)',
        crowdLevel: 'low',
        badge: '🟢 Low Rush Alternative',
      },
      {
        id: 'jp-6',
        title: 'Johari Bazaar Civic Cleanliness Point',
        lat: 26.9184,
        lng: 75.8172,
        type: 'issue',
        subtitle: 'Overflowing Bins near Ajmeri Gate (AI Priority: 94/100)',
        status: 'In Progress',
        badge: 'Civic Priority #1',
      },
      {
        id: 'jp-7',
        title: 'Jaipur North Tourist Police Station',
        lat: 26.9265,
        lng: 75.8211,
        type: 'emergency',
        subtitle: '24/7 Tourist Assistance Kiosk • 112 / 1363',
        badge: 'Police Safe Zone',
      },
    ],
    defaultRoute: {
      startName: 'Jaipur Railway Station / Central Hotel',
      startCoords: [26.9185, 75.7895],
      endName: 'Amber Fort & Panna Meena Kund',
      endCoords: [26.9855, 75.8513],
      waypoints: [
        [26.9185, 75.7895],
        [26.9239, 75.8267],
        [26.9535, 75.8432],
        [26.9855, 75.8513],
      ],
      trafficStatus: 'moderate',
      distance: '10.8 km',
      duration: '26 mins',
      steps: [
        { instruction: 'Head east on MI Road toward Ajmeri Gate', distance: '3.2 km', traffic: 'fast' },
        { instruction: 'Pass Hawa Mahal junction (Moderate Market Slowdown)', distance: '1.8 km', traffic: 'moderate' },
        { instruction: 'Continue on Amer Road alongside Jal Mahal Lake promenade', distance: '4.5 km', traffic: 'fast' },
        { instruction: 'Ascend historic ramp to Amber Fort Main Gateway (Jaleb Chowk)', distance: '1.3 km', traffic: 'moderate' },
      ],
    },
  },

  varanasi: {
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    center: [25.3176, 82.9739],
    zoom: 14,
    landmarks: ['Kashi Vishwanath Temple', 'Dashashwamedh Ghat', 'Assi Ghat', 'Manikarnika Ghat', 'Sarnath Sanctuary'],
    markers: [
      {
        id: 'vn-1',
        title: 'Kashi Vishwanath Corridor & Sanctum',
        lat: 25.3109,
        lng: 83.0107,
        type: 'attraction',
        subtitle: 'Ancient Jyotirlinga & Riverfront Corridor',
        badge: 'Top Sacred Sight',
        image: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?w=400&h=250&fit=crop&auto=format',
      },
      {
        id: 'vn-2',
        title: 'Ganga View Sanskriti Haveli Stay',
        lat: 25.2954,
        lng: 83.0068,
        type: 'homestay',
        subtitle: 'Riverfront balcony with morning Aarti • ₹2,200/night',
        price: '₹2,200/night',
        badge: 'Verified Host',
      },
      {
        id: 'vn-3',
        title: 'Dashashwamedh Ghat Evening Aarti Arena',
        lat: 25.3075,
        lng: 83.0105,
        type: 'crowd',
        subtitle: 'Current Density: High (1,450 devotees) • Surge Alert',
        crowdLevel: 'high',
        badge: 'Live Crowd: High',
      },
      {
        id: 'vn-4',
        title: 'Chet Singh Ghat (Peaceful Retreat)',
        lat: 25.2988,
        lng: 83.0072,
        type: 'crowd',
        subtitle: 'Current Density: Low (65 devotees) • Quiet Sunset Spot',
        crowdLevel: 'low',
        badge: '🟢 Low Rush Alternative',
      },
      {
        id: 'vn-5',
        title: 'Ghat Steps Cleanliness Drive Zone',
        lat: 25.3045,
        lng: 83.0092,
        type: 'issue',
        subtitle: 'Flower Offerings Bio-waste Collection (AI Score: 88/100)',
        status: 'In Progress',
        badge: 'Cleanliness Action',
      },
      {
        id: 'vn-6',
        title: 'Godowlia Tourist Police & Medical Kiosk',
        lat: 25.3092,
        lng: 83.0045,
        type: 'emergency',
        subtitle: '24/7 Pilgrim First-Aid & Helpline 112',
        badge: 'Safe Zone',
      },
    ],
    defaultRoute: {
      startName: 'Varanasi Cantt Station / Hotel',
      startCoords: [25.3283, 82.9868],
      endName: 'Kashi Vishwanath Temple & Dashashwamedh Ghat',
      endCoords: [25.3109, 83.0107],
      waypoints: [
        [25.3283, 82.9868],
        [25.3185, 82.9972],
        [25.3109, 83.0107],
      ],
      trafficStatus: 'moderate',
      distance: '4.6 km',
      duration: '18 mins',
      steps: [
        { instruction: 'Head south on Vidyapeeth Road toward Godowlia Crossing', distance: '2.4 km', traffic: 'fast' },
        { instruction: 'Pedestrianize near Godowlia Chowk (E-Rickshaw & Walking Corridor)', distance: '1.5 km', traffic: 'moderate' },
        { instruction: 'Enter Kashi Vishwanath Gate #4 Pilgrimage Corridor', distance: '700 m', traffic: 'fast' },
      ],
    },
  },

  pune: {
    city: 'Pune',
    state: 'Maharashtra',
    center: [18.5204, 73.8567],
    zoom: 13,
    landmarks: ['Shaniwar Wada', 'Aga Khan Palace', 'Sinhagad Fort', 'Dagdusheth Ganpati', 'FC Road Promenade'],
    markers: [
      {
        id: 'pn-1',
        title: 'Shaniwar Wada Historical Fort',
        lat: 18.5196,
        lng: 73.8553,
        type: 'attraction',
        subtitle: '18th-century seat of the Peshwa rulers',
        badge: 'Heritage Monument',
      },
      {
        id: 'pn-2',
        title: 'Aga Khan Palace & Gandhi Memorial',
        lat: 18.5524,
        lng: 73.9015,
        type: 'attraction',
        subtitle: 'Italian arches & tranquil gardens',
        badge: 'National Heritage',
      },
      {
        id: 'pn-3',
        title: 'Dagdusheth Halwai Ganpati Temple',
        lat: 18.5165,
        lng: 73.8562,
        type: 'crowd',
        subtitle: 'Live Occupancy: 620 devotees • Wait time: 20 min',
        crowdLevel: 'medium',
        badge: 'Live Crowd: Moderate',
      },
      {
        id: 'pn-4',
        title: 'Maratha Wada Homestay Haveli',
        lat: 18.5142,
        lng: 73.8512,
        type: 'homestay',
        subtitle: 'Traditional wooden pillars & Maharashtrian meals • ₹1,950',
        price: '₹1,950/night',
        badge: 'Verified Host',
      },
      {
        id: 'pn-5',
        title: 'Deccan Gymkhana Tourist Police Post',
        lat: 18.5175,
        lng: 73.8415,
        type: 'emergency',
        subtitle: 'Emergency Help & 24/7 Police Patrol • 112',
        badge: 'Safe Zone',
      },
    ],
    defaultRoute: {
      startName: 'Pune Railway Station',
      startCoords: [18.5284, 73.8743],
      endName: 'Shaniwar Wada & Dagdusheth',
      endCoords: [18.5196, 73.8553],
      waypoints: [
        [18.5284, 73.8743],
        [18.5235, 73.8645],
        [18.5196, 73.8553],
      ],
      trafficStatus: 'fast',
      distance: '3.8 km',
      duration: '14 mins',
      steps: [
        { instruction: 'Head west on Sassoon Road toward J.M. Road', distance: '1.9 km', traffic: 'fast' },
        { instruction: 'Cross Shivaji Bridge toward Shaniwar Peth', distance: '1.4 km', traffic: 'fast' },
        { instruction: 'Arrive at Shaniwar Wada Delhi Gate', distance: '500 m', traffic: 'fast' },
      ],
    },
  },

  manali: {
    city: 'Manali',
    state: 'Himachal Pradesh',
    center: [32.2432, 77.1892],
    zoom: 13,
    landmarks: ['Hadimba Temple', 'Solang Valley', 'Old Manali Village', 'Jogini Waterfall Trail', 'Atal Tunnel'],
    markers: [
      {
        id: 'mn-1',
        title: 'Hadimba Devi Temple & Cedar Woods',
        lat: 32.2483,
        lng: 77.1804,
        type: 'attraction',
        subtitle: '1553 wooden pagoda temple in cedar forest',
        badge: 'Must Visit',
      },
      {
        id: 'mn-2',
        title: 'Himalayan Cedar Wood Homestay',
        lat: 32.2534,
        lng: 77.1765,
        type: 'homestay',
        subtitle: 'Snow-capped peak views with home-cooked Siddu • ₹2,100',
        price: '₹2,100/night',
        badge: 'Verified Host',
      },
      {
        id: 'mn-3',
        title: 'Mall Road Central Square',
        lat: 32.2396,
        lng: 77.1887,
        type: 'crowd',
        subtitle: 'Live Density: High (890 tourists) • Evening Rush',
        crowdLevel: 'high',
        badge: 'Live Crowd: High',
      },
      {
        id: 'mn-4',
        title: 'Jogini Falls Secluded Trail',
        lat: 32.2685,
        lng: 77.1954,
        type: 'crowd',
        subtitle: 'Live Density: Low (40 hikers) • Refreshing & Peaceful',
        crowdLevel: 'low',
        badge: '🟢 Low Rush Alternative',
      },
      {
        id: 'mn-5',
        title: 'Manali Tourist Police Command & Rescue Station',
        lat: 32.2412,
        lng: 77.1895,
        type: 'emergency',
        subtitle: 'Mountain Rescue, Weather Advisory & Helpline 112',
        badge: 'Safe Zone',
      },
    ],
    defaultRoute: {
      startName: 'Manali Mall Road Bus Terminal',
      startCoords: [32.2396, 77.1887],
      endName: 'Hadimba Temple & Old Manali',
      endCoords: [32.2483, 77.1804],
      waypoints: [
        [32.2396, 77.1887],
        [32.2445, 77.1845],
        [32.2483, 77.1804],
      ],
      trafficStatus: 'fast',
      distance: '2.5 km',
      duration: '10 mins',
      steps: [
        { instruction: 'Head northwest up Hadimba Temple Road', distance: '1.2 km', traffic: 'fast' },
        { instruction: 'Follow pine forest hairpin curve', distance: '900 m', traffic: 'fast' },
        { instruction: 'Arrive at Hadimba Temple Sanctuary Entrance', distance: '400 m', traffic: 'fast' },
      ],
    },
  },

  delhi: {
    city: 'Delhi',
    state: 'Delhi NCR',
    center: [28.6139, 77.2090],
    zoom: 13,
    landmarks: ['Qutub Minar', 'Humayun’s Tomb', 'India Gate', 'Red Fort', 'Lotus Temple'],
    markers: [
      {
        id: 'dl-1',
        title: 'Humayun’s Tomb & Charbagh Garden',
        lat: 28.5933,
        lng: 77.2507,
        type: 'attraction',
        subtitle: 'UNESCO World Heritage Mughal Masterpiece',
        badge: 'UNESCO Heritage',
      },
      {
        id: 'dl-2',
        title: 'India Gate & Kartavya Path',
        lat: 28.6129,
        lng: 77.2295,
        type: 'crowd',
        subtitle: 'Live Occupancy: Moderate (650 visitors)',
        crowdLevel: 'medium',
        badge: 'Live Crowd: Moderate',
      },
      {
        id: 'dl-3',
        title: 'Heritage Nizamuddin Basti Homestay',
        lat: 28.5912,
        lng: 77.2435,
        type: 'homestay',
        subtitle: 'Cultural Sufi music evenings & Mughlai dining • ₹2,600',
        price: '₹2,600/night',
        badge: 'Verified Host',
      },
      {
        id: 'dl-4',
        title: 'Connaught Place Tourist Police Kiosk',
        lat: 28.6315,
        lng: 77.2167,
        type: 'emergency',
        subtitle: '24/7 Tourist Assistance • 112 / 1363',
        badge: 'Safe Zone',
      },
    ],
    defaultRoute: {
      startName: 'New Delhi Railway Station / Connaught Place',
      startCoords: [28.6428, 77.2195],
      endName: 'Humayun’s Tomb & Nizamuddin',
      endCoords: [28.5933, 77.2507],
      waypoints: [
        [28.6428, 77.2195],
        [28.6129, 77.2295],
        [28.5933, 77.2507],
      ],
      trafficStatus: 'moderate',
      distance: '7.8 km',
      duration: '22 mins',
      steps: [
        { instruction: 'Head south on Janpath toward Rajpath / Kartavya Path', distance: '3.1 km', traffic: 'fast' },
        { instruction: 'Pass India Gate C-Hexagon (Moderate traffic merge)', distance: '2.2 km', traffic: 'moderate' },
        { instruction: 'Continue on Mathura Road to Humayun Tomb Entry Gate', distance: '2.5 km', traffic: 'fast' },
      ],
    },
  },
}

export function getCityDataset(city: string): CityDataset {
  const norm = (city || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  for (const key of Object.keys(DESTINATION_DATASETS)) {
    if (norm.includes(key) || key.includes(norm)) {
      return DESTINATION_DATASETS[key]
    }
  }

  // Generic Dynamic Dataset for any city in India
  return {
    city,
    state: 'India',
    center: [26.9124, 75.7873],
    zoom: 13,
    landmarks: [`${city} Historic Core`, 'Central Promenade', 'Heritage Temple', 'Local Cultural Bazaar'],
    markers: [
      {
        id: `gen-1`,
        title: `${city} Historic Core & Palace`,
        lat: 26.9124 + 0.008,
        lng: 75.7873 + 0.006,
        type: 'attraction',
        subtitle: 'Main heritage attraction with audio guides',
        badge: 'Top Attraction',
      },
      {
        id: `gen-2`,
        title: `${city} Heritage Haveli Homestay`,
        lat: 26.9124 - 0.006,
        lng: 75.7873 + 0.009,
        type: 'homestay',
        subtitle: 'Authentic local stay with home-cooked breakfast • ₹2,200',
        price: '₹2,200/night',
        badge: 'Verified Host',
      },
      {
        id: `gen-3`,
        title: `${city} Central Market Hub`,
        lat: 26.9124 - 0.004,
        lng: 75.7873 - 0.005,
        type: 'crowd',
        subtitle: 'Live Density: Moderate (410 people) • Wait: 12 min',
        crowdLevel: 'medium',
        badge: 'Live Crowd: Moderate',
      },
      {
        id: `gen-4`,
        title: `${city} Tourist Police Station & Medical Centre`,
        lat: 26.9124 + 0.002,
        lng: 75.7873 + 0.003,
        type: 'emergency',
        subtitle: '24/7 Tourist Emergency Help Desk • 112 / 1363',
        badge: 'Safe Zone',
      },
    ],
    defaultRoute: {
      startName: `${city} Central Station / Hotel`,
      startCoords: [26.9124, 75.7873],
      endName: `${city} Historic Core & Temple`,
      endCoords: [26.9124 + 0.008, 75.7873 + 0.006],
      waypoints: [
        [26.9124, 75.7873],
        [26.9124 + 0.004, 75.7873 + 0.003],
        [26.9124 + 0.008, 75.7873 + 0.006],
      ],
      trafficStatus: 'fast',
      distance: '3.4 km',
      duration: '12 mins',
      steps: [
        { instruction: `Head north from ${city} central toward heritage road`, distance: '1.8 km', traffic: 'fast' },
        { instruction: `Turn right onto Main Heritage Corridor`, distance: '1.1 km', traffic: 'fast' },
        { instruction: `Arrive at ${city} Historic Core entrance`, distance: '500 m', traffic: 'fast' },
      ],
    },
  }
}
