export type UserRole = 'user' | 'local' | 'authority'

export interface UserSession {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string
  phone?: string
  location?: string
  speciality?: string
}

export interface CleanlinessReport {
  id: string
  rank: number
  medal?: string
  name: string
  location: string
  votes: number
  impact: 'High' | 'Medium' | 'Low'
  evidence: string[] // data URLs or image URLs
  comments: string[]
  userSolutions: string[]
  authorityResponse: string | null
  currentStatus: 'Open' | 'In Progress' | 'Resolved'
  reportedBy?: string
  reportedAt: string
  description?: string
  hasUpvoted?: boolean
}

export interface BookingRequest {
  id: string
  serviceId: string
  serviceName: string
  serviceType: 'Homestay' | 'Guide Tour' | 'Artisanal Craft'
  userId: string
  userName: string
  userLocation: string
  userAvatar: string
  date: string
  guests: number
  price: string
  message: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
}

export interface HomestayListing {
  id: string
  name: string
  image: string
  rating: number
  location: string
  priceNumber: number
  price: string
  available: boolean
  description: string
  facilities: string[]
  contactImg: string
  hostName: string
  availableDates?: string[]
}

export interface GuideListing {
  id: string
  name: string
  photo: string
  verified: boolean
  rating: number
  location: string
  languages: string[]
  speciality: string
  places: string[]
  priceNumber: number
  price: string
  priceUnit: string
  available: boolean
  tours: number
  availableDates?: string[]
}

export interface ProductListing {
  id: string
  name: string
  image: string
  priceNumber: number
  price: string
  rating: number
  material: string
  durability: string
  category: string
  seller: string
  location: string
  contact: string
  stock: number
}

export interface CrowdSpot {
  id: string
  name: string
  location: string
  date: string
  time: string
  open: boolean
  count: number
  density: 'High' | 'Moderate' | 'Low' | 'Closed'
  densityLevel: 'high' | 'medium' | 'low' | 'closed'
  trend: '↑ Rising' | '→ Stable' | '↓ Declining' | '— N/A'
  capacity: number
  waitTime: string
  mapX: number
  mapY: number
  festival?: string
}

export interface EmergencyAlert {
  id: string
  type: string
  message: string
  severity: 'high' | 'medium' | 'low'
  time: string
  icon: string
  location: string
}

export interface EmergencyService {
  id: string
  type: string
  name: string
  address: string
  distance: string
  contact: string
  category: 'Police' | 'Hospital' | 'Fire'
  location: string
}

