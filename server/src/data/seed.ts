import { prisma } from '../db/prisma.js'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('🌱 Seeding YatraSetu Database...')

  // 1. Clean existing records
  await prisma.message.deleteMany()
  await prisma.reportVote.deleteMany()
  await prisma.cleanlinessReport.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.homestay.deleteMany()
  await prisma.guide.deleteMany()
  await prisma.product.deleteMany()
  await prisma.crowdSpot.deleteMany()
  await prisma.emergencyAlert.deleteMany()
  await prisma.emergencyService.deleteMany()
  await prisma.itinerary.deleteMany()
  await prisma.communityPost.deleteMany()
  await prisma.notificationLog.deleteMany()
  await prisma.touristCheckIn.deleteMany()
  await prisma.user.deleteMany()

  // 2. Seed Users
  const defaultPasswordHash = await bcrypt.hash('YatraSetu@2026', 10)

  const tourist = await prisma.user.create({
    data: {
      id: 'usr_aarav_sharma',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      passwordHash: defaultPasswordHash,
      role: 'user',
      avatar: '👤',
      phone: '+91 98765 12345',
      location: 'Jaipur, Rajasthan',
    },
  })

  const host = await prisma.user.create({
    data: {
      id: 'usr_arjun_mehta',
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      passwordHash: defaultPasswordHash,
      role: 'local',
      avatar: '🏡',
      phone: '+91 98765 43210',
      location: 'Jaipur, Rajasthan',
      speciality: 'Rajasthani Heritage & Forts Expert',
    },
  })

  const authority = await prisma.user.create({
    data: {
      id: 'usr_rajesh_verma',
      name: 'Dr. Rajesh Verma',
      email: 'rajesh.verma@rtdc.gov.in',
      passwordHash: defaultPasswordHash,
      role: 'authority',
      avatar: '🛡️',
      phone: '+91 141 2744 901',
      location: 'Jaipur North Municipal Command',
    },
  })

  const admin = await prisma.user.create({
    data: {
      id: 'usr_admin_travelboost',
      name: 'System Admin (TravelBoost)',
      email: 'admin@travelboost.gov.in',
      passwordHash: defaultPasswordHash,
      role: 'admin',
      avatar: '⚡',
      phone: '+91 11 2338 1234',
      location: 'New Delhi (National Tourism Command)',
    },
  })

  console.log('✅ Demo users created:', {
    tourist: tourist.email,
    host: host.email,
    authority: authority.email,
    admin: admin.email,
  })

  // 3. Seed Cleanliness Reports
  await prisma.cleanlinessReport.createMany({
    data: [
      {
        id: '1',
        rank: 1,
        medal: '🥇',
        name: 'Overflowing Garbage near Sadar Bazar',
        location: 'Sadar Bazar, Jaipur',
        votes: 248,
        impact: 'High',
        evidence: JSON.stringify([
          'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop&auto=format',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format',
        ]),
        comments: JSON.stringify([
          'It has been overflowing for 3 days now',
          'Health hazard for nearby shopkeepers and visiting tourists',
        ]),
        userSolutions: JSON.stringify([
          'Increase garbage collection frequency to twice daily',
          'Install compactor units at marketplace junctions',
        ]),
        authorityResponse: 'Acknowledged. Municipal sanitation team scheduled for deployment.',
        currentStatus: 'In Progress',
        reportedByName: 'Aarav Sharma',
        reportedById: tourist.id,
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
        evidence: JSON.stringify(['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=300&fit=crop&auto=format']),
        comments: JSON.stringify([
          'Unusable condition since last week',
          'Tourists are facing major issues, needs urgent plumbing repair',
        ]),
        userSolutions: JSON.stringify([
          'Contract professional cleaning agency',
          'Install sensor-activated flush systems',
        ]),
        authorityResponse: null,
        currentStatus: 'Open',
        reportedByName: 'Meera Rajput',
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
        evidence: JSON.stringify(['https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400&h=300&fit=crop&auto=format']),
        comments: JSON.stringify([
          'Affecting water quality and local birds',
          'Lake is a major tourist attraction — urgent cleanup needed',
        ]),
        userSolutions: JSON.stringify([
          'Organise community clean-up drives',
          'Ban single-use plastics in 500m radius around Jal Mahal',
        ]),
        authorityResponse: 'Community clean-up drive completed on 22 Aug. Plastic ban notification issued.',
        currentStatus: 'Resolved',
        reportedByName: 'Dr. Rajesh Verma',
        reportedById: authority.id,
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
        evidence: JSON.stringify([]),
        comments: JSON.stringify(['Mosquito breeding hotspot near tourist transit road', 'Industrial discharge reported']),
        userSolutions: JSON.stringify(['CCTV monitoring for illegal discharge', 'Sewage treatment plant upgrade']),
        authorityResponse: null,
        currentStatus: 'Open',
        reportedByName: 'Kunal Joshi',
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
        evidence: JSON.stringify([]),
        comments: JSON.stringify(['Tourists discarding water bottles along the trekking route']),
        userSolutions: JSON.stringify(['Install eco-friendly bamboo dustbins every 100 meters', 'Awareness boards in Hindi and English']),
        authorityResponse: null,
        currentStatus: 'Open',
        reportedByName: 'Pooja Verma',
        reportedAt: '2025-08-25 09:20 AM',
        description: 'Trekking path leading to sunset point lacks waste disposal bins.',
      },
    ],
  })

  // 4. Seed Homestays
  await prisma.homestay.createMany({
    data: [
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
        facilities: JSON.stringify(['WiFi', 'AC', 'Home Kitchen', 'Courtyard', 'Heritage Tour', 'Breakfast Included']),
        contactImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format',
        hostName: 'Arjun Mehta',
        hostId: host.id,
        availableDates: JSON.stringify(['2025-08-25', '2025-08-26', '2025-08-27', '2025-08-28', '2025-08-29', '2025-08-30']),
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
        facilities: JSON.stringify(['River View', 'Yoga', 'Breakfast Included', 'Boat Tours', 'WiFi']),
        contactImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format',
        hostName: 'Devendra Pandey',
        availableDates: JSON.stringify(['2025-08-25', '2025-08-26', '2025-08-29', '2025-08-30', '2025-08-31']),
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
        facilities: JSON.stringify(['Lake View', 'Pool', 'Spa', 'Fine Dining', 'Sunset Lounge']),
        contactImg: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format',
        hostName: 'Sunita Rathore',
        availableDates: JSON.stringify(['2025-09-05', '2025-09-06', '2025-09-07']),
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
        facilities: JSON.stringify(['Mountain View', 'Bonfire', 'Home Garden', 'Trekking Support', 'Fireplace']),
        contactImg: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=80&h=80&fit=crop&auto=format',
        hostName: 'Ravi Thakur',
        availableDates: JSON.stringify(['2025-08-25', '2025-08-26', '2025-08-27', '2025-08-28', '2025-09-01']),
      },
    ],
  })

  // 5. Seed Guides
  await prisma.guide.createMany({
    data: [
      {
        id: '1',
        name: 'Arjun Mehta',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format',
        verified: true,
        rating: 4.9,
        location: 'Jaipur, Rajasthan',
        languages: JSON.stringify(['Hindi', 'English', 'French']),
        speciality: 'Forts & Palaces Expert',
        places: JSON.stringify(['Amber Fort', 'City Palace', 'Nahargarh', 'Jaigarh Fort', 'Hawa Mahal']),
        priceNumber: 1500,
        price: '₹1,500',
        priceUnit: 'per day',
        available: true,
        tours: 240,
        guideId: host.id,
        availableDates: JSON.stringify(['2025-08-25', '2025-08-26', '2025-08-27', '2025-08-28', '2025-08-30']),
      },
      {
        id: '2',
        name: 'Priya Nair',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format',
        verified: true,
        rating: 4.8,
        location: 'Alleppey, Kerala',
        languages: JSON.stringify(['Malayalam', 'English', 'German']),
        speciality: 'Backwaters & Village Culture',
        places: JSON.stringify(['Vembanad Lake', 'Kumarakom', 'Alappuzha Beaches', 'Kuttanad']),
        priceNumber: 1800,
        price: '₹1,800',
        priceUnit: 'per day',
        available: true,
        tours: 312,
        availableDates: JSON.stringify(['2025-08-25', '2025-08-27', '2025-08-28', '2025-08-31']),
      },
      {
        id: '3',
        name: 'Rahul Singh',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format',
        verified: false,
        rating: 4.6,
        location: 'Varanasi, Uttar Pradesh',
        languages: JSON.stringify(['Hindi', 'English']),
        speciality: 'Ghats, Temples & Heritage Cuisine',
        places: JSON.stringify(['Dashashwamedh Ghat', 'Kashi Vishwanath', 'Sarnath', 'Ramnagar Fort']),
        priceNumber: 1200,
        price: '₹1,200',
        priceUnit: 'per day',
        available: false,
        tours: 185,
        availableDates: JSON.stringify(['2025-09-02', '2025-09-03', '2025-09-04']),
      },
      {
        id: '4',
        name: 'Kavya Reddy',
        photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&auto=format',
        verified: true,
        rating: 4.7,
        location: 'Hyderabad, Telangana',
        languages: JSON.stringify(['Telugu', 'Hindi', 'English']),
        speciality: 'Nizami Heritage & Food Trails',
        places: JSON.stringify(['Charminar', 'Golconda Fort', 'Hussain Sagar', 'Old City Bazaars']),
        priceNumber: 1400,
        price: '₹1,400',
        priceUnit: 'per day',
        available: true,
        tours: 198,
        availableDates: JSON.stringify(['2025-08-25', '2025-08-26', '2025-08-28', '2025-08-29']),
      },
    ],
  })

  // 6. Seed Products
  await prisma.product.createMany({
    data: [
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
    ],
  })

  // 7. Seed Crowd Spots
  await prisma.crowdSpot.createMany({
    data: [
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
    ],
  })

  // 8. Seed Emergency Alerts
  await prisma.emergencyAlert.createMany({
    data: [
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
    ],
  })

  // 9. Seed Emergency Services
  await prisma.emergencyService.createMany({
    data: [
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
    ],
  })

  // 10. Seed Initial Booking Requests
  await prisma.booking.createMany({
    data: [
      {
        id: '1',
        serviceId: '1',
        serviceName: 'Rajwada Heritage Home',
        serviceType: 'Homestay',
        userId: tourist.id,
        userName: 'Pooja Sharma',
        userLocation: 'Mumbai, Maharashtra',
        userAvatar: '👩',
        date: 'Aug 28–30, 2025',
        guests: 2,
        price: '₹5,600',
        message: 'Hi! We are a couple visiting Jaipur for a heritage photography tour. Would love to stay with breakfast included.',
        status: 'pending',
      },
      {
        id: '2',
        serviceId: '1',
        serviceName: 'Heritage Forts & Palaces Tour',
        serviceType: 'Guide Tour',
        userId: tourist.id,
        userName: 'Ravi Kulkarni',
        userLocation: 'Bengaluru, Karnataka',
        userAvatar: '👨',
        date: 'Aug 26, 2025',
        guests: 1,
        price: '₹1,500',
        message: 'Solo traveller visiting for a day. Looking for an in-depth historical tour of Amber and Jaigarh forts.',
        status: 'accepted',
      },
      {
        id: '3',
        serviceId: '1',
        serviceName: 'Food & Bazaar Heritage Trail',
        serviceType: 'Guide Tour',
        userId: tourist.id,
        userName: 'Ananya Patel',
        userLocation: 'Ahmedabad, Gujarat',
        userAvatar: '👩',
        date: 'Aug 27, 2025',
        guests: 4,
        price: '₹2,000',
        message: 'Family of 4 looking for an evening food walk and textile shopping recommendations.',
        status: 'pending',
      },
    ],
  })

  // 11. Seed Initial Chat Messages
  await prisma.message.createMany({
    data: [
      {
        id: '1',
        threadId: 'req-1',
        senderId: tourist.id,
        senderRole: 'user',
        receiverId: host.id,
        text: 'Hi Arjun! Is Rajwada Haveli available for 2 guests this weekend?',
      },
      {
        id: '2',
        threadId: 'req-1',
        senderId: host.id,
        senderRole: 'local',
        receiverId: tourist.id,
        text: 'Namaste Aarav! Yes, the courtyard suite is ready with breakfast included.',
      },
      {
        id: '3',
        threadId: 'req-1',
        senderId: tourist.id,
        senderRole: 'user',
        receiverId: host.id,
        text: 'Great, could you also arrange pickup from Jaipur Junction?',
      },
    ],
  })

  // 12. Seed Community Posts (Hidden Gems, Food, Culture, Photo Spots)
  await prisma.communityPost.createMany({
    data: [
      {
        id: 'post-1',
        authorName: 'Rohan Deshmukh',
        authorAvatar: '📸',
        authorRole: 'Travel Photographer',
        location: 'Panna Meena ka Kund, Amer, Jaipur',
        title: 'Hidden 16th-Century Stepwell Without Crowds!',
        content: 'While everyone lines up at Amber Fort, just 10 mins away lies Panna Meena Kund. The geometric symmetrical staircases are mind-blowing in early morning light (7:30 AM). Local chai stall nearby serves authentic ginger kulhad chai!',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&h=400&fit=crop&auto=format',
        ]),
        category: 'Hidden Gem',
        rating: 4.9,
        likes: 142,
        tips: 'Visit between 7:00 AM - 8:30 AM before guards restrict step access. No entry fee required.',
        isHiddenGem: true,
        isVerified: true,
      },
      {
        id: 'post-2',
        authorName: 'Pooja Kulkarni',
        authorAvatar: '🍲',
        authorRole: 'Culinary Explorer',
        location: 'Laxmi Mishthan Bhandar (LMB), Johari Bazaar',
        title: 'Authentic Ghevar & Pyaaz Kachori Paradise',
        content: 'You cannot leave Jaipur without trying the crispy, piping hot Pyaaz Kachori and freshly made Malai Ghevar at LMB. Made using pure desi ghee since 1954.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop&auto=format',
        ]),
        category: 'Food',
        rating: 4.8,
        likes: 98,
        tips: 'Go around 4:00 PM for the freshest batch of evening kachoris.',
        isHiddenGem: false,
        isVerified: true,
      },
      {
        id: 'post-3',
        authorName: 'Arjun Mehta',
        authorAvatar: '🏡',
        authorRole: 'Verified Local Host',
        location: 'Gaitore Ki Chhatriyan, Jaipur',
        title: 'Royal Cenotaphs Tucked Below Nahargarh Hills',
        content: 'One of the quietest and most artistic spots in Jaipur. Beautiful white marble cenotaphs with intricate carvings dedicated to Kachwaha rulers. Very peaceful atmosphere away from the city buzz.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600&h=400&fit=crop&auto=format',
        ]),
        category: 'Cultural',
        rating: 5.0,
        likes: 184,
        tips: 'Combine with an afternoon trek up the Nahargarh ramparts for sunset views.',
        isHiddenGem: true,
        isVerified: true,
      },
      {
        id: 'post-4',
        authorName: 'Aarav Sharma',
        authorAvatar: '👤',
        authorRole: 'Tourist Contributor',
        location: 'Hawa Mahal View Rooftop Cafes',
        title: 'Best Photography Angle for Hawa Mahal',
        content: 'Tattoo Cafe and Wind View Cafe directly opposite Hawa Mahal give you the iconic postcard framing. Order a cold coffee and enjoy the pink facade under golden hour glow.',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&h=400&fit=crop&auto=format',
        ]),
        category: 'Photo Spot',
        rating: 4.7,
        likes: 76,
        tips: 'Carry a wide-angle lens (16-35mm) to capture both the street and facade.',
        isHiddenGem: false,
        isVerified: true,
      },
    ],
  })

  // 13. Seed Notification Logs
  await prisma.notificationLog.createMany({
    data: [
      {
        id: 'notif-1',
        channel: 'whatsapp',
        recipient: '+91 98765 12345',
        subject: 'Booking Confirmation',
        content: 'Namaste Aarav! Your booking for Rajwada Heritage Home (Aug 25-27) is confirmed. Host: Arjun Mehta (+91 98765 43210).',
        metadata: JSON.stringify({ bookingId: '1', hostId: host.id }),
        status: 'delivered',
      },
      {
        id: 'notif-2',
        channel: 'email',
        recipient: 'aarav.sharma@example.com',
        subject: 'TravelBoost - Your 3-Day Jaipur Heritage Itinerary is Ready!',
        content: 'Detailed itinerary voucher with day-by-day timing, crowd predictions, and offline QR guide has been generated for your trip.',
        metadata: JSON.stringify({ destination: 'Jaipur', days: 3 }),
        status: 'delivered',
      },
      {
        id: 'notif-3',
        channel: 'sms',
        recipient: '+91 98765 12345',
        subject: 'Civic Issue Status Update',
        content: 'TravelBoost Alert: Your report #1 regarding Sadar Bazar sanitation is now IN PROGRESS. Municipal Sanitation Team assigned.',
        metadata: JSON.stringify({ reportId: '1', status: 'In Progress' }),
        status: 'delivered',
      },
    ],
  })

  console.log('🎉 YatraSetu / TravelBoost Database Seed Completed Successfully!')
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
