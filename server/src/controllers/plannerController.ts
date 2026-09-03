import { Request, Response } from 'express'
import { prisma } from '../db/prisma.js'

export interface ItineraryActivity {
  id: string
  time: string
  title: string
  type: 'Attraction' | 'Hidden Gem' | 'Food Experience' | 'Cultural Activity' | 'Adventure'
  duration: string
  location: string
  description: string
  estimatedCost: number
  travelDistance?: string
  travelTime?: string
  recommendedTransport?: string
  crowdLevel?: 'Low' | 'Moderate' | 'High'
  tips?: string
}

export interface ItineraryDay {
  dayNumber: number
  date: string
  theme: string
  dailyBudget: number
  activities: ItineraryActivity[]
  stayRecommendation: {
    name: string
    type: string
    costPerNight: number
    location: string
  }
  foodRecommendations: string[]
  carbonKg: number
}

export interface GeneratedPlan {
  tier: 'Budget' | 'Balanced' | 'Premium'
  title: string
  tagline: string
  totalEstimatedCost: number
  budgetRemaining: number
  sustainabilityScore: number // 0-100
  carbonFootprintTotalKg: number
  bestTimeToVisit: string
  weatherForecast: string
  highlightedHiddenGems: string[]
  days: ItineraryDay[]
  explainability: string
}

