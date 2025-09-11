"use client"

import { useEffect, useRef, useState } from "react"
import { usePageLoading } from "@/hooks/use-page-loading"
import PageLoader from "@/components/page-loader"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Star,
  ChevronDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  Quote,
  Heart,
  Users,
  Building,
  BookOpen,
  Trophy,
  Target,
  Lightbulb,
  Sparkles,
  Zap,
  Crown,
  Globe
} from "lucide-react"
import Image from "next/image"
import NewsletterSection from "@/components/newsletter-section"

// Timeline data with enhanced details
const timelineEvents = [
  {
    id: 1,
    year: "1963",
    title: "Birth & Early Life",
    subtitle: "The Beginning of a Journey",
    description: "His Excellency Abba Kabir Yusuf was born on January 5, 1963, in Gaya Local Government Area of Kano State. Born into a family that valued education and service, young Abba showed early signs of leadership and academic excellence.",
    image: "/pictures/assets/img/about/1.png",
    category: "childhood",
    icon: Heart,
    color: "from-pink-500 to-rose-600",
    bgColor: "from-pink-50 to-rose-100",
    gallery: [
      "/pictures/assets/img/about/1.png",
      "/pictures/assets/img/he/1.png",
      "/pictures/assets/img/he/2.png"
    ],
    facts: [
      "Born in Gaya LGA, Kano State",
      "Showed early leadership qualities",
      "Raised in a family that valued education"
    ],
    quote: "Every great journey begins with a single step, and mine began in the heart of Kano."
  },
  {
    id: 2,
    year: "1968-1980",
    title: "Educational Foundation",
    subtitle: "Building the Pillars of Knowledge",
    description: "His educational journey began at Sumaila Primary School (1968-1975), followed by Government Secondary School Dawakin Tofa, and Government Secondary School Lautai in Gumel, completing his secondary education in 1980 with outstanding results.",
    image: "/pictures/assets/img/about/2.png",
    category: "education",
    icon: GraduationCap,
    color: "from-blue-500 to-indigo-600",
    bgColor: "from-blue-50 to-indigo-100",
    gallery: [
      "/pictures/assets/img/about/2.png",
      "/pictures/assets/img/about/3.png"
    ],
    facts: [
      "Sumaila Primary School (1968-1975)",
      "Government Secondary School Dawakin Tofa",
      "Completed secondary education in 1980"
    ],
    quote: "Education is the foundation upon which all great achievements are built."
  },
  {
    id: 3,
    year: "1985",
    title: "Technical Excellence",
    subtitle: "National Diploma Achievement",
    description: "Earned a National Diploma in Civil Engineering from the Federal Polytechnic, Mubi, demonstrating his passion for infrastructure development and technical innovation that would later shape his governance approach.",
    image: "/pictures/assets/img/about/TechnicalExcellence.jpeg",
    category: "education",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-600",
    bgColor: "from-emerald-50 to-teal-100",
    gallery: [
      "/pictures/assets/img/about/TechnicalExcellence.jpeg",
    ],
    facts: [
      "National Diploma in Civil Engineering",
      "Federal Polytechnic, Mubi",
      "Specialized in infrastructure development"
    ],
    quote: "Engineering taught me that every problem has a solution, every challenge an opportunity."
  },
  {
    id: 4,
    year: "1989",
    title: "Advanced Learning",
    subtitle: "Higher Education & Specialization",
    description: "Obtained Higher National Diploma in Civil Engineering with specialization in Water Resources/Environmental Engineering from Kaduna Polytechnic, plus postgraduate diploma and master's degree in Business Administration from Bayero University, Kano.",
    image: "/pictures/assets/img/about/AdvancedLearning.jpeg",
    category: "education",
    icon: Trophy,
    color: "from-purple-500 to-violet-600",
    bgColor: "from-purple-50 to-violet-100",
    gallery: [
      "/pictures/assets/img/about/AdvancedLearning.jpeg",
    ],
    facts: [
      "HND in Civil Engineering",
      "Water Resources/Environmental Engineering",
      "MBA from Bayero University, Kano"
    ],
    quote: "Continuous learning is the key to staying relevant and effective in leadership."
  },
  {
    id: 5,
    year: "1990",
    title: "National Service",
    subtitle: "Serving the Nation",
    description: "Completed National Youth Service Corps at the Kaduna Environmental Protection Agency (KEPA), where he gained valuable experience in environmental management and public service.",
    image: "/pictures/assets/img/about/NationalService.jpeg",
    category: "service",
    icon: Users,
    color: "from-orange-500 to-amber-600",
    bgColor: "from-orange-50 to-amber-100",
    gallery: [
      "/pictures/assets/img/about/NationalService.jpeg",
    ],
    facts: [
      "NYSC at KEPA, Kaduna",
      "Environmental management experience",
      "Foundation in public service"
    ],
    quote: "Service to others is the rent we pay for our room here on earth."
  },
  {
    id: 6,
    year: "2009-2011",
    title: "Educational Leadership",
    subtitle: "Chairman Governing Board",
    description: "Served as Chairman of the Governing Board of the National Institute for Educational Planning and Administration (NIEPA), Ondo State, contributing to national educational policy development.",
    image: "/pictures/assets/img/about/EducationalLeadership.jpeg",
    category: "leadership",
    icon: Lightbulb,
    color: "from-cyan-500 to-blue-600",
    bgColor: "from-cyan-50 to-blue-100",
    gallery: [
      "/pictures/assets/img/about/EducationalLeadership.jpeg",
    ],
    facts: [
      "Chairman of NIEPA Governing Board",
      "Educational policy development",
      "National level leadership experience"
    ],
    quote: "True leadership is about empowering others to achieve their full potential."
  },
  {
    id: 7,
    year: "2011-2015",
    title: "Infrastructure Development",
    subtitle: "Commissioner of Works",
    description: "Became Commissioner of Works, Housing and Transport in 2011 when Kwankwaso was re-elected as governor of Kano State, overseeing major infrastructure projects that transformed the state.",
    image: "/pictures/assets/img/about/InfrastructureDevelopment.jpeg",
    category: "government",
    icon: Building,
    color: "from-red-500 to-pink-600",
    bgColor: "from-red-50 to-pink-100",
    gallery: [
      "/pictures/assets/img/about/InfrastructureDevelopment.jpeg",
      "/pictures/assets/img/about/InfrastructureDevelopment1.jpeg",
      "/pictures/assets/img/about/InfrastructureDevelopment2.jpeg",
      "/pictures/assets/img/about/InfrastructureDevelopment3.jpeg",
      "/pictures/assets/img/about/InfrastructureDevelopment4.jpeg",

    ],
    facts: [
      "Commissioner of Works, Housing & Transport",
      "Major infrastructure projects",
      "State transformation initiatives"
    ],
    quote: "Infrastructure is the backbone of development and prosperity."
  },
  {
    id: 8,
    year: "2019",
    title: "Political Ambition",
    subtitle: "PDP Gubernatorial Candidate",
    description: "Ran for governor under the Peoples Democratic Party, demonstrating his commitment to democratic governance and his vision for Kano State's development.",
    image: "/pictures/assets/img/he/3.jpg",
    category: "politics",
    icon: Target,
    color: "from-indigo-500 to-purple-600",
    bgColor: "from-indigo-50 to-purple-100",
    gallery: [
      "/pictures/assets/img/he/3.jpg",
      "/pictures/assets/img/about/2.png",
    ],
    facts: [
      "PDP Gubernatorial Candidate",
      "Democratic governance advocate",
      "Vision for state development"
    ],
    quote: "Democracy is not just about winning elections, it's about serving the people."
  },
  {
    id: 9,
    year: "2023-Present",
    title: "Governor of Kano State",
    subtitle: "Leading the Transformation",
    description: "Elected as Governor under the New Nigeria Peoples Party (NNPP), bringing decades of experience in engineering, administration, and public service to lead Kano State into a new era of development and prosperity.",
    image: "/pictures/assets/img/he/4.jpg",
    category: "governorship",
    icon: Crown,
    color: "from-yellow-500 to-orange-600",
    bgColor: "from-yellow-50 to-orange-100",
    gallery: [
      "/pictures/assets/img/he/4.jpg",
      "/pictures/assets/img/he/5.png",
      "/pictures/assets/img/he/6.png",
      "/pictures/assets/img/about/4.png",
      "/pictures/assets/img/about/5.png",
      "/pictures/assets/img/about/6.png",
    ],
    facts: [
      "Elected Governor under NNPP",
      "Decades of public service experience",
      "Leading state transformation"
    ],
    quote: "The future of Kano State is bright, and together we will build it."
  }
]

