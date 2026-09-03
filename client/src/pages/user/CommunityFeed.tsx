import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { useApp } from '../../context/AppContext'
import {
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Star,
  MapPin,
  Camera,
  CheckCircle,
  Shield,
  ThumbsUp,
  Filter,
  BarChart3,
  TrendingUp,
  X,
  Upload,
} from 'lucide-react'

export default function CommunityFeed() {
  const { activeLocation } = useApp()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sentimentData, setSentimentData] = useState<any | null>(null)
  const [sentimentLoading, setSentimentLoading] = useState(false)

  // Create Post Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState(activeLocation.displayName || 'Jaipur, Rajasthan')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Hidden Gem')
  const [rating, setRating] = useState(5)
  const [imageUrl, setImageUrl] = useState('')
  const [tips, setTips] = useState('')
  const [isHiddenGem, setIsHiddenGem] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const categories = ['All', 'Hidden Gem', 'Food', 'Cultural', 'Photo Spot', 'Travel Tip']

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const data = await api.community.getPosts(selectedCategory)
      setPosts(data)
    } catch (err: any) {
      console.error('Failed to load community posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSentiment = async () => {
    setSentimentLoading(true)
    try {
      const data = await api.community.getReviewSentiment(activeLocation.city || 'Jaipur')
      setSentimentData(data)
    } catch (err: any) {
      console.error('Failed to load sentiment:', err)
    } finally {
      setSentimentLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
    fetchSentiment()
  }, [selectedCategory, activeLocation])

  const handleLike = async (id: string) => {
    try {
      const res = await api.community.likePost(id)
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likes: res.likes } : p))
      )
    } catch (err: any) {
      console.error('Failed to like post:', err)
    }
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content || !location) return
    setSubmitting(true)
    try {
      await api.community.createPost({
        authorName: 'Aarav Sharma',
        authorAvatar: '👤',
        authorRole: 'Community Contributor',
        location,
        title,
        content,
        category,
        rating,
        images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&h=400&fit=crop&auto=format'],
        tips,
        isHiddenGem,
      })
      setIsModalOpen(false)
      setTitle('')
      setContent('')
      setImageUrl('')
      setTips('')
      fetchPosts()
    } catch (err: any) {
      alert(err.message || 'Failed to submit post.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0F6E5C] via-[#0A4E42] to-[#141B18] text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-700">
            <Sparkles className="w-3.5 h-3.5 text-[#E8B931]" />
            <span>Community Tourism Discovery & AI Smart Reviews (Module 3)</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-800 tracking-tight" style={{ fontFamily: 'Fraunces, serif' }}>
            Community Voices, Authentic Photos & Hidden Gems
          </h1>
          <p className="text-sm text-white/80 leading-relaxed">
            Discover verified local secrets, food trails, and travel tips contributed by tourists and verified community hosts.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[#E8B931] text-[#141B18] font-800 text-xs md:text-sm hover:bg-[#d4a82b] transition-all flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Share Experience / Hidden Gem</span>
        </button>
      </div>

      {/* AI Smart Reviews Sentiment Analyzer Panel */}
      {sentimentData && (
        <div className="bg-white rounded-2xl p-6 border border-[#E4E7E5] shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4E7E5] pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0F6E5C]" />
              <h2 className="font-700 text-base text-[#141B18]" style={{ fontFamily: 'Fraunces, serif' }}>
                AI Smart Review Sentiment Intelligence — {sentimentData.location}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-700 px-2.5 py-1 rounded-full bg-[#E4F7EC] text-[#0F5A31]">
                ✓ {sentimentData.spamDetection.authenticityConfidence}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {sentimentData.categorySentiments.map((cat: any) => (
              <div key={cat.category} className="p-3.5 rounded-xl bg-[#F7F6F2] border border-[#E4E7E5] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-700 text-[#141B18] truncate">{cat.category}</span>
                  <span className="text-xs font-800 text-[#1E9E5A]">{cat.positivePct}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#E4E7E5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1E9E5A] rounded-full"
                    style={{ width: `${cat.positivePct}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#505D58] line-clamp-2 italic">
                  "{cat.samplePhrase}"
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[#E4F3EF] text-xs text-[#0F6E5C] font-600 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 flex-shrink-0" />
            <span><strong>Executive Summary:</strong> {sentimentData.executiveSummary}</span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-700 transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0F6E5C] text-white shadow-xs'
                  : 'bg-white border border-[#E4E7E5] text-[#505D58] hover:bg-[#E4F3EF]'
              }`}
            >
              {cat === 'All' ? '🌟 All Discoveries' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-[#E4E7E5]" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E4E7E5] space-y-3">
          <p className="text-3xl">🏞️</p>
          <h3 className="text-base font-700 text-[#141B18]">No community posts found for this category</h3>
          <p className="text-xs text-[#7B8582]">Be the first to share an authentic photo or tip!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-[#E4E7E5] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Image Container */}
              {post.images && post.images.length > 0 && (
                <div className="h-48 relative overflow-hidden bg-[#F7F6F2]">
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-700 uppercase">
                      {post.category}
                    </span>
                    {post.isHiddenGem && (
                      <span className="px-2.5 py-1 rounded-full bg-[#E8B931] text-[#141B18] text-[10px] font-800">
                        ⭐ Hidden Gem
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-xs font-700 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#E8B931] fill-[#E8B931]" />
                    <span>{post.rating}</span>
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{post.authorAvatar || '👤'}</span>
                    <div>
                      <p className="text-xs font-700 text-[#141B18]">{post.authorName}</p>
                      <p className="text-[10px] text-[#7B8582]">{post.authorRole || 'Explorer'}</p>
                    </div>
                  </div>

                  <h3 className="font-700 text-base text-[#141B18] group-hover:text-[#0F6E5C] transition-colors" style={{ fontFamily: 'Fraunces, serif' }}>
                    {post.title}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-[#0F6E5C] font-600">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{post.location}</span>
                  </div>

                  <p className="text-xs text-[#505D58] leading-relaxed line-clamp-3">
                    {post.content}
                  </p>

                  {post.tips && (
                    <div className="p-2.5 rounded-xl bg-[#E4F3EF] text-[11px] text-[#0F6E5C] font-600">
                      💡 <strong>Local Tip:</strong> {post.tips}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E4E7E5] text-xs">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 text-[#505D58] hover:text-[#D64545] transition-colors cursor-pointer font-600"
                  >
                    <Heart className="w-4 h-4 text-[#D64545] fill-[#D64545]" />
                    <span>{post.likes} Helpful</span>
                  </button>

                  <span className="text-[11px] text-[#7B8582]">
                    {new Date(post.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#E4E7E5] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-gradient-to-r from-[#0F6E5C] to-[#0A4E42] text-white flex items-center justify-between flex-shrink-0">
              <h3 className="font-700 text-base" style={{ fontFamily: 'Fraunces, serif' }}>
                Share Your Discovery or Hidden Gem
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Secret Stepwell with Symmetrical Staircases"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D7D4] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F6E5C]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Amer, Jaipur"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D0D7D4] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D0D7D4] text-xs bg-white font-600"
                  >
                    <option value="Hidden Gem">Hidden Gem</option>
                    <option value="Food">Food & Gastronomy</option>
                    <option value="Cultural">Cultural Experience</option>
                    <option value="Photo Spot">Photo Spot</option>
                    <option value="Travel Tip">Travel Tip</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1">
                  Experience Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tell travelers what makes this spot special, how to reach it, and what to expect..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D0D7D4] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1">
                  Photo URL (Unsplash or Direct Image)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D0D7D4] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-700 text-[#141B18] uppercase tracking-wider mb-1">
                  Verified Local Tip / Best Time to Visit
                </label>
                <input
                  type="text"
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  placeholder="e.g. Visit at 7 AM before gates lock; order the ginger kulhad chai outside"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D0D7D4] text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="gemCheck"
                  checked={isHiddenGem}
                  onChange={(e) => setIsHiddenGem(e.target.checked)}
                  className="w-4 h-4 accent-[#0F6E5C]"
                />
                <label htmlFor="gemCheck" className="text-xs font-700 text-[#141B18] cursor-pointer">
                  Tag as Hidden Gem (Off the beaten path)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E4E7E5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-700 text-[#505D58] hover:bg-[#F7F6F2] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#0F6E5C] text-white font-700 text-xs hover:bg-[#0A4E42] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish to Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