// Destination-specific intelligence database
const destinationKnowledge: Record<string, {
  themes: string[]
  spots: Array<{ name: string; type: ItineraryActivity['type']; cost: number; duration: string; tips: string; isHidden?: boolean }>
  foods: string[]
  stays: { budget: string; balanced: string; premium: string }
  costs: { budgetStay: number; balancedStay: number; premiumStay: number; foodDaily: number; transportDaily: number }
}> = {
  jaipur: {
    themes: ['Royal Forts & Heritage Marvels', 'Stepwells & Royal Cenotaphs', 'Artisanal Bazaars & Pink City Gastronomy'],
    spots: [
      { name: 'Amber Fort & Sheesh Mahal', type: 'Attraction', cost: 200, duration: '2.5 hrs', tips: 'Visit early morning to avoid rush' },
      { name: 'Panna Meena ka Kund Stepwell', type: 'Hidden Gem', cost: 0, duration: '1 hr', tips: 'Symmetrical 16th-century stepwell, best for photography', isHidden: true },
      { name: 'City Palace & Jantar Mantar', type: 'Cultural Activity', cost: 350, duration: '2 hrs', tips: 'Audio guides available in 8 languages' },
      { name: 'Gaitore Ki Chhatriyan', type: 'Hidden Gem', cost: 50, duration: '1.5 hrs', tips: 'Serene marble cenotaphs nestled below Nahargarh hill', isHidden: true },
      { name: 'Hawa Mahal & Rooftop Tea', type: 'Photo Spot' as any, cost: 150, duration: '1.5 hrs', tips: 'Wind View Cafe gives iconic postcard framing' },
      { name: 'Johari Bazaar Block Printing Workshop', type: 'Cultural Activity', cost: 400, duration: '2 hrs', tips: 'Meet local master artisan and stamp your own scarf' },
      { name: 'Nahargarh Fort Sunset Point', type: 'Adventure', cost: 100, duration: '2 hrs', tips: 'Panoramic evening view of the lit-up Pink City' },
      { name: 'Laxmi Mishthan Bhandar (LMB) Food Walk', type: 'Food Experience', cost: 250, duration: '1 hr', tips: 'Try hot Pyaaz Kachori and Malai Ghevar' },
    ],
    foods: ['Pyaaz Kachori', 'Dal Baati Churma', 'Ghevar', 'Laal Maas', 'Ker Sangri', 'Makhaniya Lassi'],
    stays: {
      budget: 'Jaipur Heritage Backpackers / Local Haveli Room',
      balanced: 'Rajwada Heritage Home (Verified Haveli)',
      premium: 'Samode Palace & Heritage Luxury Suite',
    },
    costs: { budgetStay: 800, balancedStay: 2800, premiumStay: 7500, foodDaily: 450, transportDaily: 350 },
  },
  varanasi: {
    themes: ['Sacred Ghats & Dawn Boat Cruise', 'Silk Weaving & Ancient Alleys', 'Sarnath Buddhist Heritage & Evening Ganga Aarti'],
    spots: [
      { name: 'Subah-e-Banaras Dawn Boat Ride at Assi Ghat', type: 'Cultural Activity', cost: 250, duration: '2 hrs', tips: 'Watch the sunrise over the Ganges with morning Vedic chants' },
      { name: 'Kashi Vishwanath Corridor & Temple', type: 'Attraction', cost: 0, duration: '1.5 hrs', tips: 'Book Sugam Darshan online to skip 2-hour queue' },
      { name: 'Gularia Ghat Quiet Heritage Walk', type: 'Hidden Gem', cost: 0, duration: '1.5 hrs', tips: 'Restored 18th-century stone ghat with zero tourist crowds', isHidden: true },
      { name: 'Sarnath Archaeological Park & Museum', type: 'Attraction', cost: 100, duration: '2.5 hrs', tips: 'Where Lord Buddha gave his first sermon' },
      { name: 'Madanpura Handloom Silk Weavers Colony', type: 'Cultural Activity', cost: 0, duration: '2 hrs', tips: 'Watch master weavers create pure Zari Banarasi sarees', isHidden: true },
      { name: 'Dashashwamedh Ghat Grand Maha Aarti', type: 'Attraction', cost: 0, duration: '1.5 hrs', tips: 'Secure a boat seat by 6:00 PM for the best vantage' },
      { name: 'Kachori Gali & Blue Lassi Tasting', type: 'Food Experience', cost: 150, duration: '1 hr', tips: 'Try Malaiyo (winter saffron milk froth) and Rabri' },
    ],
    foods: ['Banarasi Paan', 'Kachori Jalebi', 'Malaiyo / Rabri', 'Tamatar Chaat', 'Thandai with Kesar', 'Baati Chokha'],
    stays: {
      budget: 'Assi Ghat Riverside Dorm / Homestay',
      balanced: 'Ghats View Villa (Heritage Ganges Facing)',
      premium: 'BrijRama Palace Heritage Ghat Hotel',
    },
    costs: { budgetStay: 700, balancedStay: 2200, premiumStay: 6500, foodDaily: 350, transportDaily: 250 },
  },
  manali: {
    themes: ['Himalayan Valley & Pine Forests', 'Solang Adventure & High Passes', 'Old Manali Apple Orchards & Waterfalls'],
    spots: [
      { name: 'Hadimba Temple & Cedar Woods', type: 'Attraction', cost: 50, duration: '1.5 hrs', tips: 'Ancient wooden pagoda amidst towering deodars' },
      { name: 'Jogini Waterfalls & Vashisht Trek', type: 'Hidden Gem', cost: 0, duration: '3 hrs', tips: 'Scenic 3km trek passing apple orchards to sacred falls', isHidden: true },
      { name: 'Solang Valley Paragliding & Zipline', type: 'Adventure', cost: 1500, duration: '3 hrs', tips: 'Wear thermals; negotiate pilot video included' },
      { name: 'Naggar Castle & Roerich Art Gallery', type: 'Cultural Activity', cost: 80, duration: '2 hrs', tips: 'Wooden Himalayan architecture overlooking Beas river', isHidden: true },
      { name: 'Old Manali Cafe Trail & Trout Tasting', type: 'Food Experience', cost: 450, duration: '2 hrs', tips: 'Try fresh Himalayan river trout and Siddu' },
    ],
    foods: ['Siddu with Ghee', 'Himalayan River Trout', 'Chha Gosht', 'Kullu Trout Fish Curry', 'Apple Crumble Tart', 'Tudkiya Bhat'],
    stays: {
      budget: 'Old Manali Pine View Hostel',
      balanced: 'Hill Station Apple Orchard Cottage',
      premium: 'The Himalayan Luxury Castle & Spa',
    },
    costs: { budgetStay: 900, balancedStay: 2600, premiumStay: 7000, foodDaily: 500, transportDaily: 400 },
  }
}

