"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Briefcase
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

export default function MobileYouthDashboard() {
  const router = useRouter()
  const [youthData, setYouthData] = useState<YouthData | null>(null)
  const [activeTab, setActiveTab] = useState("news")
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
      // Load programs
      const programsRes = await fetch("/api/youth/programs")
      if (programsRes.ok) {
        const programsData = await programsRes.json()
        setPrograms(programsData.data || [])
      }

      // Load music
      const musicRes = await fetch("/api/youth/music")
      if (musicRes.ok) {
        const musicData = await musicRes.json()
        setMusic(musicData.data || [])
      }

      // Load videos
      const videosRes = await fetch("/api/youth/videos")
      if (videosRes.ok) {
        const videosData = await videosRes.json()
        setVideos(videosData.data || [])
      }

      // Load news (using existing news API)
      try {
        const newsRes = await fetch("/api/news")
        
        if (newsRes.ok) {
          const newsData = await newsRes.json()
          
          // The news API returns an array directly, not wrapped in { data: [] }
          if (Array.isArray(newsData)) {
            // Sort by creation date (newest first) and take first 10
            const sortedNews = newsData
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 10)
            setNews(sortedNews)
          } else {
            setNews([])
          }
        } else {
          // Fallback to sample news if API fails
          const sampleNews = [
            {
              id: 'sample-1',
              title: 'Welcome to AKY Digital Hub',
              content: 'We are excited to launch this comprehensive youth development program aimed at empowering the youth of Kano State with skills, opportunities, and resources for a brighter future.',
              doc_type: 'announcement',
              created_at: new Date().toISOString(),
              attachments: [],
              views: 0
            },
            {
              id: 'sample-2',
              title: 'Program Registration Now Open',
              content: 'Registration is now open for various youth development programs including digital skills training, entrepreneurship bootcamp, and leadership development. Apply now to secure your spot!',
              doc_type: 'news',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              attachments: [],
              views: 0
            },
            {
              id: 'sample-3',
              title: 'Skills Development Workshop',
              content: 'Join our upcoming skills development workshop designed to enhance your professional capabilities and career prospects.',
              doc_type: 'workshop',
              created_at: new Date(Date.now() - 172800000).toISOString(),
              attachments: [],
              views: 0
            }
          ]
          setNews(sampleNews)
        }
      } catch (newsError) {
        console.error('Error fetching news:', newsError)
        // Fallback to sample news on error
        const sampleNews = [
          {
            id: 'sample-1',
            title: 'Welcome to AKY Digital Hub',
            content: 'We are excited to launch this comprehensive youth development program aimed at empowering the youth of Kano State with skills, opportunities, and resources for a brighter future.',
            doc_type: 'announcement',
            created_at: new Date().toISOString(),
            attachments: [],
            views: 0
          }
        ]
        setNews(sampleNews)
      }

    } catch (error) {
      console.error("Error loading content:", error)
    }
  }

  const handlePlayMusic = (track: MusicTrack) => {
    if (currentlyPlaying === track._id) {
      // Pause current track
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setCurrentlyPlaying(null)
    } else {
      // Play new track
      if (audioRef.current) {
        audioRef.current.src = track.audioUrl
        audioRef.current.play()
      }
      setCurrentlyPlaying(track._id)
    }
  }

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
    // Refresh programs to update application count
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

      // Update local state
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

  const tabs = [
    { id: "programs", label: "Programs", icon: BookOpen },
    { id: "music", label: "Music", icon: Music },
    { id: "news", label: "News", icon: Home },
    { id: "videos", label: "Videos", icon: Video },
    { id: "profile", label: "Profile", icon: User }
  ]

  if (!youthData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-white">
              <AvatarImage src={youthData.profilePicture?.url} />
              <AvatarFallback className="bg-blue-500 text-white">
                {youthData.fullName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-bold">
                Welcome, {youthData.fullName.split(' ')[0]}! 👋
              </h1>
              <p className="text-blue-100 text-sm">{youthData.uniqueId}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="pb-20">
        {/* News Tab */}
        {activeTab === "news" && (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Latest News</h2>
            {news.length > 0 ? (
              news.map((item) => {
                // Get the first image attachment if available
                const imageAttachment = item.attachments?.find(att => att.type === 'image')
                // Create excerpt from content (first 150 characters)
                const excerpt = item.content && item.content.length > 150 
                  ? item.content.substring(0, 150) + '...' 
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
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.doc_type || 'News'}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
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
              })
            ) : (
              <div className="text-center py-8">
                <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No news available</p>
              </div>
            )}
          </div>
        )}

        {/* Programs Tab */}
        {activeTab === "programs" && (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Programs</h2>
            {programs.length > 0 ? (
              programs.map((program) => {
                const isDeadlinePassed = program.applicationDeadline && new Date() > new Date(program.applicationDeadline)
                
                return (
                  <Card key={program._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{program.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              {program.category}
                            </Badge>
                            {program.applicationRequired && (
                              <Badge variant="outline" className="text-xs">
                                Application Required
                              </Badge>
                            )}
                          </div>
                        </div>
                        <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{program.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
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
                          {program.benefits.map((benefit, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
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
              })
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mx-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Programs Yet</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    New development programs are being prepared for you. Check back soon for exciting opportunities!
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Skills Development</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-100"></div>
                      <span>Leadership Training</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                      <span>Entrepreneurship</span>
                    </div>
                  </div>
                  <Button 
                    className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
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
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Music</h2>
            {music.length > 0 ? (
              music.map((track) => (
                <Card key={track._id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
                        {track.coverImageUrl ? (
                          <img 
                            src={track.coverImageUrl} 
                            alt={track.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Music className="w-8 h-8 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{track.title}</h3>
                        <p className="text-sm text-gray-600 truncate">{track.artist}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{formatDuration(track.duration)}</span>
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {track.playCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {track.likes}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handlePlayMusic(track)}
                        className={currentlyPlaying === track._id ? "bg-red-500 hover:bg-red-600" : ""}
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
              ))
            ) : (
              <div className="text-center py-8">
                <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No music available</p>
              </div>
            )}
            
            {/* Hidden audio element for music playback */}
            <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} />
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Videos</h2>
            {videos.length > 0 ? (
              videos.map((video) => (
                <Card key={video._id} className="overflow-hidden">
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
                        className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-800"
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
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{video.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                    
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
              ))
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 mx-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Video className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No Videos Yet</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Educational and inspirational videos are being curated for your learning journey. Stay tuned!
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span>Leadership Talks</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-100"></div>
                      <span>Success Stories</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse delay-200"></div>
                      <span>Skill Tutorials</span>
                    </div>
                  </div>
                  <Button 
                    className="mt-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
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

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
            
            {/* Profile Picture Section */}
            <Card>
              <CardContent className="p-4 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={youthData.profilePicture?.url} />
                  <AvatarFallback className="bg-blue-500 text-white text-2xl">
                    {youthData.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{youthData.fullName}</h3>
                <p className="text-gray-600 text-sm mb-4">{youthData.occupation}</p>
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
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{youthData.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{youthData.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">LGA</p>
                  <p className="font-medium">{youthData.lga}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unique ID</p>
                  <p className="font-medium font-mono">{youthData.uniqueId}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleEditProfile}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {youthData.cv && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500" />
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
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-green-500" />
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
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : ""}`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            )
          })}
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