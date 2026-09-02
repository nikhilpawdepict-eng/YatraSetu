import fetch from 'node-fetch'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'

const API = 'http://localhost:5000/api'

let touristToken = ''
let hostToken = ''
let authorityToken = ''

async function runTests() {
  console.log('🧪 Starting YatraSetu End-to-End API Integration Suite...\n')

  // 1. Health Check
  console.log('1. Testing GET /api/health...')
  const healthRes = await fetch(`${API}/health`)
  const health = await healthRes.json()
  if (health.status !== 'ok') throw new Error('Health check failed: ' + JSON.stringify(health))
  console.log('   ✅ Health check OK:', health.version)

  // 2. Auth: Tourist Demo
  console.log('\n2. Testing POST /api/auth/quick-demo (Tourist)...')
  const touristAuthRes = await fetch(`${API}/auth/quick-demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'user' }),
  })
  const touristAuth: any = await touristAuthRes.json()
  touristToken = touristAuth.token
  if (!touristToken || touristAuth.user.role !== 'user') {
    throw new Error('Tourist auth failed: ' + JSON.stringify(touristAuth))
  }
  console.log('   ✅ Tourist authenticated:', touristAuth.user.name, `(${touristAuth.user.email})`)

  // 3. Auth: Local Host Demo
  console.log('\n3. Testing POST /api/auth/quick-demo (Local Host)...')
  const hostAuthRes = await fetch(`${API}/auth/quick-demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'local' }),
  })
  const hostAuth: any = await hostAuthRes.json()
  hostToken = hostAuth.token
  if (!hostToken || hostAuth.user.role !== 'local') {
    throw new Error('Host auth failed: ' + JSON.stringify(hostAuth))
  }
  console.log('   ✅ Local host authenticated:', hostAuth.user.name, `(${hostAuth.user.email})`)

  // 4. Auth: Authority Demo
  console.log('\n4. Testing POST /api/auth/quick-demo (Authority)...')
  const authRes = await fetch(`${API}/auth/quick-demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'authority' }),
  })
  const authData: any = await authRes.json()
  authorityToken = authData.token
  if (!authorityToken || authData.user.role !== 'authority') {
    throw new Error('Authority auth failed: ' + JSON.stringify(authData))
  }
  console.log('   ✅ Authority authenticated:', authData.user.name, `(${authData.user.email})`)

  // 5. Cleanliness: Fetch Reports
  console.log('\n5. Testing GET /api/reports with tourist token...')
  const reportsRes = await fetch(`${API}/reports`, {
    headers: { Authorization: `Bearer ${touristToken}` },
  })
  const reports: any = await reportsRes.json()
  if (!Array.isArray(reports) || reports.length === 0) {
    throw new Error('Failed to fetch reports: ' + JSON.stringify(reports))
  }
  console.log(`   ✅ Fetched ${reports.length} cleanliness reports. Top ranked: "${reports[0].name}"`)

  // 6. Cleanliness: Upvote Report
  console.log('\n6. Testing POST /api/reports/1/vote (Toggle Upvote)...')
  const voteRes = await fetch(`${API}/reports/1/vote`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${touristToken}` },
  })
  const voteData: any = await voteRes.json()
  if (!voteData.success) throw new Error('Vote failed: ' + JSON.stringify(voteData))
  console.log(`   ✅ Upvote toggled. New votes: ${voteData.votes}, hasUpvoted: ${voteData.hasUpvoted}`)

  // 7. Cleanliness: Add Solution
  console.log('\n7. Testing POST /api/reports/1/solution (Add Community Solution)...')
  const solutionRes = await fetch(`${API}/reports/1/solution`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${touristToken}`,
    },
    body: JSON.stringify({ solution: 'Install solar-powered waste compactors with IoT fill sensors.' }),
  })
  const solutionData: any = await solutionRes.json()
  if (!solutionData.success || !solutionData.userSolutions.some((s: string) => s.includes('solar-powered'))) {
    throw new Error('Add solution failed: ' + JSON.stringify(solutionData))
  }
  console.log(`   ✅ Solution submitted. Total community solutions: ${solutionData.userSolutions.length}`)

  // 8. Cleanliness: Submit New Report
  console.log('\n8. Testing POST /api/reports (Citizen Issue Submission)...')
  const newReportRes = await fetch(`${API}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${touristToken}`,
    },
    body: JSON.stringify({
      name: 'Blocked Drainage on Heritage Walkway',
      location: 'Chandpole Gate, Jaipur',
      impact: 'High',
      description: 'Stormwater drain blocked by construction debris. Waterlogged pavement.',
      evidence: ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400'],
    }),
  })
  const newReport: any = await newReportRes.json()
  if (!newReport.id || newReport.name !== 'Blocked Drainage on Heritage Walkway') {
    throw new Error('Report submission failed: ' + JSON.stringify(newReport))
  }
  console.log(`   ✅ Created report #${newReport.id}: "${newReport.name}" (Status: ${newReport.currentStatus})`)

  // 9. Authority: Update Report Status
  console.log(`\n9. Testing PATCH /api/reports/${newReport.id}/status (Authority Status Update)...`)
  const statusRes = await fetch(`${API}/reports/${newReport.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authorityToken}`,
    },
    body: JSON.stringify({ status: 'In Progress' }),
  })
  const statusData: any = await statusRes.json()
  if (statusData.currentStatus !== 'In Progress') {
    throw new Error('Status update failed: ' + JSON.stringify(statusData))
  }
  console.log(`   ✅ Status updated to: "${statusData.currentStatus}"`)

  // 10. Authority: Add Official Response
  console.log(`\n10. Testing POST /api/reports/${newReport.id}/authority-response (Official Response)...`)
  const authRespRes = await fetch(`${API}/reports/${newReport.id}/authority-response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authorityToken}`,
    },
    body: JSON.stringify({
      response: 'Zone 4 Sanitation JCB dispatched. Pavement desilting completed within 4 hours.',
    }),
  })
  const authRespData: any = await authRespRes.json()
  if (!authRespData.authorityResponse) {
    throw new Error('Authority response failed: ' + JSON.stringify(authRespData))
  }
  console.log(`   ✅ Official response recorded: "${authRespData.authorityResponse}"`)

  // 11. Booking: Tourist Creates Booking
  console.log('\n11. Testing POST /api/bookings (Tourist Book Homestay)...')
  const bookingRes = await fetch(`${API}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${touristToken}`,
    },
    body: JSON.stringify({
      serviceId: '1',
      serviceName: 'Rajwada Heritage Home',
      serviceType: 'Homestay',
      date: 'Aug 29–31, 2025',
      guests: 2,
      price: '₹5,600',
      message: 'Looking forward to authentic Rajasthani dining and heritage courtyard tour.',
    }),
  })
  const booking: any = await bookingRes.json()
  if (!booking.id || booking.status !== 'pending') {
    throw new Error('Booking creation failed: ' + JSON.stringify(booking))
  }
  console.log(`   ✅ Booking #${booking.id} created for "${booking.serviceName}" (Status: ${booking.status})`)

  // 12. Booking: Host Accepts Booking
  console.log(`\n12. Testing PATCH /api/bookings/${booking.id}/status (Host Accept)...`)
  const acceptRes = await fetch(`${API}/bookings/${booking.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${hostToken}`,
    },
    body: JSON.stringify({ status: 'accepted' }),
  })
  const acceptedBooking: any = await acceptRes.json()
  if (acceptedBooking.status !== 'accepted') {
    throw new Error('Booking status update failed: ' + JSON.stringify(acceptedBooking))
  }
  console.log(`   ✅ Booking #${acceptedBooking.id} updated to status: "${acceptedBooking.status}"`)

  // 13. Crowd: Fetch & Update Spots
  console.log('\n13. Testing GET & PATCH /api/crowd/spots (Categorical Density)...')
  const spotsRes = await fetch(`${API}/crowd/spots`)
  const spots: any = await spotsRes.json()
  if (!Array.isArray(spots) || spots.length === 0) throw new Error('Crowd spots fetch failed')
  console.log(`   ✅ Fetched ${spots.length} crowd density spots. Spot 1: ${spots[0].name} (${spots[0].density})`)

  const spotUpdateRes = await fetch(`${API}/crowd/spots/1`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authorityToken}`,
    },
    body: JSON.stringify({ count: 460 }),
  })
  const updatedSpot: any = await spotUpdateRes.json()
  console.log(`   ✅ Updated Amber Fort spot density: ${updatedSpot.density} (${updatedSpot.count}/${updatedSpot.capacity})`)

  // 14. Emergency: Broadcast Alert
  console.log('\n14. Testing POST /api/emergency/alerts (Authority Safety Broadcast)...')
  const alertRes = await fetch(`${API}/emergency/alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authorityToken}`,
    },
    body: JSON.stringify({
      type: 'Festival Crowd Surge',
      message: 'Heavy footfall observed at Amber Fort main courtyard. Alternate gate 2 open for exits.',
      severity: 'high',
      location: 'Amber Fort, Jaipur',
      icon: '👥',
    }),
  })
  const newAlert: any = await alertRes.json()
  if (!newAlert.id) throw new Error('Alert broadcast failed: ' + JSON.stringify(newAlert))
  console.log(`   ✅ Emergency broadcast created: [${newAlert.severity.toUpperCase()}] ${newAlert.message}`)

  // 15. Emergency: Fetch Services
  console.log('\n15. Testing GET /api/emergency/services...')
  const srvRes = await fetch(`${API}/emergency/services?location=Jaipur`)
  const services: any = await srvRes.json()
  if (!Array.isArray(services) || services.length === 0) throw new Error('Services fetch failed')
  console.log(`   ✅ Fetched ${services.length} emergency dispatch & medical points in Jaipur.`)

  // 16. Chat: Two-Way Messaging
  const testThreadId = `req-test-${Date.now()}`
  console.log(`\n16. Testing POST & GET /api/chats/${testThreadId} (Two-Way Host-Tourist Chat)...`)
  await fetch(`${API}/chats/${testThreadId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${touristToken}`,
    },
    body: JSON.stringify({ text: 'Hello Arjun! Is airport pickup available on Friday afternoon?' }),
  })

  await fetch(`${API}/chats/${testThreadId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${hostToken}`,
    },
    body: JSON.stringify({ text: 'Yes Aarav! Our heritage cab will be waiting at Terminal 2.' }),
  })

  const chatRes = await fetch(`${API}/chats/${testThreadId}`)
  const chatMessages: any = await chatRes.json()
  if (chatMessages.length !== 2) throw new Error('Chat verification failed: ' + JSON.stringify(chatMessages))
  console.log(`   ✅ Chat thread verified (${chatMessages.length} messages exchanged between Tourist & Host).`)

  // 17. File Upload Endpoint
  console.log('\n17. Testing POST /api/upload (Multipart Image Upload)...')
  const testImagePath = path.join(process.cwd(), 'test-upload.png')
  // Create a small 1x1 dummy png buffer
  const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
  fs.writeFileSync(testImagePath, dummyPng)

  const form = new FormData()
  form.append('file', fs.createReadStream(testImagePath), { filename: 'test-evidence.png', contentType: 'image/png' })

  const uploadRes = await fetch(`${API}/upload`, {
    method: 'POST',
    body: form as any,
    headers: form.getHeaders(),
  })
  const uploadData: any = await uploadRes.json()
  if (!uploadData.url || !uploadData.url.startsWith('http://localhost:5000/uploads/')) {
    throw new Error('Upload failed: ' + JSON.stringify(uploadData))
  }
  console.log(`   ✅ File uploaded successfully! Hosted URL: ${uploadData.url}`)

  // Clean up temp file
  if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath)

  console.log('\n===============================================================')
  console.log('🎉 ALL 17 END-TO-END INTEGRATION TESTS PASSED WITH 100% SUCCESS!')
  console.log('===============================================================')
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err)
  process.exit(1)
})