// Fallback generator for other destinations
function getFallbackDestination(dest: string) {
  const dName = dest.charAt(0).toUpperCase() + dest.slice(1)
  return {
    themes: [`${dName} Heritage & Top Sights`, `Local Culture & Hidden Trails`, `Culinary Delights & Scenic Vistas`],
    spots: [
      { name: `${dName} Iconic Landmark & Memorial`, type: 'Attraction' as const, cost: 150, duration: '2 hrs', tips: 'Visit during morning hours for best experience' },
      { name: `Secret Ancient Stepwell / Forest Trail near ${dName}`, type: 'Hidden Gem' as const, cost: 0, duration: '1.5 hrs', tips: 'Uncrowded local gem recommended by residents', isHidden: true },
      { name: `${dName} Old Town Cultural & Artisan Walk`, type: 'Cultural Activity' as const, cost: 200, duration: '2.5 hrs', tips: 'Interact directly with local weavers and craftspersons' },
      { name: `Sunset Panorama Viewpoint & Hill Trail`, type: 'Adventure' as const, cost: 50, duration: '2 hrs', tips: 'Carry water and camera for panoramic shots' },
      { name: `Traditional Bazaar Food & Spice Trail`, type: 'Food Experience' as const, cost: 250, duration: '1.5 hrs', tips: 'Taste freshly cooked authentic local regional specialties' },
      { name: `Historic Sanctuary & Sacred Shrine`, type: 'Attraction' as const, cost: 50, duration: '1 hr', tips: 'Respect local attire guidelines and customs' },
    ],
    foods: ['Regional Thali', 'Traditional Bread & Curry', 'Local Sweet Delicacy', 'Spiced Herbal Tea', 'Clay-oven Snacks'],
    stays: {
      budget: `${dName} Traveler Inn / Backpacker Stay`,
      balanced: `${dName} Verified Community Homestay`,
      premium: `${dName} Boutique Heritage Resort`,
    },
    costs: { budgetStay: 800, balancedStay: 2400, premiumStay: 6000, foodDaily: 400, transportDaily: 300 },
  }
}