// Initial seed data
export const initialCleanlinessReports: CleanlinessReport[] = [
  {
    id: '1',
    rank: 1,
    medal: '🥇',
    name: 'Overflowing Garbage near Sadar Bazar',
    location: 'Sadar Bazar, Jaipur',
    votes: 248,
    impact: 'High',
    evidence: [
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format',
    ],
    comments: ['It has been overflowing for 3 days now', 'Health hazard for nearby shopkeepers and visiting tourists'],
    userSolutions: ['Increase garbage collection frequency to twice daily', 'Install compactor units at marketplace junctions'],
    authorityResponse: 'Acknowledged. Municipal sanitation team scheduled for deployment.',
    currentStatus: 'In Progress',
    reportedBy: 'Aarav Sharma',
    reportedAt: '2025-08-23 09:30 AM',
    description: 'Multiple overflowing bins near the main market. Civic workers have not collected in 3 days. Health hazard for 500+ shopkeepers.',
  },
  {
    id: '2',
    rank: 2,
    medal: '🥈',
    name: 'Dirty Public Toilets at Chowk Market',
    location: 'Chowk Market, Jaipur',
    votes: 186,
    impact: 'High',
    evidence: ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=300&fit=crop&auto=format'],
    comments: ['Unusable condition since last week', 'Tourists are facing major issues, needs urgent plumbing repair'],
    userSolutions: ['Contract professional cleaning agency', 'Install sensor-activated flush systems'],
    authorityResponse: null,
    currentStatus: 'Open',
    reportedBy: 'Meera Rajput',
    reportedAt: '2025-08-24 11:15 AM',
    description: 'Public toilets at Chowk Market have not been cleaned for a week. Water supply is absent. Tourists are extremely inconvenienced.',
  },
  {
    id: '3',
    rank: 3,
    medal: '🥉',
    name: 'Plastic Waste at Lake Shore',
    location: 'Man Sagar Lake, Jaipur',
    votes: 121,
    impact: 'Medium',
    evidence: ['https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400&h=300&fit=crop&auto=format'],
    comments: ['Affecting water quality and local birds', 'Lake is a major tourist attraction — urgent cleanup needed'],
    userSolutions: ['Organise community clean-up drives', 'Ban single-use plastics in 500m radius around Jal Mahal'],
    authorityResponse: 'Community clean-up drive completed on 22 Aug. Plastic ban notification issued.',
    currentStatus: 'Resolved',
    reportedBy: 'Rajesh Verma',
    reportedAt: '2025-08-21 04:45 PM',
    description: 'Excessive plastic bottles and snack wrappers accumulating along the shoreline near viewing points.',
  },
  {
    id: '4',
    rank: 4,
    medal: '4',
    name: 'Water Stagnation in Canal Area',
    location: 'Amanishah Nala, Jaipur',
    votes: 96,
    impact: 'High',
    evidence: [],
    comments: ['Mosquito breeding hotspot near tourist transit road', 'Industrial discharge reported'],
    userSolutions: ['CCTV monitoring for illegal discharge', 'Sewage treatment plant upgrade'],
    authorityResponse: null,
    currentStatus: 'Open',
    reportedBy: 'Kunal Joshi',
    reportedAt: '2025-08-25 08:00 AM',
    description: 'Stagnant wastewater generating unpleasant odor along the western connecting road.',
  },
  {
    id: '5',
    rank: 5,
    medal: '5',
    name: 'Inadequate Waste Bins at Fort Ascent',
    location: 'Nahargarh Road, Jaipur',
    votes: 78,
    impact: 'Medium',
    evidence: [],
    comments: ['Tourists discarding water bottles along the trekking route'],
    userSolutions: ['Install eco-friendly bamboo dustbins every 100 meters', 'Awareness boards in Hindi and English'],
    authorityResponse: null,
    currentStatus: 'Open',
    reportedBy: 'Pooja Verma',
    reportedAt: '2025-08-25 09:20 AM',
    description: 'Trekking path leading to sunset point lacks waste disposal bins.',
  },
]