// Quiz questions
const quizQuestions = [
  {
    question: "In which year was Governor Abba Kabir Yusuf born?",
    options: ["1962", "1963", "1964", "1965"],
    correct: 1
  },
  {
    question: "Which university did he attend for his MBA?",
    options: ["University of Lagos", "Ahmadu Bello University", "Bayero University Kano", "University of Ibadan"],
    correct: 2
  },
  {
    question: "What was his role from 2011-2015?",
    options: ["Commissioner of Education", "Commissioner of Works", "Commissioner of Health", "Commissioner of Agriculture"],
    correct: 1
  },
  {
    question: "Under which party was he elected as Governor in 2023?",
    options: ["PDP", "APC", "NNPP", "LP"],
    correct: 2
  }
]

export default function AboutPage() {
  const { isLoading, stopLoading } = usePageLoading()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [showQuizResults, setShowQuizResults] = useState(false)
  const [visibleEvents, setVisibleEvents] = useState<Set<number>>(new Set())
  
  const containerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      stopLoading()
    }, 2000)
    return () => clearTimeout(timer)
  }, [stopLoading])

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('[data-timeline-event]')
      const newVisible = new Set<number>()
      
      elements.forEach((element, index) => {
        const rect = element.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0
        if (isVisible) {
          newVisible.add(index)
        }
      })
      
      setVisibleEvents(newVisible)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...quizAnswers, answerIndex]
    setQuizAnswers(newAnswers)
    
    if (answerIndex === quizQuestions[currentQuizQuestion].correct) {
      setQuizScore(quizScore + 1)
    }
    
    if (currentQuizQuestion < quizQuestions.length - 1) {
      setCurrentQuizQuestion(currentQuizQuestion + 1)
    } else {
      setShowQuizResults(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuizQuestion(0)
    setQuizAnswers([])
    setQuizScore(0)
    setShowQuizResults(false)
  }

  return (
    <PageLoader isLoading={isLoading}>
      <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 text-gray-900 overflow-hidden">
        {/* Background Audio */}
        <audio
          ref={audioRef}
          loop
          muted={isMuted}
          className="hidden"
        >
          <source src="/audio/background-music.mp3" type="audio/mpeg" />
        </audio>

        <Header />

        {/* Hero Section with Modern Design */}
        <section 
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: "url('/bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Modern Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 via-transparent to-blue-900/20" />

          {/* Hero Content */}
          <div className="relative z-20 text-center px-4 max-w-6xl mx-auto py-20">
            {/* Profile Image Section */}
            <div className="mb-12 relative">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-blue-500/30 rounded-full blur-xl" />
                <Image
                  src="/pictures/assets/img/he/3.png"
                  width={240}
                  height={240}
                  alt="Governor Abba Kabir Yusuf"
                  className="w-60 h-60 rounded-full mx-auto border-4 border-white/30 shadow-2xl relative z-10 object-cover object-center"
                />
                <div className="absolute -inset-4 border border-white/20 rounded-full" />
              </div>
            </div>

            {/* Title Section */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white leading-tight">
                His Excellency
              </h1>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold mb-6 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                Alh. Abba Kabir Yusuf
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-blue-500 mx-auto mb-6" />
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl lg:text-2xl mb-12 text-white/90 leading-relaxed max-w-4xl mx-auto">
              Executive Governor of Kano State - A Journey of Excellence, Leadership, and Unwavering Service
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">60+</div>
                <div className="text-sm text-white/80">Years of Life</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">30+</div>
                <div className="text-sm text-white/80">Years of Service</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">15M+</div>
                <div className="text-sm text-white/80">People Served</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">44</div>
                <div className="text-sm text-white/80">LGAs Impacted</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                onClick={toggleAudio}
                variant="outline"
                size="lg"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-md transition-all duration-300 hover:scale-105 min-w-[140px]"
              >
                {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isPlaying ? "Pause" : "Play"} Music
              </Button>
              
              <Button
                onClick={toggleMute}
                variant="outline"
                size="lg"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-md transition-all duration-300 hover:scale-105"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>

            {/* Scroll Indicator */}
            <div className="animate-bounce">
              <ChevronDown className="w-8 h-8 mx-auto text-white/70" />
              <p className="text-sm text-white/70 mt-2">Scroll to explore his remarkable journey</p>
            </div>
          </div>
        </section>

        {/* Interactive Timeline */}
        <section className="relative py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Calendar className="w-4 h-4" />
                Life Journey
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
                Timeline of Excellence
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover the remarkable milestones that shaped a visionary leader's journey from humble beginnings to transformational governance
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-blue-500 mx-auto mt-8" />
            </div>

            {/* Timeline Container */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-red-500 via-blue-500 to-red-500 opacity-20" />
              
              {/* Timeline Events */}
              <div className="space-y-16 md:space-y-24">
                {timelineEvents.map((event, index) => (
                  <TimelineEvent
                    key={event.id}
                    event={event}
                    index={index}
                    isEven={index % 2 === 0}
                    isVisible={visibleEvents.has(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Quiz Section */}
        <section className="relative py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto animate-fade-in-up">
              <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Test Your Knowledge
              </h2>
              <p className="text-xl text-gray-600 mb-12">
                How well do you know Governor Abba Kabir Yusuf's journey?
              </p>

              {!showQuiz && !showQuizResults && (
                <Button
                  onClick={() => setShowQuiz(true)}
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 text-lg transition-all duration-300 hover:scale-105"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Quiz
                </Button>
              )}

              {showQuiz && !showQuizResults && (
                <QuizComponent
                  question={quizQuestions[currentQuizQuestion]}
                  questionNumber={currentQuizQuestion + 1}
                  totalQuestions={quizQuestions.length}
                  onAnswer={handleQuizAnswer}
                />
              )}

              {showQuizResults && (
                <QuizResults
                  score={quizScore}
                  total={quizQuestions.length}
                  onRestart={resetQuiz}
                />
              )}
            </div>
          </div>
        </section>

        {/* Legacy Section */}
        <section className="relative py-20 bg-gradient-to-br from-red-50 via-purple-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-in-left">
                <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                  Legacy & Impact
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  From humble beginnings in Gaya to the highest office in Kano State, 
                  Governor Abba Kabir Yusuf's journey exemplifies dedication, excellence, 
                  and unwavering commitment to public service.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-white/80 rounded-lg backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 border border-gray-200">
                    <div className="text-3xl font-bold text-red-600 mb-2">60+</div>
                    <div className="text-gray-600">Years of Life</div>
                  </div>
                  <div className="text-center p-4 bg-white/80 rounded-lg backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 border border-gray-200">
                    <div className="text-3xl font-bold text-blue-600 mb-2">30+</div>
                    <div className="text-gray-600">Years of Service</div>
                  </div>
                  <div className="text-center p-4 bg-white/80 rounded-lg backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 border border-gray-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">15M+</div>
                    <div className="text-gray-600">People Served</div>
                  </div>
                  <div className="text-center p-4 bg-white/80 rounded-lg backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 border border-gray-200">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">44</div>
                    <div className="text-gray-600">LGAs Impacted</div>
                  </div>
                </div>
              </div>

              <div className="relative animate-slide-in-right">
                <div className="relative w-full aspect-[5/4] bg-gradient-to-br from-red-500/20 to-blue-500/20 rounded-2xl overflow-hidden">
                  <Image
                    src="/pictures/assets/img/he/6.png"
                    fill
                    alt="Kano State Map"
                    className="object-cover object-center opacity-80"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Kano State</h3>
                    <p className="text-gray-200">Leading 44 Local Government Areas into a brighter future</p>
                  </div>
                  
                  {/* Animated dots representing LGAs */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 bg-red-400 rounded-full animate-pulse"
                      style={{
                        left: `${20 + (i % 4) * 20}%`,
                        top: `${30 + Math.floor(i / 4) * 30}%`,
                        animationDelay: `${i * 0.3}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <NewsletterSection />
        <Footer />
      </div>

      {/* Custom CSS for animations and responsive images */}
      <style jsx>{`
        .responsive-image-container {
          position: relative;
          overflow: hidden;
        }
        
        .responsive-image-container img {
          transition: transform 0.3s ease;
        }
        
        .responsive-image-container:hover img {
          transform: scale(1.05);
        }
        
        .gallery-image {
          max-width: 90vw;
          max-height: 85vh;
          width: auto;
          height: auto;
          object-fit: contain;
        }
        
        .timeline-image {
          width: 100%;
          height: auto;
          min-height: 200px;
          max-height: 400px;
          object-fit: cover;
          object-position: center;
        }
        
        @media (max-width: 768px) {
          .timeline-image {
            min-height: 180px;
            max-height: 300px;
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(30px) rotate(-5deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite 2s; }
        .animate-float-slow { animation: float-slow 7s ease-in-out infinite 4s; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 1s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 1s ease-out; }
        .animate-scale-in { animation: scale-in 1s ease-out 0.5s both; }
        .animate-fade-in { animation: fade-in-up 1s ease-out 1.4s both; }
      `}</style>
    </PageLoader>
  )
}

// Timeline Event Component
function TimelineEvent({ event, index, isEven, isVisible }: { 
  event: any, 
  index: number, 
  isEven: boolean,
  isVisible: boolean 
}) {
  const [showGallery, setShowGallery] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const IconComponent = event.icon

  return (
    <div
      data-timeline-event
      className={`relative transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
    >
      {/* Mobile Timeline Dot */}
      <div className="absolute left-4 top-8 transform -translate-x-1/2 z-20 md:hidden">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${event.color} flex items-center justify-center border-2 border-white shadow-lg transition-all duration-500 ${
          isVisible ? 'scale-100' : 'scale-0'
        }`}>
          <IconComponent className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Desktop Timeline Dot */}
      <div className="absolute left-1/2 top-8 transform -translate-x-1/2 z-20 hidden md:block">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${event.color} flex items-center justify-center border-4 border-white shadow-xl transition-all duration-500 ${
          isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
        }`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Content Container */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-start ${
        isEven ? '' : 'md:grid-flow-col-dense'
      }`}>
        
        {/* Image Section */}
        <div className={`ml-12 md:ml-0 transition-all duration-700 ${
          isEven ? 'md:pr-8' : 'md:pl-8 md:col-start-2'
        } ${
          isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${isEven ? '-translate-x-20' : 'translate-x-20'}`
        }`}>
          <Card className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardContent className="p-0">
              <div className="relative cursor-pointer group" onClick={() => setShowGallery(true)}>
                <div className="relative w-full min-h-[200px] max-h-[400px] overflow-hidden responsive-image-container">
                  <Image
                    src={event.image}
                    width={400}
                    height={300}
                    alt={event.title}
                    className="timeline-image"
                    style={{
                      width: '100%',
                      height: 'auto',
                      minHeight: '200px',
                      maxHeight: '400px',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Year Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className={`bg-gradient-to-r ${event.color} text-white font-semibold px-3 py-1`}>
                    {event.year}
                  </Badge>
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button variant="outline" size="sm" className="bg-white/90 border-white text-gray-700 hover:bg-white">
                    <Globe className="w-4 h-4 mr-2" />
                    View Gallery
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Section */}
        <div className={`ml-12 md:ml-0 transition-all duration-700 delay-200 ${
          isEven ? 'md:pl-8' : 'md:pr-8 md:col-start-1'
        } ${
          isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${isEven ? 'translate-x-20' : '-translate-x-20'}`
        }`}>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-lg text-gray-600 mb-4">{event.subtitle}</p>
              <div className={`w-16 h-1 bg-gradient-to-r ${event.color} rounded-full`} />
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed text-lg">{event.description}</p>

            {/* Quote Section */}
            <div className="bg-gray-50 rounded-xl p-6 border-l-4 border-red-500">
              <Quote className="w-6 h-6 text-red-500 mb-3" />
              <p className="text-gray-700 italic font-medium">"{event.quote}"</p>
            </div>

            {/* Key Facts */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Key Highlights
              </h4>
              <div className="space-y-3">
                {event.facts.map((fact: string, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 leading-relaxed">{fact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {showGallery && (
        <GalleryModal
          images={event.gallery}
          currentIndex={currentImageIndex}
          onClose={() => setShowGallery(false)}
          onNext={() => setCurrentImageIndex((prev) => (prev + 1) % event.gallery.length)}
          onPrev={() => setCurrentImageIndex((prev) => (prev - 1 + event.gallery.length) % event.gallery.length)}
        />
      )}
    </div>
  )
}

// Gallery Modal Component
function GalleryModal({ images, currentIndex, onClose, onNext, onPrev }: {
  images: string[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="relative max-w-4xl max-h-full animate-scale-in">
        <div className="relative flex items-center justify-center max-w-[90vw] max-h-[85vh]">
          <Image
            src={images[currentIndex]}
            width={800}
            height={600}
            alt="Gallery image"
            className="gallery-image rounded-lg shadow-2xl"
            style={{ 
              objectFit: 'contain',
              maxWidth: '90vw',
              maxHeight: '85vh',
              width: 'auto',
              height: 'auto'
            }}
          />
        </div>
        
        <Button
          onClick={onPrev}
          variant="outline"
          size="sm"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 border-gray-300 text-gray-700 hover:bg-white backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={onNext}
          variant="outline"
          size="sm"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 border-gray-300 text-gray-700 hover:bg-white backdrop-blur-sm"
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
        
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 bg-white/80 border-gray-300 text-gray-700 hover:bg-white backdrop-blur-sm"
        >
          ×
        </Button>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-700 text-sm bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm border border-gray-300">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  )
}

// Quiz Component
function QuizComponent({ question, questionNumber, totalQuestions, onAnswer }: {
  question: any
  questionNumber: number
  totalQuestions: number
  onAnswer: (index: number) => void
}) {
  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto border border-gray-200 animate-scale-in shadow-xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Progress value={(questionNumber / totalQuestions) * 100} className="w-32" />
          <span className="text-sm text-gray-600">
            {questionNumber} of {totalQuestions}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">{question.question}</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {question.options.map((option: string, index: number) => (
          <Button
            key={index}
            onClick={() => onAnswer(index)}
            variant="outline"
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-red-500 p-4 text-left justify-start w-full transition-all duration-300 hover:scale-102"
          >
            <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-4 text-sm font-bold text-gray-700">
              {String.fromCharCode(65 + index)}
            </span>
            {option}
          </Button>
        ))}
      </div>
    </div>
  )
}

// Quiz Results Component
function QuizResults({ score, total, onRestart }: {
  score: number
  total: number
  onRestart: () => void
}) {
  const percentage = Math.round((score / total) * 100)
  
  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto text-center border border-gray-200 animate-scale-in shadow-xl">
      <div className="mb-8">
        <div className="text-6xl font-bold text-yellow-500 mb-4 animate-scale-in">{percentage}%</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
        <p className="text-gray-600">
          You scored {score} out of {total} questions correctly
        </p>
      </div>
      
      <div className="mb-8">
        {percentage >= 80 && (
          <p className="text-green-400 text-lg flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6" />
            Excellent! You know the Governor's journey very well!
          </p>
        )}
        {percentage >= 60 && percentage < 80 && (
          <p className="text-yellow-400 text-lg flex items-center justify-center gap-2">
            <Star className="w-6 h-6" />
            Good job! You have a solid understanding of his story.
          </p>
        )}
        {percentage < 60 && (
          <p className="text-red-400 text-lg flex items-center justify-center gap-2">
            <BookOpen className="w-6 h-6" />
            Keep learning! There's more to discover about his remarkable journey.
          </p>
        )}
      </div>
      
      <Button
        onClick={onRestart}
        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 transition-all duration-300 hover:scale-105"
      >
        <ArrowRight className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  )
}