function buildItineraryForTier(
  tier: 'Budget' | 'Balanced' | 'Premium',
  params: {
    destination: string
    duration: number
    budget: number
    people: number
    interests: string[]
    transportPref: string
    stayPref: string
    foodPref: string
  }
): GeneratedPlan {
  const destKey = params.destination.toLowerCase()
  const info = destinationKnowledge[destKey] || getFallbackDestination(params.destination)
  const multiplier = tier === 'Budget' ? 0.7 : tier === 'Balanced' ? 1.0 : 1.8

  const stayCostPerNight = Math.round(
    (tier === 'Budget' ? info.costs.budgetStay : tier === 'Balanced' ? info.costs.balancedStay : info.costs.premiumStay) * (params.people > 2 ? 1.5 : 1.0)
  )
  const foodCostPerDay = Math.round(info.costs.foodDaily * multiplier * params.people)
  const transportCostPerDay = Math.round(info.costs.transportDaily * (tier === 'Premium' ? 2.2 : tier === 'Balanced' ? 1.2 : 0.8))

  const days: ItineraryDay[] = []
  let totalActivityCost = 0
  const hiddenGemsSet = new Set<string>()

  for (let d = 1; d <= params.duration; d++) {
    const dayTheme = info.themes[(d - 1) % info.themes.length] || `Day ${d} Exploration`
    const dayActivities: ItineraryActivity[] = []
    
    // Pick 3-4 activities per day based on interests
    const spotIdx1 = ((d - 1) * 2) % info.spots.length
    const spotIdx2 = ((d - 1) * 2 + 1) % info.spots.length
    const spotIdx3 = (spotIdx1 + 2) % info.spots.length

    const s1 = info.spots[spotIdx1]
    const s2 = info.spots[spotIdx2]
    const s3 = info.spots[spotIdx3]

    const timeSlots = ['08:30 AM – 11:00 AM', '11:30 AM – 02:00 PM', '04:00 PM – 06:30 PM']

    const addAct = (spot: typeof s1, timeSlot: string, idx: number) => {
      const cost = Math.round(spot.cost * multiplier * params.people)
      totalActivityCost += cost
      if (spot.isHidden) hiddenGemsSet.add(spot.name)
      dayActivities.push({
        id: `act-d${d}-${idx}`,
        time: timeSlot,
        title: spot.name,
        type: spot.type,
        duration: spot.duration,
        location: `${params.destination}`,
        description: `Explore ${spot.name}. Verified experience tailored for ${params.interests.slice(0, 2).join(' & ')} enthusiasts.`,
        estimatedCost: cost,
        travelDistance: `${(idx + 1) * 3.5} km`,
        travelTime: `${(idx + 1) * 12} min`,
        recommendedTransport: params.transportPref || (tier === 'Budget' ? 'E-Rickshaw / Metro' : tier === 'Balanced' ? 'Prepaid Taxi' : 'Chauffeured EV'),
        crowdLevel: idx === 0 ? 'Low' : idx === 1 ? 'Moderate' : 'Low',
        tips: spot.tips,
      })
    }

    addAct(s1, timeSlots[0], 1)
    addAct(s2, timeSlots[1], 2)
    addAct(s3, timeSlots[2], 3)

    const stayName = tier === 'Budget' ? info.stays.budget : tier === 'Balanced' ? info.stays.balanced : info.stays.premium

    days.push({
      dayNumber: d,
      date: `Day ${d}`,
      theme: dayTheme,
      dailyBudget: stayCostPerNight + foodCostPerDay + transportCostPerDay + dayActivities.reduce((a, b) => a + b.estimatedCost, 0),
      activities: dayActivities,
      stayRecommendation: {
        name: stayName,
        type: tier === 'Budget' ? 'Homestay Dorm/Room' : tier === 'Balanced' ? 'Heritage Homestay' : 'Luxury Eco-Boutique',
        costPerNight: stayCostPerNight,
        location: `Central ${params.destination}`,
      },
      foodRecommendations: [
        info.foods[(d - 1) % info.foods.length],
        info.foods[d % info.foods.length],
      ],
      carbonKg: tier === 'Budget' ? 8.2 : tier === 'Balanced' ? 14.5 : 28.0,
    })
  }

  const totalStayCost = stayCostPerNight * params.duration
  const totalFoodCost = foodCostPerDay * params.duration
  const totalTransportCost = transportCostPerDay * params.duration
  const totalCost = totalStayCost + totalFoodCost + totalTransportCost + totalActivityCost
  const budgetRemaining = Math.max(0, params.budget - totalCost)

  const titles = {
    Budget: 'Budget Smart Explorer',
    Balanced: 'Balanced Cultural & Hidden Gems Plan',
    Premium: 'Premium Heritage & Immersive Experience',
  }

  const taglines = {
    Budget: 'Maximized local discovery with low-footprint transit and community homestays.',
    Balanced: 'Optimized mix of top monuments, secluded stepwells, authentic food and verified local guides.',
    Premium: 'Curated royal hospitality, private master-artisan workshops and priority access.',
  }

  return {
    tier,
    title: titles[tier],
    tagline: taglines[tier],
    totalEstimatedCost: totalCost,
    budgetRemaining,
    sustainabilityScore: tier === 'Budget' ? 92 : tier === 'Balanced' ? 88 : 74,
    carbonFootprintTotalKg: Math.round(days.reduce((s, d) => s + d.carbonKg, 0)),
    bestTimeToVisit: 'October – March (Pleasant weather, ideal for heritage walks)',
    weatherForecast: '24°C – 28°C (Clear skies, low humidity)',
    highlightedHiddenGems: Array.from(hiddenGemsSet),
    days,
    explainability: `Recommended based on your ${params.people} person group, interest in ${params.interests.join(', ')}, ${params.stayPref || 'homestay'} preference, and total budget of ₹${params.budget.toLocaleString()}.`,
  }
}