export const initialHomestays: HomestayListing[] = [
  {
    id: '1',
    name: 'Rajwada Heritage Home',
    image: 'https://images.unsplash.com/photo-1643474003587-8bbf4bbc01d9?w=600&h=400&fit=crop&auto=format',
    rating: 4.8,
    location: 'Old City, Jaipur',
    priceNumber: 2800,
    price: '₹2,800',
    available: true,
    description: 'A beautifully restored 19th-century haveli with intricate frescoes, courtyard garden, and home-cooked Rajasthani meals.',
    facilities: ['WiFi', 'AC', 'Home Kitchen', 'Courtyard', 'Heritage Tour', 'Breakfast Included'],
    contactImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format',
    hostName: 'Arjun Mehta',
    availableDates: ['2025-08-25', '2025-08-26', '2025-08-27', '2025-08-28', '2025-08-29', '2025-08-30'],
  },
  {
    id: '2',
    name: 'Ghats View Villa',
    image: 'https://images.unsplash.com/photo-1696371270675-c4c522d6eb94?w=600&h=400&fit=crop&auto=format',
    rating: 4.7,
    location: 'Assi Ghat, Varanasi',
    priceNumber: 2200,
    price: '₹2,200',
    available: true,
    description: 'Wake up to the sounds of morning prayers and the Ganges. Traditional rooms with terrace views of the sacred ghats.',
    facilities: ['River View', 'Yoga', 'Breakfast Included', 'Boat Tours', 'WiFi'],
    contactImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format',
    hostName: 'Devendra Pandey',
    availableDates: ['2025-08-25', '2025-08-26', '2025-08-29', '2025-08-30', '2025-08-31'],
  },
  {
    id: '3',
    name: 'Lakeside Retreat',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&h=400&fit=crop&auto=format',
    rating: 4.9,
    location: 'Fateh Sagar, Udaipur',
    priceNumber: 3500,
    price: '₹3,500',
    available: false,
    description: 'Luxury lake-facing rooms with sunset views, pool access, and curated dining experiences in the City of Lakes.',
    facilities: ['Lake View', 'Pool', 'Spa', 'Fine Dining', 'Sunset Lounge'],
    contactImg: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format',
    hostName: 'Sunita Rathore',
    availableDates: ['2025-09-05', '2025-09-06', '2025-09-07'],
  },
  {
    id: '4',
    name: 'Hill Station Cottage',
    image: 'https://images.unsplash.com/photo-1566915682737-3e97a7eed93b?w=600&h=400&fit=crop&auto=format',
    rating: 4.5,
    location: 'Old Manali, Himachal Pradesh',
    priceNumber: 1800,
    price: '₹1,800',
    available: true,
    description: 'Cosy wooden cottage surrounded by apple orchards and Himalayan pines. Perfect for a quiet mountain escape.',
    facilities: ['Mountain View', 'Bonfire', 'Home Garden', 'Trekking Support', 'Fireplace'],
    contactImg: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=80&h=80&fit=crop&auto=format',
    hostName: 'Ravi Thakur',
    availableDates: ['2025-08-25', '2025-08-26', '2025-08-27', '2025-08-28', '2025-09-01'],
  },
]

export const initialGuides: GuideListing[] = [
  {
    id: '1',
    name: 'Arjun Mehta',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format',
    verified: true,
    rating: 4.9,
    location: 'Jaipur, Rajasthan',
    languages: ['Hindi', 'English', 'French'],
    speciality: 'Forts & Palaces Expert',
    places: ['Amber Fort', 'City Palace', 'Nahargarh', 'Jaigarh Fort', 'Hawa Mahal'],
    priceNumber: 1500,
    price: '₹1,500',
    priceUnit: 'per day',
    available: true,
    tours: 240,
    availableDates: ['2025-08-25', '2025-08-26', '2025-08-27', '2025-08-28', '2025-08-30'],
  },
  {
    id: '2',
    name: 'Priya Nair',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format',
    verified: true,
    rating: 4.8,
    location: 'Alleppey, Kerala',
    languages: ['Malayalam', 'English', 'German'],
    speciality: 'Backwaters & Village Culture',
    places: ['Vembanad Lake', 'Kumarakom', 'Alappuzha Beaches', 'Kuttanad'],
    priceNumber: 1800,
    price: '₹1,800',
    priceUnit: 'per day',
    available: true,
    tours: 312,
    availableDates: ['2025-08-25', '2025-08-27', '2025-08-28', '2025-08-31'],
  },
  {
    id: '3',
    name: 'Rahul Singh',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format',
    verified: false,
    rating: 4.6,
    location: 'Varanasi, Uttar Pradesh',
    languages: ['Hindi', 'English'],
    speciality: 'Ghats, Temples & Heritage Cuisine',
    places: ['Dashashwamedh Ghat', 'Kashi Vishwanath', 'Sarnath', 'Ramnagar Fort'],
    priceNumber: 1200,
    price: '₹1,200',
    priceUnit: 'per day',
    available: false,
    tours: 185,
    availableDates: ['2025-09-02', '2025-09-03', '2025-09-04'],
  },
  {
    id: '4',
    name: 'Kavya Reddy',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&auto=format',
    verified: true,
    rating: 4.7,
    location: 'Hyderabad, Telangana',
    languages: ['Telugu', 'Hindi', 'English'],
    speciality: 'Nizami Heritage & Food Trails',
    places: ['Charminar', 'Golconda Fort', 'Hussain Sagar', 'Old City Bazaars'],
    priceNumber: 1400,
    price: '₹1,400',
    priceUnit: 'per day',
    available: true,
    tours: 198,
    availableDates: ['2025-08-25', '2025-08-26', '2025-08-28', '2025-08-29'],
  },
]

