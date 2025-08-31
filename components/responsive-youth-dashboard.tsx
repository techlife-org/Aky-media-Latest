"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Home,
  Music,
  Video,
  BookOpen,
  User,
  Play,
  Pause,
  Heart,
  Share2,
  Eye,
  Clock,
  MapPin,
  Calendar,
  LogOut,
  Upload,
  Edit,
  FileText,
  Camera,
  Users,
  CheckCircle,
  ExternalLink,
  X,
  Save,
  Phone,
  Mail,
  MapPinIcon,
  Briefcase,
  Menu,
  Bell,
  Settings,
  Search,
  Grid3X3,
  List,
  Filter,
  Download,
  Star,
  TrendingUp,
  Award,
  Target,
  Zap,
  MessageCircle,
  Bookmark,
  Send,
  MoreHorizontal,
  Plus,
  ChevronRight,
  Loader2,
  Wifi,
  WifiOff
} from "lucide-react"
import { toast } from "sonner"
import ProgramApplicationForm from "@/components/program-application-form"

interface YouthData {
  _id: string
  fullName: string
  email: string
  phone: string
  uniqueId: string
  lga: string
  occupation: string
  profilePicture?: { url: string }
  cv?: { url: string; filename: string }
  ninDocument?: { url: string }
}

interface Program {
  _id: string
  title: string
  description: string
  category: string
  duration: string
  location: string
  benefits: string[]
  status: string
  applicationRequired: boolean
  applicationDeadline?: string
  requiredDocuments: string[]
  customQuestions?: {
    question: string
    type: 'text' | 'textarea' | 'select'
    options?: string[]
    required: boolean
  }[]
  totalApplications: number
}

interface MusicTrack {
  _id: string
  title: string
  artist: string
  genre: string
  audioUrl: string
  duration: number
  coverImageUrl?: string
  playCount: number
  likes: number
}

interface VideoContent {
  _id: string
  title: string
  description: string
  category: string
  videoUrl: string
  thumbnailUrl?: string
  duration: number
  viewCount: number
  likes: number
}

interface NewsItem {
  id: string
  title: string
  content: string
  doc_type?: string
  created_at: string
  updated_at?: string
  attachments?: {
    url: string
    type: "image" | "document" | "video" | "link"
    name?: string
    order?: number
  }[]
  views?: number
}