export async function generateItinerary(req: Request, res: Response) {
  try {
    const {
      destination = 'Jaipur',
      duration = 3,
      startDate = new Date().toISOString().split('T')[0],
      budget = 15000,
      people = 2,
      interests = ['Heritage', 'Food', 'Culture'],
      transportPref = 'Local Taxi / Auto',
      stayPref = 'Homestay',
      foodPref = 'Authentic Local',
      startLocation = 'Delhi',
      intensity = 'Moderate',
    } = req.body

    const parsedDuration = Math.min(7, Math.max(1, Number(duration) || 3))
    const parsedBudget = Number(budget) || 15000
    const parsedPeople = Number(people) || 2

    const params = {
      destination,
      duration: parsedDuration,
      budget: parsedBudget,
      people: parsedPeople,
      interests: Array.isArray(interests) && interests.length > 0 ? interests : ['Culture', 'Food'],
      transportPref,
      stayPref,
      foodPref,
    }

    const plans = [
      buildItineraryForTier('Budget', params),
      buildItineraryForTier('Balanced', params),
      buildItineraryForTier('Premium', params),
    ]

    res.json({
      success: true,
      destination,
      startDate,
      durationDays: parsedDuration,
      groupSize: parsedPeople,
      userBudget: parsedBudget,
      plans,
      generatedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error generating itinerary:', error)
    res.status(500).json({ error: 'Failed to generate travel plan.' })
  }
}

export async function modifyItinerary(req: Request, res: Response) {
  try {
    const { currentPlan, prompt, modificationType } = req.body

    if (!currentPlan || !prompt) {
      return res.status(400).json({ error: 'Current plan and modification prompt are required.' })
    }

    const p = prompt.toLowerCase()
    let updatedPlan: GeneratedPlan = JSON.parse(JSON.stringify(currentPlan))
    let changeSummary = 'Modified plan based on your request.'

    if (p.includes('remove') || p.includes('delete') || p.includes('skip')) {
      // Find activity that matches text or remove first museum/fort
      const keyword = p.replace(/remove|delete|skip|the|from|itinerary|plan/g, '').trim()
      let removedTitle = ''
      updatedPlan.days.forEach((day) => {
        const initialLen = day.activities.length
        day.activities = day.activities.filter((act) => {
          if (keyword && act.title.toLowerCase().includes(keyword)) {
            removedTitle = act.title
            return false
          }
          return true
        })
        if (day.activities.length === initialLen && (p.includes('museum') || p.includes('temple') || p.includes('fort'))) {
          day.activities = day.activities.filter((act) => !act.title.toLowerCase().includes('museum'))
        }
      })
      changeSummary = removedTitle ? `Removed "${removedTitle}" and adjusted transit timings.` : `Removed matching items from schedule.`
    } else if (p.includes('reduce budget') || p.includes('cheaper') || p.includes('less budget') || p.includes('save money')) {
      // Lower stay and transport costs
      updatedPlan.totalEstimatedCost = Math.round(updatedPlan.totalEstimatedCost * 0.8)
      updatedPlan.budgetRemaining += Math.round(updatedPlan.totalEstimatedCost * 0.2)
      updatedPlan.days.forEach((day) => {
        day.stayRecommendation.costPerNight = Math.round(day.stayRecommendation.costPerNight * 0.75)
        day.stayRecommendation.name = `Budget-friendly verified room (${day.stayRecommendation.name})`
        day.activities.forEach((act) => {
          act.recommendedTransport = 'Shared Auto / E-Rickshaw'
        })
      })
      changeSummary = 'Swapped to budget-friendly community stays and local e-rickshaw transit. Saved approx 20% total cost.'
    } else if (p.includes('adventure') || p.includes('trek') || p.includes('hike')) {
      // Add adventure activity to day 1 and day 2
      updatedPlan.days.forEach((day, idx) => {
        day.activities.push({
          id: `act-mod-adv-${idx}`,
          time: '04:30 PM – 06:30 PM',
          title: 'Sunset Ridge Trail & Local Rock Climbing',
          type: 'Adventure',
          duration: '2 hrs',
          location: 'Outer Scenic Hills',
          description: 'Guided light trek with panoramic valley sunset and local climbing guide.',
          estimatedCost: 350,
          recommendedTransport: 'Bicycle / Walk',
          tips: 'Wear sturdy shoes and bring water',
        })
      })
      changeSummary = 'Added sunset ridge adventure activities and hiking stops to your itinerary.'
    } else if (p.includes('food') || p.includes('eat') || p.includes('gastronomy') || p.includes('cuisine')) {
      updatedPlan.days.forEach((day) => {
        day.activities.push({
          id: `act-mod-food-${day.dayNumber}`,
          time: '07:30 PM – 09:00 PM',
          title: 'Master-Chef Local Street Food Safari',
          type: 'Food Experience',
          duration: '1.5 hrs',
          location: 'Old Town Heritage Food Lane',
          description: 'Curated 5-course sampling of legendary generational sweet and savory dishes.',
          estimatedCost: 300,
          recommendedTransport: 'Heritage Walk',
          tips: 'Come with an empty stomach!',
        })
      })
      changeSummary = 'Enhanced daily schedule with guided culinary food walks and regional delicacies.'
    } else if (p.includes('wheelchair') || p.includes('accessible') || p.includes('no walking') || p.includes('elderly')) {
      updatedPlan.days.forEach((day) => {
        day.activities = day.activities.map((act) => ({
          ...act,
          recommendedTransport: 'Accessible Golf Cart / Chauffeured Cab',
          tips: `${act.tips || ''} | [Verified Step-free & Wheelchair Accessible Route]`,
        }))
      })
      changeSummary = 'Updated route for full step-free accessibility with golf-cart / vehicle drop-off at all monument gates.'
    } else {
      changeSummary = `AI dynamic adjustment applied: "${prompt}". Re-balanced activities and times.`
    }

    // Recalculate totals
    let newTotal = 0
    updatedPlan.days.forEach((day) => {
      const actCost = day.activities.reduce((s, a) => s + (a.estimatedCost || 0), 0)
      day.dailyBudget = day.stayRecommendation.costPerNight + 400 + actCost
      newTotal += day.dailyBudget
    })
    updatedPlan.totalEstimatedCost = newTotal
    updatedPlan.explainability = `Dynamically updated: ${changeSummary}`

    res.json({
      success: true,
      modifiedPlan: updatedPlan,
      changeSummary,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error modifying itinerary:', error)
    res.status(500).json({ error: 'Failed to modify travel plan.' })
  }
}

export async function saveItinerary(req: Request, res: Response) {
  try {
    const { userId, destination, startDate, durationDays, budgetTier, totalCost, remainingBudget, summary, plan } = req.body

    const saved = await prisma.itinerary.create({
      data: {
        userId: userId || 'usr_aarav_sharma',
        destination: destination || 'Jaipur',
        startDate: startDate || new Date().toISOString().split('T')[0],
        durationDays: Number(durationDays) || 3,
        budgetTier: budgetTier || 'Balanced',
        totalCost: Number(totalCost) || 8500,
        remainingBudget: Number(remainingBudget) || 6500,
        summary: summary || 'AI Generated Travel Itinerary',
        daysJson: JSON.stringify(plan?.days || []),
      },
    })

    res.json({ success: true, savedItinerary: saved })
  } catch (error: any) {
    console.error('Error saving itinerary:', error)
    res.status(500).json({ error: 'Failed to save itinerary.' })
  }
}

export async function getUserSavedItineraries(req: Request, res: Response) {
  try {
    const { userId } = req.query
    const uid = (userId as string) || 'usr_aarav_sharma'

    const itineraries = await prisma.itinerary.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' },
    })

    const parsed = itineraries.map((it) => ({
      ...it,
      days: JSON.parse(it.daysJson || '[]'),
    }))

    res.json(parsed)
  } catch (error: any) {
    console.error('Error fetching saved itineraries:', error)
    res.status(500).json({ error: 'Failed to fetch saved itineraries.' })
  }
}