export const initialProducts: ProductListing[] = [
  {
    id: '1',
    name: 'Blue Pottery Floral Vase',
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop&auto=format',
    priceNumber: 850,
    price: '₹850',
    rating: 4.7,
    material: 'Quartz Powder & Natural Glaze',
    durability: '10+ years',
    category: 'Pottery',
    seller: 'Jaipur Blue Pottery Guild',
    location: 'Sanganer, Jaipur',
    contact: '+91 98765 43210',
    stock: 18,
  },
  {
    id: '2',
    name: 'Banarasi Zari Silk Dupatta',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&h=400&fit=crop&auto=format',
    priceNumber: 2400,
    price: '₹2,400',
    rating: 4.9,
    material: '100% Pure Mulberry Silk & Zari',
    durability: 'Lifelong with care',
    category: 'Textiles',
    seller: 'Varanasi Master Weavers',
    location: 'Chowk, Varanasi',
    contact: '+91 97654 32109',
    stock: 12,
  },
  {
    id: '3',
    name: 'Madhubani Kohbar Tree of Life',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop&auto=format',
    priceNumber: 3200,
    price: '₹3,200',
    rating: 4.8,
    material: 'Natural Mineral Dyes on Hand-pressed Cotton Paper',
    durability: 'Archival heritage quality',
    category: 'Paintings',
    seller: 'Mithila Mahila Kalakar',
    location: 'Madhubani, Bihar',
    contact: '+91 96543 21098',
    stock: 6,
  },
  {
    id: '4',
    name: 'Hand-carved Sandalwood Elephant',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&h=400&fit=crop&auto=format',
    priceNumber: 1600,
    price: '₹1,600',
    rating: 4.6,
    material: 'Sustainably Harvested Sandalwood',
    durability: '25+ years aromatic scent',
    category: 'Woodwork',
    seller: 'Mysuru Woodcraft Artisans',
    location: 'Mysuru, Karnataka',
    contact: '+91 95432 10987',
    stock: 15,
  },
  {
    id: '5',
    name: 'Kashmiri Handspun Pashmina Shawl',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&auto=format',
    priceNumber: 5500,
    price: '₹5,500',
    rating: 5.0,
    material: '100% Grade-A Changthangi Pashmina',
    durability: 'Lifetime heirloom',
    category: 'Textiles',
    seller: 'Srinagar Craft Cooperative',
    location: 'Old Srinagar, J&K',
    contact: '+91 94321 09876',
    stock: 8,
  },
  {
    id: '6',
    name: 'Bidriware Inlaid Silver Box',
    image: 'https://images.unsplash.com/photo-1569587112025-0d460e81a126?w=400&h=400&fit=crop&auto=format',
    priceNumber: 2800,
    price: '₹2,800',
    rating: 4.7,
    material: 'Zinc-Copper Alloy with Pure Silver Inlay',
    durability: '20+ years lustrous finish',
    category: 'Handicrafts',
    seller: 'Bidar Heritage Guild',
    location: 'Bidar, Karnataka',
    contact: '+91 93210 98765',
    stock: 9,
  },
  {
    id: '7',
    name: 'Kundan Meenakari Jhumkas',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&h=400&fit=crop&auto=format',
    priceNumber: 1200,
    price: '₹1,200',
    rating: 4.5,
    material: 'Sterling Silver 925 with Enamel & Glass Kundan',
    durability: 'Long-lasting with dry storage',
    category: 'Jewellery',
    seller: 'Johari Bazar Jewel Craft',
    location: 'Jaipur, Rajasthan',
    contact: '+91 92109 87654',
    stock: 22,
  },
  {
    id: '8',
    name: 'Warli Canvas Folk Storytelling Art',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&auto=format',
    priceNumber: 1900,
    price: '₹1,900',
    rating: 4.6,
    material: 'Rice Paste Pigment on Mud-textured Canvas',
    durability: 'Permanent framed display',
    category: 'Paintings',
    seller: 'Sahyadri Tribal Art Collective',
    location: 'Dahanu, Maharashtra',
    contact: '+91 91098 76543',
    stock: 11,
  },
]

