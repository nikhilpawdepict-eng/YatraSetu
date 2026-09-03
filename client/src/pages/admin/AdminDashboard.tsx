import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import {
  Shield,
  Users,
  Home,
  Compass,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle,
  Clock,
  RefreshCw,
  LogOut,
  Zap,
  Leaf,
  Layers,
} from 'lucide-react'

interface AdminDashboardProps {
  onLogout: () => void
  onSwitchRole?: (role: 'user' | 'local' | 'authority' | 'admin') => void
}

export default function AdminDashboard({ onLogout, onSwitchRole }: AdminDashboardProps) {
  const [analytics, setAnalytics] = useState<any | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [notifLogs, setNotifLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'communications'>('analytics')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [analyticsData, usersData, logsData] = await Promise.all([
        api.admin.getAnalytics(),
        api.admin.getAllUsers(),
        api.notifications.getLogs(),
      ])
      setAnalytics(analyticsData)
      setUsers(usersData)
      setNotifLogs(logsData)
    } catch (err: any) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.admin.updateUserRole(userId, newRole)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
    } catch (err: any) {
      alert(err.message || 'Failed to update user role.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-[#141B18] to-[#1C2427] text-white border-b border-white/10 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8B931] text-[#141B18] font-900 flex items-center justify-center text-base shadow-sm">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-800 text-base" style={{ fontFamily: 'Fraunces, serif' }}>
                  YatraSetu Admin Command
                </span>
                <span className="text-[10px] font-800 px-2 py-0.5 rounded-full bg-[#0F6E5C] text-white uppercase tracking-wider">
                  National Tourism Authority
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Ecosystem Health, Local Economy Analytics & Communication Governance
              </p>
            </div>
          </div>

          {/* Quick Role Switcher for Evaluation */}
          <div className="flex items-center gap-2">
            {onSwitchRole && (
              <div className="hidden sm:flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs font-700">
                <span className="text-[10px] text-white/60 px-2 uppercase">Simulate Role:</span>
                <button
                  onClick={() => onSwitchRole('user')}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  Tourist
                </button>
                <button
                  onClick={() => onSwitchRole('local')}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  Local Host
                </button>
                <button
                  onClick={() => onSwitchRole('authority')}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  Authority
                </button>
              </div>
            )}

            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-[#D64545] text-white text-xs font-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Nav Tabs */}
      <div className="bg-white border-b border-[#E4E7E5]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3.5 px-4 text-xs md:text-sm font-700 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-[#0F6E5C] text-[#0F6E5C]'
                : 'border-transparent text-[#7B8582] hover:text-[#141B18]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Platform Analytics & AI Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3.5 px-4 text-xs md:text-sm font-700 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'users'
                ? 'border-[#0F6E5C] text-[#0F6E5C]'
                : 'border-transparent text-[#7B8582] hover:text-[#141B18]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management & Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('communications')}
            className={`py-3.5 px-4 text-xs md:text-sm font-700 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'communications'
                ? 'border-[#0F6E5C] text-[#0F6E5C]'
                : 'border-transparent text-[#7B8582] hover:text-[#141B18]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Communication & Dispatch Logs (WhatsApp / Gmail / SMS)</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 flex-1 space-y-6 w-full">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0F6E5C] animate-spin mx-auto" />
            <p className="text-xs font-700 text-[#7B8582]">Loading Platform Intelligence...</p>
          </div>
        ) : (
          <>
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Top Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#E4E7E5] shadow-xs">
                    <span className="text-xs text-[#7B8582] font-700 uppercase">Total Users</span>
                    <p className="text-2xl font-800 text-[#141B18] mt-1" style={{ fontFamily: 'Fraunces, serif' }}>
                      {analytics.overview.totalUsers}
                    </p>
                    <span className="text-[10px] text-[#1E9E5A] font-700">Active across 4 roles</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E4E7E5] shadow-xs">
                    <span className="text-xs text-[#7B8582] font-700 uppercase">Homestays</span>
                    <p className="text-2xl font-800 text-[#0F6E5C] mt-1" style={{ fontFamily: 'Fraunces, serif' }}>
                      {analytics.overview.totalHomestays}
                    </p>
                    <span className="text-[10px] text-[#0F6E5C] font-700">100% NIDHI Verified</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E4E7E5] shadow-xs">
                    <span className="text-xs text-[#7B8582] font-700 uppercase">Local Guides</span>
                    <p className="text-2xl font-800 text-[#0F6E5C] mt-1" style={{ fontFamily: 'Fraunces, serif' }}>
                      {analytics.overview.totalGuides}
                    </p>
                    <span className="text-[10px] text-[#0F6E5C] font-700">Storytellers onboarded</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E4E7E5] shadow-xs">
                    <span className="text-xs text-[#7B8582] font-700 uppercase">Artisan Crafts</span>
                    <p className="text-2xl font-800 text-[#0F6E5C] mt-1" style={{ fontFamily: 'Fraunces, serif' }}>
                      {analytics.overview.totalProducts}
                    </p>
                    <span className="text-[10px] text-[#0F6E5C] font-700">SHG Products</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E4E7E5] shadow-xs">
                    <span className="text-xs text-[#7B8582] font-700 uppercase">Civic Issues</span>
                    <p className="text-2xl font-800 text-[#D64545] mt-1" style={{ fontFamily: 'Fraunces, serif' }}>
                      {analytics.overview.totalReports}
                    </p>
                    <span className="text-[10px] text-[#1E9E5A] font-700">
                      {analytics.overview.resolutionRatePct}% Resolution rate
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E4E7E5] shadow-xs">
                    <span className="text-xs text-[#7B8582] font-700 uppercase">Dispatches</span>
                    <p className="text-2xl font-800 text-[#141B18] mt-1" style={{ fontFamily: 'Fraunces, serif' }}>
                      {analytics.overview.notificationLogsCount}
                    </p>
                    <span className="text-[10px] text-[#0F6E5C] font-700">WhatsApp / Gmail / SMS</span>
                  </div>
                </div>

                {/* Local Economic Retention & Tourism Demand Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Economic Retention */}
                  <div className="bg-white p-6 rounded-2xl border border-[#E4E7E5] shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-5 h-5 text-[#1E9E5A]" />
                        <h3 className="font-700 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                          Fair-Distribution & Local Economic Retention
                        </h3>
                      </div>
                      <span className="text-xs font-800 px-2.5 py-1 rounded-full bg-[#E4F7EC] text-[#0F5A31]">
                        {analytics.tourismMetrics.localEconomicImpact.retentionRatePct}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#F7F6F2]">
                        <span className="text-[11px] text-[#7B8582] uppercase">Direct to Locals</span>
                        <p className="text-lg font-800 text-[#0F6E5C] mt-0.5">
                          {analytics.tourismMetrics.localEconomicImpact.totalDirectToLocals}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#F7F6F2]">
                        <span className="text-[11px] text-[#7B8582] uppercase">Artisans Benefited</span>
                        <p className="text-lg font-800 text-[#141B18] mt-0.5">
                          {analytics.tourismMetrics.localEconomicImpact.artisansBenefited} Makers
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[#F7F6F2]">
                        <span className="text-[11px] text-[#7B8582] uppercase">Homestays Supported</span>
                        <p className="text-lg font-800 text-[#141B18] mt-0.5">
                          {analytics.tourismMetrics.localEconomicImpact.homestayFamiliesSupported} Families
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-[#505D58] leading-relaxed">
                      Unlike traditional OTAs where up to 35% leaks to intermediaries, YatraSetu ensures transparent direct ledger settlement to rural hosts, certified guides, and craft SHGs.
                    </p>
                  </div>

                  {/* AI Model Health & Latency */}
                  <div className="bg-white p-6 rounded-2xl border border-[#E4E7E5] shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#E8B931]" />
                        <h3 className="font-700 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                          AI/ML Model Health & Response Pipelines
                        </h3>
                      </div>
                      <span className="text-xs font-800 px-2.5 py-1 rounded-full bg-[#E4F3EF] text-[#0F6E5C]">
                        {analytics.aiModelHealth.systemStatus}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F6F2]">
                        <span className="font-700 text-[#141B18]">Crowd Prediction Accuracy</span>
                        <span className="font-800 text-[#1E9E5A]">{analytics.aiModelHealth.crowdPredictionAccuracy}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F6F2]">
                        <span className="font-700 text-[#141B18]">NLP Sentiment Confidence</span>
                        <span className="font-800 text-[#1E9E5A]">{analytics.aiModelHealth.nlpSentimentConfidence}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F6F2]">
                        <span className="font-700 text-[#141B18]">Planner Latency (Time to 3 Plans)</span>
                        <span className="font-800 text-[#0F6E5C]">{analytics.aiModelHealth.plannerExecutionLatency}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Destinations Demand Table */}
                <div className="bg-white rounded-2xl p-6 border border-[#E4E7E5] shadow-xs space-y-4">
                  <h3 className="font-700 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                    Destination Footfall & Demand Forecast Share
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F7F6F2] text-[#7B8582] uppercase tracking-wider font-700 border-b border-[#E4E7E5]">
                        <tr>
                          <th className="px-4 py-3">Destination</th>
                          <th className="px-4 py-3">Search Share</th>
                          <th className="px-4 py-3">Completed Bookings</th>
                          <th className="px-4 py-3">Average Trip Budget</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4E7E5]">
                        {analytics.tourismMetrics.topDestinations.map((dest: any) => (
                          <tr key={dest.name} className="hover:bg-[#F7F6F2]/60">
                            <td className="px-4 py-3 font-700 text-[#141B18]">{dest.name}</td>
                            <td className="px-4 py-3 font-800 text-[#0F6E5C]">{dest.searchShare}</td>
                            <td className="px-4 py-3">{dest.bookings} bookings</td>
                            <td className="px-4 py-3 font-600">{dest.avgBudget}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full bg-[#E4F7EC] text-[#0F5A31] font-700 text-[10px]">
                                Trending High
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl p-6 border border-[#E4E7E5] shadow-xs space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
                  <h3 className="font-700 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                    Registered Platform Users ({users.length})
                  </h3>
                  <span className="text-xs text-[#7B8582]">Role-Based Access Control</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F7F6F2] text-[#7B8582] uppercase tracking-wider font-700 border-b border-[#E4E7E5]">
                      <tr>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Current Role</th>
                        <th className="px-4 py-3">YatraSetu Points</th>
                        <th className="px-4 py-3">Change Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E7E5]">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-[#F7F6F2]/60">
                          <td className="px-4 py-3 flex items-center gap-2 font-700 text-[#141B18]">
                            <span>{u.avatar || '👤'}</span>
                            <span>{u.name}</span>
                          </td>
                          <td className="px-4 py-3 text-[#505D58]">{u.email}</td>
                          <td className="px-4 py-3 text-[#505D58]">{u.location || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-700 text-[10px] uppercase ${
                                u.role === 'admin'
                                  ? 'bg-[#141B18] text-[#E8B931]'
                                  : u.role === 'authority'
                                  ? 'bg-[#E4F3EF] text-[#0F6E5C]'
                                  : u.role === 'local'
                                  ? 'bg-[#FEF3C7] text-[#D89A1C]'
                                  : 'bg-[#F7F6F2] text-[#505D58]'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-800 text-[#0F6E5C]">
                            {u.points || 150} pts
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="px-2 py-1 rounded-lg border border-[#D0D7D4] text-xs font-600 bg-white"
                            >
                              <option value="user">user (Tourist)</option>
                              <option value="local">local (Host/Guide)</option>
                              <option value="authority">authority (Municipal)</option>
                              <option value="admin">admin (Platform)</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'communications' && (
              <div className="bg-white rounded-2xl p-6 border border-[#E4E7E5] shadow-xs space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-[#E4E7E5] pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#0F6E5C]" />
                    <h3 className="font-700 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                      Multi-Channel Dispatch History ({notifLogs.length})
                    </h3>
                  </div>
                  <span className="text-xs text-[#7B8582]">WhatsApp • Google Gmail • Phone SMS</span>
                </div>

                {notifLogs.length === 0 ? (
                  <p className="text-xs text-[#7B8582] py-8 text-center">No notifications recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {notifLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E4E7E5] flex items-start justify-between gap-4 text-xs"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-800 ${
                              log.channel === 'whatsapp'
                                ? 'bg-[#25D366]'
                                : log.channel === 'email'
                                ? 'bg-[#EA4335]'
                                : 'bg-[#0F6E5C]'
                            }`}
                          >
                            {log.channel === 'whatsapp' ? (
                              <MessageSquare className="w-4 h-4" />
                            ) : log.channel === 'email' ? (
                              <Mail className="w-4 h-4" />
                            ) : (
                              <Smartphone className="w-4 h-4" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-700 text-[#141B18] uppercase tracking-wide">
                                {log.channel}
                              </span>
                              <span className="text-[#7B8582]">➔ {log.recipient}</span>
                              {log.subject && (
                                <span className="px-2 py-0.5 rounded-md bg-white text-[#0F6E5C] font-700 text-[10px]">
                                  {log.subject}
                                </span>
                              )}
                            </div>
                            <p className="text-[#505D58] font-mono text-[11px] leading-relaxed">
                              {log.content}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="px-2 py-0.5 rounded-full bg-[#E4F7EC] text-[#0F5A31] font-700 text-[10px]">
                            {log.status}
                          </span>
                          <p className="text-[10px] text-[#7B8582] mt-1">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