export default function ResponsiveYouthDashboard() {
  const router = useRouter()
  const [youthData, setYouthData] = useState<YouthData | null>(null)
  const [activeTab, setActiveTab] = useState("home")
  const [programs, setPrograms] = useState<Program[]>([])
  const [music, setMusic] = useState<MusicTrack[]>([])
  const [videos, setVideos] = useState<VideoContent[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    occupation: ''
  })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  
  // Search functionality states
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFilter, setSearchFilter] = useState<'all' | 'news' | 'music' | 'videos'>('all')
  const [searchResults, setSearchResults] = useState<{
    news: NewsItem[]
    music: MusicTrack[]
    videos: VideoContent[]
  }>({ news: [], music: [], videos: [] })
  
  // Desktop search states
  const [desktopMusicSearchQuery, setDesktopMusicSearchQuery] = useState("")
  const [showDesktopMusicSearch, setShowDesktopMusicSearch] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [showGenreFilter, setShowGenreFilter] = useState(false)
  
  // Mobile music search states
  const [mobileMusicSearchQuery, setMobileMusicSearchQuery] = useState("")
  const [showMobileMusicSearch, setShowMobileMusicSearch] = useState(false)
  
  // Loading states for performance optimization
  const [isLoadingMusic, setIsLoadingMusic] = useState(false)
  const [musicLoadError, setMusicLoadError] = useState<string | null>(null)
  const [audioLoadingStates, setAudioLoadingStates] = useState<Record<string, boolean>>({})
  const [preloadedAudio, setPreloadedAudio] = useState<Record<string, HTMLAudioElement>>({})
  
  // Music player states
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set())
  const [buffering, setBuffering] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    checkAuthentication()
  }, [])

  useEffect(() => {
    if (youthData) {
      loadContent()
    }
  }, [youthData])

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch()
    } else {
      setSearchResults({ news: [], music: [], videos: [] })
    }
  }, [searchQuery, searchFilter, news, music, videos])

  const performSearch = () => {
    const query = searchQuery.toLowerCase().trim()
    
    const filteredNews = news.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      (item.doc_type && item.doc_type.toLowerCase().includes(query))
    )
    
    const filteredMusic = music.filter(track =>
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      track.genre.toLowerCase().includes(query)
    )
    
    const filteredVideos = videos.filter(video =>
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query) ||
      video.category.toLowerCase().includes(query)
    )
    
    setSearchResults({
      news: filteredNews,
      music: filteredMusic,
      videos: filteredVideos
    })
  }

  const getFilteredResults = () => {
    switch (searchFilter) {
      case 'news':
        return { news: searchResults.news, music: [], videos: [] }
      case 'music':
        return { news: [], music: searchResults.music, videos: [] }
      case 'videos':
        return { news: [], music: [], videos: searchResults.videos }
      default:
        return searchResults
    }
  }

  const getTotalResults = () => {
    const filtered = getFilteredResults()
    return filtered.news.length + filtered.music.length + filtered.videos.length
  }

  // Get unique genres from music tracks
  const getAvailableGenres = () => {
    const genres = music.map(track => track.genre)
    return ['all', ...Array.from(new Set(genres))]
  }

  // Desktop music filtering function
  const getFilteredMusic = () => {
    let filteredMusic = music
    
    // Apply search filter
    if (desktopMusicSearchQuery.trim()) {
      const query = desktopMusicSearchQuery.toLowerCase().trim()
      filteredMusic = filteredMusic.filter(track =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.genre.toLowerCase().includes(query)
      )
    }
    
    // Apply genre filter
    if (selectedGenre !== 'all') {
      filteredMusic = filteredMusic.filter(track => track.genre === selectedGenre)
    }
    
    return filteredMusic
  }

  // Mobile music filtering function
  const getMobileFilteredMusic = () => {
    let filteredMusic = music
    
    // Apply search filter
    if (mobileMusicSearchQuery.trim()) {
      const query = mobileMusicSearchQuery.toLowerCase().trim()
      filteredMusic = filteredMusic.filter(track =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.genre.toLowerCase().includes(query)
      )
    }
    
    return filteredMusic
  }

  // Optimized audio preloading
  const preloadAudio = async (track: MusicTrack) => {
    if (preloadedAudio[track._id] || track.audioUrl === '#') return
    
    try {
      const audio = new Audio()
      audio.preload = 'metadata'
      audio.src = track.audioUrl
      
      await new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', resolve)
        audio.addEventListener('error', reject)
        setTimeout(reject, 5000) // 5 second timeout
      })
      
      setPreloadedAudio(prev => ({ ...prev, [track._id]: audio }))
    } catch (error) {
      console.warn(`Failed to preload audio for ${track.title}:`, error)
    }
  }

  // Enhanced music player functions
  const handleLikeTrack = (trackId: string) => {
    setLikedTracks(prev => {
      const newLiked = new Set(prev)
      if (newLiked.has(trackId)) {
        newLiked.delete(trackId)
      } else {
        newLiked.add(trackId)
      }
      return newLiked
    })
  }

  const handlePlayTrack = async (track: MusicTrack) => {
    if (track.audioUrl === '#') {
      toast.error('Audio not available for this track')
      return
    }

    setCurrentTrack(track)
    setAudioLoadingStates(prev => ({ ...prev, [track._id]: true }))
    setBuffering(true)
    
    try {
      if (currentlyPlaying === track._id) {
        // Toggle play/pause for current track
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
          } else {
            await audioRef.current.play()
            setIsPlaying(true)
          }
        }
      } else {
        // Play new track
        if (audioRef.current) {
          // Use preloaded audio if available
          const preloaded = preloadedAudio[track._id]
          if (preloaded) {
            audioRef.current.src = preloaded.src
          } else {
            audioRef.current.src = track.audioUrl
          }
          
          audioRef.current.currentTime = 0
          await audioRef.current.play()
          setIsPlaying(true)
        }
        setCurrentlyPlaying(track._id)
      }
    } catch (error) {
      console.error('Error playing track:', error)
      toast.error('Failed to play track. Please try again.')
      setIsPlaying(false)
    } finally {
      setAudioLoadingStates(prev => ({ ...prev, [track._id]: false }))
      setBuffering(false)
    }
  }

  // Preload next tracks for better performance
  useEffect(() => {
    if (music.length > 0) {
      // Preload first 3 tracks
      music.slice(0, 3).forEach(track => {
        preloadAudio(track)
      })
    }
  }, [music])

  // Audio event handlers with better error handling
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration || 0)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentlyPlaying(null)
      setCurrentTrack(null)
    }
    const handlePlay = () => {
      setIsPlaying(true)
      setBuffering(false)
    }
    const handlePause = () => setIsPlaying(false)
    const handleWaiting = () => setBuffering(true)
    const handleCanPlay = () => setBuffering(false)
    const handleError = (e: Event) => {
      console.error('Audio error:', e)
      setIsPlaying(false)
      setBuffering(false)
      toast.error('Audio playback error')
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  const checkAuthentication = async () => {
    const token = localStorage.getItem("youthToken")
    
    if (!token) {
      router.push("/youth-login")
      return
    }

    try {
      const response = await fetch("/api/youth/auth", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Authentication failed")
      }

      const result = await response.json()
      setYouthData(result.youth)

      // Check onboarding and CV upload status
      if (!result.youth.onboardingCompleted) {
        router.push("/youth-onboarding")
        return
      }

      if (!result.youth.cvUploaded) {
        router.push("/youth-cv-upload")
        return
      }

    } catch (error) {
      console.error("Authentication error:", error)
      localStorage.removeItem("youthToken")
      router.push("/youth-login")
    }
  }

  const loadContent = async () => {
    try {
      // Load programs with fallback
      try {
        const programsRes = await fetch("/api/youth/programs")
        if (programsRes.ok) {
          const programsData = await programsRes.json()
          setPrograms(programsData.data || [])
        } else {
          // Fallback sample programs
          setPrograms([
            {
              _id: 'sample-prog-1',
              title: 'Digital Skills Training',
              description: 'Learn essential digital skills for the modern workplace including computer literacy, internet usage, and basic software applications.',
              category: 'Technology',
              duration: '3 months',
              location: 'Kano State',
              benefits: ['Certificate', 'Job Placement', 'Mentorship'],
              status: 'active',
              applicationRequired: true,
              totalApplications: 150
            },
            {
              _id: 'sample-prog-2',
              title: 'Entrepreneurship Bootcamp',
              description: 'Transform your business ideas into reality with comprehensive training on business planning, marketing, and financial management.',
              category: 'Business',
              duration: '6 weeks',
              location: 'Kano State',
              benefits: ['Startup Grant', 'Business Plan', 'Networking'],
              status: 'active',
              applicationRequired: true,
              totalApplications: 89
            }
          ])
        }
      } catch (error) {
        console.error('Error loading programs:', error)
        setPrograms([])
      }

      // Load music with optimized loading and fallback
      setIsLoadingMusic(true)
      setMusicLoadError(null)
      try {
        const musicRes = await fetch("/api/youth/music", {
          headers: {
            'Cache-Control': 'max-age=300' // 5 minute cache
          }
        })
        if (musicRes.ok) {
          const musicData = await musicRes.json()
          const tracks = musicData.data || []
          setMusic(tracks)
          
          // Preload first track for instant playback
          if (tracks.length > 0 && tracks[0].audioUrl !== '#') {
            preloadAudio(tracks[0])
          }
        } else {
          // Enhanced fallback sample music with better variety
          const fallbackMusic = [
            {
              _id: 'sample-music-1',
              title: 'Youth Anthem',
              artist: 'AKY Artists',
              genre: 'Inspirational',
              audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
              duration: 180,
              playCount: 1250,
              likes: 89,
              coverImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
            },
            {
              _id: 'sample-music-2',
              title: 'Dreams Come True',
              artist: 'Kano Youth Choir',
              genre: 'Motivational',
              audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
              duration: 240,
              playCount: 890,
              likes: 67,
              coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop'
            },
            {
              _id: 'sample-music-3',
              title: 'Rise Up',
              artist: 'Youth Voices',
              genre: 'Hip Hop',
              audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
              duration: 200,
              playCount: 750,
              likes: 45,
              coverImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
            },
            {
              _id: 'sample-music-4',
              title: 'Future Leaders',
              artist: 'AKY Collective',
              genre: 'Pop',
              audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
              duration: 195,
              playCount: 1100,
              likes: 78,
              coverImageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'
            },
            {
              _id: 'sample-music-5',
              title: 'Unity Song',
              artist: 'Northern Voices',
              genre: 'Folk',
              audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
              duration: 220,
              playCount: 650,
              likes: 92,
              coverImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
            }
          ]
          setMusic(fallbackMusic)
        }
      } catch (error) {
        console.error('Error loading music:', error)
        setMusicLoadError('Failed to load music. Please try again.')
        setMusic([])
      } finally {
        setIsLoadingMusic(false)
      }

      // Load videos with fallback
      try {
        const videosRes = await fetch("/api/youth/videos")
        if (videosRes.ok) {
          const videosData = await videosRes.json()
          setVideos(videosData.data || [])
        } else {
          // Fallback sample videos
          setVideos([
            {
              _id: 'sample-video-1',
              title: 'Youth Success Stories',
              description: 'Inspiring stories from successful youth program graduates',
              category: 'Inspiration',
              videoUrl: '#',
              duration: 300,
              viewCount: 2150,
              likes: 145
            },
            {
              _id: 'sample-video-2',
              title: 'Skills Development Workshop',
              description: 'Highlights from our recent skills development workshop',
              category: 'Education',
              videoUrl: '#',
              duration: 420,
              viewCount: 1890,
              likes: 123
            },
            {
              _id: 'sample-video-3',
              title: 'Entrepreneurship Journey',
              description: 'Follow young entrepreneurs as they build their businesses',
              category: 'Business',
              videoUrl: '#',
              duration: 360,
              viewCount: 1650,
              likes: 98
            }
          ])
        }
      } catch (error) {
        console.error('Error loading videos:', error)
        setVideos([])
      }

      // Load news with fallback
      try {
        const newsRes = await fetch("/api/news")
        
        if (newsRes.ok) {
          const newsData = await newsRes.json()
          
          if (Array.isArray(newsData)) {
            const sortedNews = newsData
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 10)
            setNews(sortedNews)
          } else {
            setNews([])
          }
        } else {
          // Fallback to sample news
          const sampleNews = [
            {
              id: 'sample-1',
              title: 'Welcome to AKY Digital Hub',
              content: 'We are excited to launch this comprehensive youth development program aimed at empowering the youth of Kano State with skills, opportunities, and resources for a brighter future.',
              doc_type: 'announcement',
              created_at: new Date().toISOString(),
              attachments: [{
                url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
                type: 'image' as const,
                name: 'youth-program.jpg'
              }],
              views: 245
            },
            {
              id: 'sample-2',
              title: 'Skills Development Workshop Starting Soon',
              content: 'Join our upcoming digital skills workshop designed to enhance your professional capabilities and career prospects in the modern economy.',
              doc_type: 'workshop',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              attachments: [{
                url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
                type: 'image' as const,
                name: 'workshop.jpg'
              }],
              views: 189
            },
            {
              id: 'sample-3',
              title: 'Entrepreneurship Bootcamp Registration Open',
              content: 'Transform your business ideas into reality with our comprehensive entrepreneurship bootcamp. Limited slots available!',
              doc_type: 'program',
              created_at: new Date(Date.now() - 172800000).toISOString(),
              attachments: [{
                url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop',
                type: 'image' as const,
                name: 'entrepreneurship.jpg'
              }],
              views: 312
            },
            {
              id: 'sample-4',
              title: 'Youth Innovation Challenge 2024',
              content: 'Calling all young innovators! Submit your creative solutions to address local challenges and win amazing prizes.',
              doc_type: 'competition',
              created_at: new Date(Date.now() - 259200000).toISOString(),
              attachments: [{
                url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
                type: 'image' as const,
                name: 'innovation.jpg'
              }],
              views: 156
            }
          ]
          setNews(sampleNews)
        }
      } catch (newsError) {
        console.error('Error fetching news:', newsError)
        // Fallback to sample news
        const sampleNews = [
          {
            id: 'sample-1',
            title: 'Welcome to AKY Digital Hub',
            content: 'We are excited to launch this comprehensive youth development program aimed at empowering the youth of Kano State with skills, opportunities, and resources for a brighter future.',
            doc_type: 'announcement',
            created_at: new Date().toISOString(),
            attachments: [{
              url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
              type: 'image' as const,
              name: 'youth-program.jpg'
            }],
            views: 245
          }
        ]
        setNews(sampleNews)
      }

    } catch (error) {
      console.error("Error loading content:", error)
    }
  }

  const handlePlayMusic = (track: MusicTrack) => {
    handlePlayTrack(track)
  }

  // Skeleton loader component
  const MusicSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
        <div className="w-12 h-12 bg-gray-300 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-3 bg-gray-300 rounded w-1/2" />
          <div className="h-3 bg-gray-300 rounded w-1/4" />
        </div>
        <div className="w-8 h-8 bg-gray-300 rounded" />
      </div>
    </div>
  )

  // Desktop skeleton loader
  const DesktopMusicSkeleton = () => (
    <div className="animate-pulse">
      <Card className="overflow-hidden">
        <div className="aspect-square bg-gray-300" />
        <CardContent className="p-4 space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-3 bg-gray-300 rounded w-1/2" />
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gray-300 rounded w-1/4" />
            <div className="h-3 bg-gray-300 rounded w-1/4" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-300 rounded flex-1" />
            <div className="h-8 w-8 bg-gray-300 rounded" />
            <div className="h-8 w-8 bg-gray-300 rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const handlePlayVideo = (video: VideoContent) => {
    setCurrentVideo(video._id)
  }

  const handleLogout = () => {
    localStorage.removeItem("youthToken")
    localStorage.removeItem("youthData")
    toast.success("Logged out successfully")
    router.push("/youth-login")
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleApplyToProgram = (program: Program) => {
    setSelectedProgram(program)
    setShowApplicationForm(true)
  }

  const handleApplicationSuccess = () => {
    loadContent()
  }

  const openDocument = (url: string) => {
    window.open(url, '_blank')
  }

  const handleEditProfile = () => {
    if (youthData) {
      setEditFormData({
        fullName: youthData.fullName,
        email: youthData.email,
        phone: youthData.phone,
        occupation: youthData.occupation
      })
      setShowEditProfile(true)
    }
  }

  const handleUpdateProfile = async () => {
    if (!youthData) return
    
    setIsUpdatingProfile(true)
    
    try {
      const token = localStorage.getItem("youthToken")
      
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("/api/youth/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to update profile")
      }

      setYouthData(prev => prev ? { ...prev, ...editFormData } : null)
      setShowEditProfile(false)
      toast.success("Profile updated successfully! 🎉")

    } catch (error) {
      console.error("Profile update error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleLikePost = (postId: string) => {
    setLikedPosts(prev => {
      const newLiked = new Set(prev)
      if (newLiked.has(postId)) {
        newLiked.delete(postId)
      } else {
        newLiked.add(postId)
      }
      return newLiked
    })
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "programs", label: "Programs", icon: BookOpen },
    { id: "music", label: "Music", icon: Music },
    { id: "videos", label: "Videos", icon: Video },
    { id: "news", label: "News", icon: FileText },
    { id: "profile", label: "Profile", icon: User }
  ]

  if (!youthData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile View (< lg) - Instagram Style */}
      <div className="lg:hidden">
        {/* Instagram-style Header */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={youthData.profilePicture?.url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                  {youthData.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-xl font-bold text-gray-900">AKY Youth</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="pb-16">
          {/* Home Feed */}
          {activeTab === "home" && (
            <div className="space-y-0">
              {/* Stories Section */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className="relative">
                      <Avatar className="w-16 h-16 border-2 border-gray-300">
                        <AvatarImage src={youthData.profilePicture?.url} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {youthData.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">Your Story</span>
                  </div>
                  
                  {/* Sample stories */}
                  {['Programs', 'Music', 'Videos', 'News'].map((story, index) => (
                    <div key={story} className="flex flex-col items-center gap-2 flex-shrink-0">
                      <Avatar className="w-16 h-16 border-2 border-gradient-to-r from-pink-500 to-orange-500 p-0.5">
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{story[0]}</span>
                        </div>
                      </Avatar>
                      <span className="text-xs text-gray-600">{story}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feed Posts */}
              <div className="space-y-0">
                {news.map((item) => {
                  const imageAttachment = item.attachments?.find(att => att.type === 'image')
                  const isLiked = likedPosts.has(item.id)
                  
                  return (
                    <div key={item.id} className="bg-white border-b border-gray-100">
                      {/* Post Header */}
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                              AKY
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{item.title}</p>
                            <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Post Image */}
                      {imageAttachment && (
                        <div className="aspect-square bg-gray-100">
                          <img 
                            src={imageAttachment.url} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Post Actions */}
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-0 hover:bg-transparent"
                              onClick={() => handleLikePost(item.id)}
                            >
                              <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-900'}`} />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                              <MessageCircle className="w-6 h-6 text-gray-900" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                              <Send className="w-6 h-6 text-gray-900" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                            <Bookmark className="w-6 h-6 text-gray-900" />
                          </Button>
                        </div>

                        {/* Likes */}
                        <p className="font-semibold text-sm mb-2">{(item.views || 0) + (isLiked ? 1 : 0)} likes</p>

                        {/* Caption */}
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-semibold">akyprogram</span> {item.title}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">{item.content}</p>
                          <Button variant="ghost" className="p-0 h-auto text-sm text-gray-500 hover:bg-transparent">
                            View all comments
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
            <div className="p-4 space-y-4">
              {/* Search Header */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Search</h2>
                
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search news, music, videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'news', label: 'News' },
                    { key: 'music', label: 'Music' },
                    { key: 'videos', label: 'Videos' }
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={searchFilter === filter.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSearchFilter(filter.key as any)}
                      className="flex-shrink-0"
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Search Results */}
              {searchQuery.trim() ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {getTotalResults()} result{getTotalResults() !== 1 ? 's' : ''} for "{searchQuery}"
                    </p>
                  </div>

                  {getTotalResults() === 0 ? (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No results found</p>
                      <p className="text-sm text-gray-400">Try different keywords</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* News Results */}
                      {getFilteredResults().news.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            News ({getFilteredResults().news.length})
                          </h3>
                          {getFilteredResults().news.map((item) => {
                            const imageAttachment = item.attachments?.find(att => att.type === 'image')
                            return (
                              <Card key={item.id} className="overflow-hidden">
                                <CardContent className="p-3">
                                  <div className="flex gap-3">
                                    {imageAttachment && (
                                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <img 
                                          src={imageAttachment.url} 
                                          alt={item.title}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-sm line-clamp-2 mb-1">{item.title}</h4>
                                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{item.content}</p>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs">{item.doc_type || 'News'}</Badge>
                                        <span className="text-xs text-gray-500">
                                          {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      )}

                      {/* Music Results */}
                      {getFilteredResults().music.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            Music ({getFilteredResults().music.length})
                          </h3>
                          {getFilteredResults().music.map((track) => (
                            <Card key={track._id} className="overflow-hidden">
                              <CardContent className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {track.coverImageUrl ? (
                                      <img 
                                        src={track.coverImageUrl} 
                                        alt={track.title}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    ) : (
                                      <Music className="w-6 h-6 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{track.title}</h4>
                                    <p className="text-xs text-gray-600 truncate">{track.artist}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">{track.genre}</Badge>
                                      <span className="text-xs text-gray-500">{formatDuration(track.duration)}</span>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handlePlayMusic(track)}
                                    className="p-2"
                                  >
                                    {currentlyPlaying === track._id ? (
                                      <Pause className="w-4 h-4" />
                                    ) : (
                                      <Play className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Video Results */}
                      {getFilteredResults().videos.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Videos ({getFilteredResults().videos.length})
                          </h3>
                          {getFilteredResults().videos.map((video) => (
                            <Card key={video._id} className="overflow-hidden">
                              <CardContent className="p-3">
                                <div className="flex gap-3">
                                  <div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    {video.thumbnailUrl ? (
                                      <img 
                                        src={video.thumbnailUrl} 
                                        alt={video.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                        <Video className="w-6 h-6 text-white" />
                                      </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                                        <Play className="w-3 h-3 text-gray-800 ml-0.5" />
                                      </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                                      {formatDuration(video.duration)}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
                                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{video.description}</p>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">{video.category}</Badge>
                                      <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {video.viewCount}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Search for news, music, and videos</p>
                  <p className="text-sm text-gray-400">Enter keywords to find content</p>
                </div>
              )}
            </div>
          )}

          {/* Programs Tab */}
          {activeTab === "programs" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Programs</h2>
                <Button variant="ghost" size="sm">
                  <Grid3X3 className="w-5 h-5" />
                </Button>
              </div>
              
              {programs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {programs.map((program) => (
                    <Card key={program._id} className="overflow-hidden border-0 shadow-sm bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-base mb-1">{program.title}</h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{program.description}</p>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary" className="text-xs">{program.category}</Badge>
                              <span className="text-xs text-gray-500">• {program.duration}</span>
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                              onClick={() => handleApplyToProgram(program)}
                            >
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">No programs available</p>
                  <Button onClick={() => loadContent()}>Refresh</Button>
                </div>
              )}
            </div>
          )}

          {/* Music Tab */}
          {activeTab === "music" && (
            <div className="space-y-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Music</h2>
                    <p className="text-purple-100 text-sm">Discover amazing tracks</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowMobileMusicSearch(!showMobileMusicSearch)}
                    className="text-white hover:bg-white/20"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Search Input */}
                {showMobileMusicSearch && (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search music..."
                      value={mobileMusicSearchQuery}
                      onChange={(e) => setMobileMusicSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    />
                  </div>
                )}
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{music.length}</div>
                    <div className="text-xs text-purple-100">Tracks</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{getAvailableGenres().length - 1}</div>
                    <div className="text-xs text-purple-100">Genres</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{likedTracks.size}</div>
                    <div className="text-xs text-purple-100">Liked</div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* Loading State */}
                {isLoadingMusic ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                      <span className="ml-2 text-gray-600">Loading music...</span>
                    </div>
                    {[...Array(3)].map((_, i) => (
                      <MusicSkeleton key={i} />
                    ))}
                  </div>
                ) : musicLoadError ? (
                  <div className="text-center py-12">
                    <WifiOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">{musicLoadError}</p>
                    <Button 
                      onClick={() => loadContent()}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                    >
                      <Wifi className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : getMobileFilteredMusic().length > 0 ? (
                  <div className="space-y-4">
                    {mobileMusicSearchQuery.trim() && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {getMobileFilteredMusic().length} result{getMobileFilteredMusic().length !== 1 ? 's' : ''} for "{mobileMusicSearchQuery}"
                        </p>
                      </div>
                    )}
                    
                    {/* Music List */}
                    <div className="space-y-3">
                      {getMobileFilteredMusic().map((track, index) => {
                        const isCurrentTrack = currentlyPlaying === track._id
                        const isLiked = likedTracks.has(track._id)
                        const isLoading = audioLoadingStates[track._id]
                        
                        return (
                          <div key={track._id} className={`relative overflow-hidden rounded-2xl ${isCurrentTrack ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200' : 'bg-white border border-gray-100'} shadow-sm`}>
                            <div className="flex items-center gap-4 p-4">
                              {/* Track Number & Cover */}
                              <div className="relative flex-shrink-0">
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                  {track.coverImageUrl ? (
                                    <img 
                                      src={track.coverImageUrl} 
                                      alt={track.title}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <Music className="w-7 h-7 text-white" />
                                  )}
                                </div>
                                {isCurrentTrack && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                    {buffering ? (
                                      <Loader2 className="w-3 h-3 text-white animate-spin" />
                                    ) : (
                                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Track Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-sm truncate ${isCurrentTrack ? 'text-purple-900' : 'text-gray-900'}`}>
                                  {track.title}
                                </h3>
                                <p className={`text-xs truncate ${isCurrentTrack ? 'text-purple-600' : 'text-gray-600'}`}>
                                  {track.artist}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant={isCurrentTrack ? "default" : "secondary"} className="text-xs px-2 py-0.5">
                                    {track.genre}
                                  </Badge>
                                  <span className={`text-xs ${isCurrentTrack ? 'text-purple-500' : 'text-gray-500'}`}>
                                    {formatDuration(track.duration)}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLikeTrack(track._id)}
                                  className={`p-2 ${isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                                >
                                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handlePlayMusic(track)}
                                  disabled={isLoading}
                                  className={`p-2 ${isCurrentTrack ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                >
                                  {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : isCurrentTrack && isPlaying ? (
                                    <Pause className="w-4 h-4" />
                                  ) : (
                                    <Play className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            
                            {/* Progress Bar for Current Track */}
                            {isCurrentTrack && duration > 0 && (
                              <div className="px-4 pb-3">
                                <div className="w-full bg-purple-200 rounded-full h-1">
                                  <div 
                                    className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-purple-600 mt-1">
                                  <span>{formatDuration(Math.floor(currentTime))}</span>
                                  <span>{formatDuration(Math.floor(duration))}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    {mobileMusicSearchQuery.trim() ? (
                      <div>
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">No music found</p>
                        <p className="text-sm text-gray-400">Try different search terms</p>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Music className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Music Available</h3>
                        <p className="text-gray-600 mb-4 text-sm">Discover amazing tracks when they're available</p>
                        <Button 
                          onClick={() => loadContent()} 
                          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                        >
                          <Music className="w-4 h-4 mr-2" />
                          Refresh
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <audio ref={audioRef} />
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === "videos" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Videos</h2>
                <Button variant="ghost" size="sm">
                  <Grid3X3 className="w-5 h-5" />
                </Button>
              </div>
              
              {videos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {videos.map((video) => (
                    <div key={video._id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                      {currentVideo === video._id ? (
                        <video
                          ref={videoRef}
                          src={video.videoUrl}
                          controls
                          className="w-full h-full object-cover"
                          autoPlay
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-800 group"
                          onClick={() => handlePlayVideo(video)}
                        >
                          {video.thumbnailUrl ? (
                            <img 
                              src={video.thumbnailUrl} 
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Video className="w-8 h-8 text-white" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                              <Play className="w-6 h-6 text-gray-800 ml-1" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(video.duration)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">No videos available</p>
                  <Button onClick={() => loadContent()}>Refresh</Button>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-0">
              {/* Profile Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={youthData.profilePicture?.url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                      {youthData.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">{youthData.fullName}</h2>
                    <p className="text-gray-600">{youthData.occupation}</p>
                    <p className="text-sm text-gray-500 font-mono">{youthData.uniqueId}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="font-bold text-lg">{programs.length}</p>
                    <p className="text-xs text-gray-600">Programs</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{music.length}</p>
                    <p className="text-xs text-gray-600">Music</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{videos.length}</p>
                    <p className="text-xs text-gray-600">Videos</p>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gray-100 text-gray-900 hover:bg-gray-200"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </Button>
              </div>

              {/* Profile Content */}
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{youthData.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{youthData.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">LGA</p>
                      <p className="font-medium">{youthData.lga}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                {(youthData.cv || youthData.ninDocument) && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Documents</h3>
                    
                    {youthData.cv && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">CV</p>
                            <p className="text-xs text-gray-500">{youthData.cv.filename}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDocument(youthData.cv!.url)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    
                    {youthData.ninDocument && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-green-500" />
                          <div>
                            <p className="font-medium text-sm">NIN Document</p>
                            <p className="text-xs text-gray-500">Verified</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDocument(youthData.ninDocument!.url)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instagram-style Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 lg:hidden">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setActiveTab("home")}
              className={`p-2 ${activeTab === "home" ? "text-black" : "text-gray-400"}`}
            >
              <Home className={`w-6 h-6 ${activeTab === "home" ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`p-2 ${activeTab === "search" ? "text-black" : "text-gray-400"}`}
            >
              <Search className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveTab("music")}
              className={`p-2 ${activeTab === "music" ? "text-black" : "text-gray-400"}`}
            >
              <Music className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`p-2 ${activeTab === "videos" ? "text-black" : "text-gray-400"}`}
            >
              <Video className="w-6 h-6" />
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`p-2 ${activeTab === "profile" ? "text-black" : "text-gray-400"}`}
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={youthData.profilePicture?.url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  {youthData.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop View (>= lg) */}
      <div className="hidden lg:flex h-screen">
        {/* Desktop Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={youthData.profilePicture?.url} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {youthData.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-gray-900">{youthData.fullName.split(' ')[0]}</h2>
                <p className="text-sm text-gray-500">{youthData.uniqueId}</p>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Desktop Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h1>
                <p className="text-gray-600">Welcome back, {youthData.fullName}!</p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </header>

          {/* Desktop Content Area */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm font-medium">Available Programs</p>
                          <p className="text-3xl font-bold">{programs.length}</p>
                          <p className="text-blue-200 text-xs mt-1">Ready to apply</p>
                        </div>
                        <div className="bg-blue-400/30 p-3 rounded-lg">
                          <BookOpen className="w-8 h-8 text-blue-100" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm font-medium">Music Tracks</p>
                          <p className="text-3xl font-bold">{music.length}</p>
                          <p className="text-purple-200 text-xs mt-1">Available to stream</p>
                        </div>
                        <div className="bg-purple-400/30 p-3 rounded-lg">
                          <Music className="w-8 h-8 text-purple-100" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm font-medium">Videos</p>
                          <p className="text-3xl font-bold">{videos.length}</p>
                          <p className="text-green-200 text-xs mt-1">Educational content</p>
                        </div>
                        <div className="bg-green-400/30 p-3 rounded-lg">
                          <Video className="w-8 h-8 text-green-100" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm font-medium">News Updates</p>
                          <p className="text-3xl font-bold">{news.length}</p>
                          <p className="text-orange-200 text-xs mt-1">Latest announcements</p>
                        </div>
                        <div className="bg-orange-400/30 p-3 rounded-lg">
                          <FileText className="w-8 h-8 text-orange-100" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Recent Programs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {programs.length > 0 ? programs.slice(0, 3).map((program) => (
                        <div key={program._id} className="flex items-center gap-3 py-3 border-b last:border-b-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{program.title}</h4>
                            <p className="text-xs text-gray-500">{program.category}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">{program.duration}</Badge>
                        </div>
                      )) : (
                        <p className="text-gray-500 text-sm">No programs available</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        Latest News
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {news.length > 0 ? news.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-start gap-3 py-3 border-b last:border-b-0">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-gray-500 text-sm">No news available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Programs Tab */}
            {activeTab === "programs" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Programs</h2>
                    <p className="text-gray-600">Discover and apply to development programs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    >
                      {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {programs.length > 0 ? (
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {programs.map((program) => {
                      const isDeadlinePassed = program.applicationDeadline && new Date() > new Date(program.applicationDeadline)
                      
                      return (
                        <Card key={program._id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-2">{program.title}</h3>
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge variant="secondary">{program.category}</Badge>
                                  {program.applicationRequired && (
                                    <Badge variant="outline" className="text-xs">Application Required</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                              </div>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{program.description}</p>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{program.duration}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{program.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>{program.totalApplications} applicants</span>
                              </div>
                              {program.applicationDeadline && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className={isDeadlinePassed ? "text-red-500" : ""}>
                                    {new Date(program.applicationDeadline).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="mb-4">
                              <h4 className="font-medium text-sm mb-2">Benefits:</h4>
                              <div className="flex flex-wrap gap-1">
                                {program.benefits.slice(0, 3).map((benefit, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {benefit}
                                  </Badge>
                                ))}
                                {program.benefits.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{program.benefits.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {program.applicationRequired ? (
                              <Button 
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleApplyToProgram(program)}
                                disabled={isDeadlinePassed}
                              >
                                {isDeadlinePassed ? "Deadline Passed" : "Apply Now"}
                              </Button>
                            ) : (
                              <Button className="w-full bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Join Program
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 max-w-md mx-auto">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">No Programs Yet</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        New development programs are being prepared for you. Check back soon for exciting opportunities!
                      </p>
                      <Button 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                        onClick={() => loadContent()}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Refresh Programs
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Music Tab */}
            {activeTab === "music" && (
              <div className="space-y-6">
                {/* Header with Gradient Background */}
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Music Library</h2>
                      <p className="text-purple-100">Discover and enjoy curated music content</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {showDesktopMusicSearch ? (
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                placeholder="Search music..."
                                value={desktopMusicSearchQuery}
                                onChange={(e) => setDesktopMusicSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-64 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                              />
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setShowDesktopMusicSearch(false)
                              setDesktopMusicSearchQuery("")
                            }} className="text-white hover:bg-white/20">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => setShowDesktopMusicSearch(true)} className="text-white hover:bg-white/20">
                            <Search className="w-4 h-4 mr-2" />
                            Search
                          </Button>
                        )}
                      </div>
                      <div className="relative">
                        {showGenreFilter ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedGenre}
                              onChange={(e) => setSelectedGenre(e.target.value)}
                              className="px-3 py-2 bg-white/20 border border-white/30 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                            >
                              {getAvailableGenres().map((genre) => (
                                <option key={genre} value={genre} className="text-gray-900">
                                  {genre === 'all' ? 'All Genres' : genre}
                                </option>
                              ))}
                            </select>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setShowGenreFilter(false)
                              setSelectedGenre('all')
                            }} className="text-white hover:bg-white/20">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => setShowGenreFilter(true)} className="text-white hover:bg-white/20">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter by Genre
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">{music.length}</div>
                      <div className="text-sm text-purple-100">Total Tracks</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">{getAvailableGenres().length - 1}</div>
                      <div className="text-sm text-purple-100">Genres</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold">{likedTracks.size}</div>
                      <div className="text-sm text-purple-100">Liked</div>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {isLoadingMusic ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                      <span className="ml-2 text-gray-600">Loading music library...</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {[...Array(8)].map((_, i) => (
                        <DesktopMusicSkeleton key={i} />
                      ))}
                    </div>
                  </div>
                ) : musicLoadError ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
                      <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{musicLoadError}</h3>
                      <p className="text-gray-600 mb-6">Please check your connection and try again</p>
                      <Button 
                        onClick={() => loadContent()}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                      >
                        <Wifi className="w-4 h-4 mr-2" />
                        Retry Loading
                      </Button>
                    </div>
                  </div>
                ) : getFilteredMusic().length > 0 ? (
                  <div className="space-y-6">
                    {(desktopMusicSearchQuery.trim() || selectedGenre !== 'all') && (
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">{getFilteredMusic().length}</span> result{getFilteredMusic().length !== 1 ? 's' : ''}
                          {desktopMusicSearchQuery.trim() && ` for "${desktopMusicSearchQuery}"`}
                          {selectedGenre !== 'all' && ` in ${selectedGenre}`}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setDesktopMusicSearchQuery("")
                            setSelectedGenre('all')
                            setShowDesktopMusicSearch(false)
                            setShowGenreFilter(false)
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    )}
                    
                    {/* Music Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {getFilteredMusic().map((track, index) => {
                        const isCurrentTrack = currentlyPlaying === track._id
                        const isLiked = likedTracks.has(track._id)
                        const isLoading = audioLoadingStates[track._id]
                        
                        return (
                          <Card key={track._id} className={`group overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${isCurrentTrack ? 'ring-2 ring-purple-500 shadow-lg' : ''}`}>
                            <div className="relative">
                              {/* Cover Image */}
                              <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 relative overflow-hidden">
                                {track.coverImageUrl ? (
                                  <img 
                                    src={track.coverImageUrl} 
                                    alt={track.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Music className="w-16 h-16 text-white" />
                                  </div>
                                )}
                                
                                {/* Overlay */}
                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isCurrentTrack ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                  <Button
                                    size="lg"
                                    onClick={() => handlePlayMusic(track)}
                                    disabled={isLoading}
                                    className="bg-white/90 hover:bg-white text-gray-900 rounded-full w-16 h-16 p-0"
                                  >
                                    {isLoading ? (
                                      <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : isCurrentTrack && isPlaying ? (
                                      <Pause className="w-6 h-6" />
                                    ) : (
                                      <Play className="w-6 h-6 ml-1" />
                                    )}
                                  </Button>
                                </div>
                                
                                {/* Playing Indicator */}
                                {isCurrentTrack && (
                                  <div className="absolute top-3 right-3">
                                    <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                      {buffering ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                      )}
                                      {buffering ? 'Loading' : 'Playing'}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Like Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLikeTrack(track._id)}
                                  className={`absolute top-3 left-3 p-2 rounded-full ${isLiked ? 'bg-red-500 text-white' : 'bg-black/20 text-white hover:bg-red-500'}`}
                                >
                                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                </Button>
                              </div>
                              
                              {/* Progress Bar for Current Track */}
                              {isCurrentTrack && duration > 0 && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                                  <div 
                                    className="h-full bg-purple-500 transition-all duration-300"
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                  />
                                </div>
                              )}
                            </div>
                            
                            <CardContent className="p-4">
                              {/* Track Info */}
                              <div className="mb-3">
                                <h3 className={`font-semibold truncate ${isCurrentTrack ? 'text-purple-900' : 'text-gray-900'}`}>
                                  {track.title}
                                </h3>
                                <p className={`text-sm truncate ${isCurrentTrack ? 'text-purple-600' : 'text-gray-600'}`}>
                                  {track.artist}
                                </p>
                              </div>
                              
                              {/* Genre & Duration */}
                              <div className="flex items-center justify-between mb-3">
                                <Badge variant={isCurrentTrack ? "default" : "secondary"} className="text-xs">
                                  {track.genre}
                                </Badge>
                                <span className={`text-xs ${isCurrentTrack ? 'text-purple-500' : 'text-gray-500'}`}>
                                  {formatDuration(track.duration)}
                                </span>
                              </div>
                              
                              {/* Stats */}
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                <span className="flex items-center gap-1">
                                  <Play className="w-3 h-3" />
                                  {track.playCount.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {track.likes.toLocaleString()}
                                </span>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handlePlayMusic(track)}
                                  disabled={isLoading}
                                  className={`flex-1 ${isCurrentTrack ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                >
                                  {isLoading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : isCurrentTrack && isPlaying ? (
                                    <Pause className="w-4 h-4 mr-2" />
                                  ) : (
                                    <Play className="w-4 h-4 mr-2" />
                                  )}
                                  {isLoading ? "Loading" : isCurrentTrack && isPlaying ? "Pause" : "Play"}
                                </Button>
                                <Button variant="outline" size="sm" className="p-2">
                                  <Share2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    {(desktopMusicSearchQuery.trim() || selectedGenre !== 'all') ? (
                      <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
                        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No music found</h3>
                        <p className="text-gray-600 mb-6">Try different search terms or genre</p>
                        <Button 
                          onClick={() => {
                            setDesktopMusicSearchQuery("")
                            setSelectedGenre('all')
                            setShowDesktopMusicSearch(false)
                            setShowGenreFilter(false)
                          }}
                          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                        >
                          Clear Filters
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-12 max-w-md mx-auto">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Music className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">No Music Yet</h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          Inspirational and educational music content is being curated for your enjoyment. Stay tuned!
                        </p>
                        <Button 
                          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                          onClick={() => loadContent()}
                        >
                          <Music className="w-4 h-4 mr-2" />
                          Refresh Music
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Enhanced Audio Element */}
                <audio 
                  ref={audioRef} 
                  preload="metadata"
                  onLoadedMetadata={() => {
                    if (audioRef.current) {
                      setDuration(audioRef.current.duration)
                    }
                  }}
                  onTimeUpdate={() => {
                    if (audioRef.current) {
                      setCurrentTime(audioRef.current.currentTime)
                    }
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === "videos" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Video Library</h2>
                    <p className="text-gray-600">Educational and inspirational video content</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter by Category
                    </Button>
                  </div>
                </div>

                {videos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                      <Card key={video._id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
                        <div className="aspect-video bg-gray-200 relative">
                          {currentVideo === video._id ? (
                            <video
                              ref={videoRef}
                              src={video.videoUrl}
                              controls
                              className="w-full h-full object-cover"
                              autoPlay
                            />
                          ) : (
                            <div 
                              className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-800 group"
                              onClick={() => handlePlayVideo(video)}
                            >
                              {video.thumbnailUrl ? (
                                <img 
                                  src={video.thumbnailUrl} 
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Video className="w-12 h-12 text-white" />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <Play className="w-8 h-8 text-gray-800 ml-1" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {video.viewCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {video.likes}
                              </span>
                            </div>
                            <span>{formatDuration(video.duration)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-12 max-w-md mx-auto">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Video className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">No Videos Yet</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        Educational and inspirational videos are being curated for your learning journey. Stay tuned!
                      </p>
                      <Button 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                        onClick={() => loadContent()}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Refresh Videos
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* News Tab */}
            {activeTab === "news" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Latest News</h2>
                    <p className="text-gray-600">Stay updated with the latest announcements</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Search News
                  </Button>
                </div>

                {news.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {news.map((item) => {
                      const imageAttachment = item.attachments?.find(att => att.type === 'image')
                      const excerpt = item.content && item.content.length > 200 
                        ? item.content.substring(0, 200) + '...' 
                        : item.content || 'No content available'
                      
                      return (
                        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          {imageAttachment && (
                            <div className="aspect-video bg-gray-200">
                              <img 
                                src={imageAttachment.url} 
                                alt={item.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            </div>
                          )}
                          <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary" className="text-xs">
                                {item.doc_type || 'News'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(item.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg mb-3 line-clamp-2">{item.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-4">{excerpt}</p>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Eye className="w-3 h-3" />
                                {item.views || 0} views
                              </span>
                              <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                                Read More
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No news available</p>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Profile Management</h2>
                    <p className="text-gray-600">Manage your personal information and documents</p>
                  </div>
                  <Button onClick={handleEditProfile}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile Picture Section */}
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Avatar className="w-32 h-32 mx-auto mb-4">
                        <AvatarImage src={youthData.profilePicture?.url} />
                        <AvatarFallback className="bg-blue-500 text-white text-4xl">
                          {youthData.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-xl mb-2">{youthData.fullName}</h3>
                      <p className="text-gray-600 mb-4">{youthData.occupation}</p>
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Update Photo
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{youthData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{youthData.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPinIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">LGA</p>
                          <p className="font-medium">{youthData.lga}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Unique ID</p>
                          <p className="font-medium font-mono">{youthData.uniqueId}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documents */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {youthData.cv && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-blue-500" />
                            <div>
                              <p className="font-medium text-sm">CV</p>
                              <p className="text-xs text-gray-500">{youthData.cv.filename}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openDocument(youthData.cv!.url)}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Upload className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {youthData.ninDocument && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-green-500" />
                            <div>
                              <p className="font-medium text-sm">NIN Document</p>
                              <p className="text-xs text-gray-500">Verified</p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openDocument(youthData.ninDocument!.url)}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && selectedProgram && (
        <ProgramApplicationForm
          program={selectedProgram}
          onClose={() => {
            setShowApplicationForm(false)
            setSelectedProgram(null)
          }}
          onSuccess={handleApplicationSuccess}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Edit Profile</CardTitle>
                  <CardDescription className="text-blue-100">
                    Update your personal information
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditProfile(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Occupation
                </Label>
                <Input
                  id="occupation"
                  value={editFormData.occupation}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, occupation: e.target.value }))}
                  placeholder="Enter your occupation"
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowEditProfile(false)}
                  disabled={isUpdatingProfile}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUpdatingProfile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}