export const initialSpots: CrowdSpot[] = [
  {
    id: '1',
    name: 'Amber Fort',
    location: 'Amber, Jaipur',
    date: 'Wed, 2 Sep 2026',
    time: '10:30 AM',
    open: true,
    count: 420,
    density: 'High',
    densityLevel: 'high',
    trend: '↑ Rising',
    capacity: 500,
    waitTime: '25–35 min',
    mapX: 110,
    mapY: 80,
    festival: 'Teej Festival Pilgrimage',
  },
  {
    id: '2',
    name: 'City Palace Museum',
    location: 'Old City, Jaipur',
    date: 'Wed, 2 Sep 2026',
    time: '10:30 AM',
    open: true,
    count: 280,
    density: 'Moderate',
    densityLevel: 'medium',
    trend: '→ Stable',
    capacity: 400,
    waitTime: '10–15 min',
    mapX: 200,
    mapY: 140,
    festival: 'Gangaur Heritage Fair',
  },
  {
    id: '3',
    name: 'Jantar Mantar',
    location: 'Tripolia Bazar, Jaipur',
    date: 'Wed, 2 Sep 2026',
    time: '10:30 AM',
    open: true,
    count: 130,
    density: 'Low',
    densityLevel: 'low',
    trend: '↓ Declining',
    capacity: 300,
    waitTime: '2–5 min',
    mapX: 300,
    mapY: 100,
    festival: 'General Tourism',
  },
  {
    id: '4',
    name: 'Nahargarh Fort',
    location: 'Nahargarh Hills, Jaipur',
    date: 'Wed, 2 Sep 2026',
    time: '10:30 AM',
    open: true,
    count: 310,
    density: 'Moderate',
    densityLevel: 'medium',
    trend: '↑ Rising',
    capacity: 350,
    waitTime: '15–20 min',
    mapX: 165,
    mapY: 200,
    festival: 'Sunset Heritage Gathering',
  },
  {
    id: '5',
    name: 'Govind Dev Ji Temple',
    location: 'City Palace Complex, Jaipur',
    date: 'Wed, 2 Sep 2026',
    time: '10:30 AM',
    open: true,
    count: 480,
    density: 'High',
    densityLevel: 'high',
    trend: '↑ Rising',
    capacity: 550,
    waitTime: '30–45 min',
    mapX: 230,
    mapY: 120,
    festival: 'Janmashtami Aarti Special',
  },
  {
    id: '6',
    name: 'Hawa Mahal',
    location: 'Sirdeori Bazar, Jaipur',
    date: 'Wed, 2 Sep 2026',
    time: '10:30 AM',
    open: false,
    count: 0,
    density: 'Closed',
    densityLevel: 'closed',
    trend: '— N/A',
    capacity: 250,
    waitTime: 'Closed for maintenance',
    mapX: 320,
    mapY: 210,
    festival: 'General Tourism',
  },
]

export const initialAlerts: EmergencyAlert[] = [
  {
    id: '1',
    type: 'Crowd Warning',
    message: 'Amber Fort approaching maximum capacity. Long entry waiting times expected.',
    severity: 'high',
    time: '10:15 AM',
    icon: '👥',
    location: 'Amber Fort, Jaipur',
  },
  {
    id: '2',
    type: 'Traffic Warning',
    message: 'Heavy traffic on Agra Road due to VIP convoy. Use alternate routes via MI Road.',
    severity: 'medium',
    time: '9:45 AM',
    icon: '🚗',
    location: 'Agra Road, Jaipur',
  },
  {
    id: '3',
    type: 'Weather Advisory',
    message: 'Thunderstorm with gusty winds expected after 4 PM. Carry rain gear and avoid rooftop viewing decks.',
    severity: 'medium',
    time: '8:00 AM',
    icon: '⛈️',
    location: 'Jaipur District',
  },
  {
    id: '4',
    type: 'Temple Crowd Surge',
    message: 'Evening Aarti rush expected at Govind Dev Ji Temple between 6 PM–8 PM.',
    severity: 'high',
    time: '7:30 AM',
    icon: '🛕',
    location: 'Govind Dev Ji, Jaipur',
  },
]

export const initialServices: EmergencyService[] = [
  {
    id: '1',
    type: '🚔',
    name: 'Sadar Police Station & Tourist Assistance',
    address: 'Station Road, Sadar, Jaipur',
    distance: '1.2 km',
    contact: '+91-141-2744-901',
    category: 'Police',
    location: 'Jaipur, Rajasthan',
  },
  {
    id: '2',
    type: '🏥',
    name: 'SMS Government Multi-Speciality Hospital',
    address: 'JLN Marg, Ashok Nagar, Jaipur',
    distance: '2.8 km',
    contact: '+91-141-2518-701',
    category: 'Hospital',
    location: 'Jaipur, Rajasthan',
  },
  {
    id: '3',
    type: '🚒',
    name: 'Central Fire & Disaster Management Station',
    address: 'MI Road, Jaipur',
    distance: '1.7 km',
    contact: '+91-141-2740-101',
    category: 'Fire',
    location: 'Jaipur, Rajasthan',
  },
  {
    id: '4',
    type: '🚔',
    name: 'Amber Fort Tourist Police Post',
    address: 'Fort Main Gate, Amber, Jaipur',
    distance: '0.4 km',
    contact: '+91-141-2530-244',
    category: 'Police',
    location: 'Amber, Jaipur',
  },
]

export const initialBookingRequests: BookingRequest[] = [
  {
    id: '1',
    serviceId: '1',
    serviceName: 'Rajwada Heritage Home',
    serviceType: 'Homestay',
    userId: 'u101',
    userName: 'Pooja Sharma',
    userLocation: 'Mumbai, Maharashtra',
    userAvatar: '👩',
    date: 'Aug 28–30, 2025',
    guests: 2,
    price: '₹5,600',
    message: 'Hi! We are a couple visiting Jaipur for a heritage photography tour. Would love to stay with breakfast included.',
    status: 'pending',
    createdAt: '2025-08-25 09:10 AM',
  },
  {
    id: '2',
    serviceId: '1',
    serviceName: 'Heritage Forts & Palaces Tour',
    serviceType: 'Guide Tour',
    userId: 'u102',
    userName: 'Ravi Kulkarni',
    userLocation: 'Bengaluru, Karnataka',
    userAvatar: '👨',
    date: 'Aug 26, 2025',
    guests: 1,
    price: '₹1,500',
    message: 'Solo traveller visiting for a day. Looking for an in-depth historical tour of Amber and Jaigarh forts.',
    status: 'accepted',
    createdAt: '2025-08-25 08:30 AM',
  },
  {
    id: '3',
    serviceId: '1',
    serviceName: 'Food & Bazaar Heritage Trail',
    serviceType: 'Guide Tour',
    userId: 'u103',
    userName: 'Ananya Patel',
    userLocation: 'Ahmedabad, Gujarat',
    userAvatar: '👩',
    date: 'Aug 27, 2025',
    guests: 4,
    price: '₹2,000',
    message: 'Family of 4 looking for an evening food walk and textile shopping recommendations.',
    status: 'pending',
    createdAt: '2025-08-25 11:00 AM',
  },
]
