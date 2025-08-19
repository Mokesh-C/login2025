'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Calendar, MapPin, Users, Trophy, Clock, Target, Star, Mail, Phone, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import ToastCard from '@/components/ToastCard'

const fadeInUp = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true, amount: 0.15 }
}

const staggerChildren = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  transition: { staggerChildren: 0.2 },
  viewport: { once: true }
}

const Section = ({ children, className = "", id }: { children: React.ReactNode, className?: string, id?: string }) => (
  <section id={id} className={`py-12 sm:py-16 lg:py-20 px-4 ${className}`}>
    <div className="max-w-6xl mx-auto">
      {children}
    </div>
  </section>
)

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    className={`bg-gradient-to-br from-primary-100/40 to-primary/60 backdrop-blur-sm border border-accent-violet/20 rounded-2xl p-6 ${className}`}
    {...fadeInUp}
  >
    {children}
  </motion.div>
)

export default function IdeaQuest() {
  const [activeSection, setActiveSection] = useState('home')
  const [showMoreSections, setShowMoreSections] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; textColor?: string }>>([])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(sectionId)
      setIsMobileMenuOpen(false) // Close mobile menu after navigation
    }
  }

  const handleExploreMore = () => {
    setShowMoreSections(true)
    scrollToSection('rules')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const showToast = (message: string, textColor: string = 'text-yellow-700') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, textColor }])
  }

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleRegisterClick = () => {
    showToast('🚫 Registration not yet started. Please check back later!', 'text-orange-700')
  }

  // Close mobile menu when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (isMobileMenuOpen && !target.closest('nav')) {
        setIsMobileMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent scrolling when menu is open
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])
  
  // Auto-remove toasts after they expire
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts(prev => prev.slice(1)) // Remove the oldest toast
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toasts])

  return (
    <div className="bg-gradient-to-br from-accent-first via-accent-second to-accent-third min-h-screen text-neutral-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-primary/20 backdrop-blur-md border-b border-accent-violet/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center relative z-50">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Image 
              src="/IQ.png" 
              alt="IdeaQuest Logo" 
              width={32} 
              height={32}
              className="object-contain sm:w-10 sm:h-10"
            />
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-accent-violet to-accent-cyan bg-clip-text text-transparent">
              IdeaQuest'25
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-6">
            {['home', 'about', 'timeline', 'rules', 'contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`capitalize px-4 py-2 rounded-lg transition-all ${
                  activeSection === item 
                    ? 'bg-accent-violet text-white' 
                    : 'hover:bg-accent-violet/20'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-accent-violet/20 transition-colors relative z-50"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <div 
                className={`w-full h-0.5 bg-accent-violet transition-transform duration-300 ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              ></div>
              <div 
                className={`w-full h-0.5 bg-accent-violet transition-opacity duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}
              ></div>
              <div 
                className={`w-full h-0.5 bg-accent-violet transition-transform duration-300 ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              ></div>
            </div>
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <motion.div 
            className="lg:hidden bg-primary/95 backdrop-blur-md border-t border-accent-violet/20 relative z-50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-4 py-4 space-y-2 max-h-screen overflow-y-auto">
              {['home', 'about', 'timeline', 'rules', 'contact'].map((item, index) => (
                <motion.button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`capitalize w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeSection === item 
                      ? 'bg-accent-violet text-white' 
                      : 'text-neutral-white hover:bg-accent-violet/20'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.2 }}
                >
                  {item}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </nav>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Hero Section */}
      <Section id="home" className="pt-20 sm:pt-24 pb-10 sm:pb-20">
        <motion.div className="text-center" {...fadeInUp}>
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8 space-y-4 sm:space-y-0 sm:space-x-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* <Image 
             
              alt="IdeaQuest Logo" 
              width={80} 
              height={80}
              className="object-contain sm:w-24 sm:h-24 lg:w-32 lg:h-32"
            /> */}
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-inter font-bold bg-gradient-to-r from-accent-violet via-accent-cyan to-accent-violet bg-clip-text text-transparent">
              IdeaQuest'25
            </h1>
          </motion.div>
          <motion.h2 
            className="text-xl sm:text-2xl lg:text-4xl mb-6 sm:mb-8 text-accent-mystic"
            {...fadeInUp}
          >
            Tech for Tomorrow
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-12 text-neutral-chapter max-w-4xl mx-auto px-4"
            {...fadeInUp}
          >
            A National-Level Onsite Hackathon @ PSG College of Technology
          </motion.p>
          
          <motion.div className="mb-8 sm:mb-12" {...fadeInUp}>
            <button 
              onClick={handleRegisterClick}
              className="bg-violet-500 hover:bg-violet-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-lg sm:text-xl font-semibold hover:scale-105 transition-all shadow-lg shadow-accent-violet/25 text-white"
            >
              Register Now
            </button>
          </motion.div>

          {/* Quick Highlights */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 max-w-5xl mx-auto"
            variants={staggerChildren}
            initial="initial"
            whileInView="whileInView"
          >
            {[
              { icon: Calendar, text: "19 – 20 September 2025", label: "Dates" },
              { icon: MapPin, text: "PSG College of Technology, Coimbatore", label: "Venue" },
              { icon: Users, text: "Engineering & PG Students", label: "Eligibility" },
              { icon: Target, text: "Fintech | HealthTech | Sustainability", label: "Domains" },
              { icon: Trophy, text: "Cash, Swags & Certificates", label: "Prizes" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="bg-gradient-to-br  backdrop-blur-sm border border-accent-violet/20 rounded-xl p-4 text-center"
                variants={fadeInUp}
              >
                <item.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-3 text-accent-cyan" />
                <h4 className="font-semibold text-accent-violet mb-2 text-sm sm:text-base">{item.label}</h4>
                <p className="text-xs sm:text-sm text-neutral-chapter">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="mt-12 sm:mt-16 max-w-4xl mx-auto px-4" {...fadeInUp}>
            <p className="text-base sm:text-lg lg:text-xl text-neutral-chapter leading-relaxed italic">
              "Join 100+ bright minds from across India for 12 hours of innovation, problem-solving, and 
              collaboration. Solve real-world challenges posed by industry experts and showcase your 
              creativity."
            </p>
          </motion.div>
        </motion.div>
      </Section>

      {/* About Section */}
      <Section id="about" className="bg-from-violet-900 to-indigo-900">
        <motion.div {...fadeInUp}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 sm:mb-16 bg-gradient-to-r from-accent-violet to-accent-cyan bg-clip-text text-transparent">
            About IdeaQuest'25
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-stretch">
            <Card className="h-full bg-from-purple-900 to-indigo-900">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-accent-violet">What is IdeaQuest?</h3>
              <div className="flex flex-col h-full">
                <p className="text-neutral-chapter leading-relaxed mb-4 sm:mb-6 flex-grow text-sm sm:text-base">
                  IdeaQuest'25 is a national-level onsite hackathon organized by the Department of Computer 
                  Applications, PSG College of Technology. With the theme "Tech for Tomorrow", participants 
                  will work on real-world challenges provided directly by domain-expert companies.
                </p>
                
              </div>
            </Card>

            <Card className="h-full bg-from-indigo-900 to-violet-900">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-accent-violet">Why IdeaQuest?</h3>
              <div className="flex flex-col h-full">
                <p className="text-neutral-chapter leading-relaxed flex-grow text-sm sm:text-base">
                  Unlike traditional hackathons, IdeaQuest is industry-first. Every problem statement comes 
                  from companies, ensuring solutions have real impact and relevance. The event promotes 
                  innovation, teamwork, and exposure to live industry challenges.
                </p>
              </div>
            </Card>
          </div>

          <Card className="mt-8 sm:mt-12 bg-from-violet-900 to-indigo-900">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-accent-violet text-center">Organizers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
              <div>
                <h4 className="font-semibold text-accent-cyan mb-2">Host</h4>
                <p className="text-neutral-chapter text-sm sm:text-base">PSG College of Technology</p>
              </div>
              <div>
                <h4 className="font-semibold text-accent-cyan mb-2">Organizers</h4>
                <p className="text-neutral-chapter text-sm sm:text-base">Computer Applications Association (CAA)</p>
              </div>
              <div>
                <h4 className="font-semibold text-accent-cyan mb-2">Sponsors</h4>
                <p className="text-neutral-chapter text-sm sm:text-base">Domain-expert companies contributing problem statements</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </Section>

      {/* Timeline Section */}
      <Section id="timeline" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent-violet/5 via-transparent to-transparent -z-10"></div>
        <motion.div {...fadeInUp}>
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1 text-sm font-medium text-accent-cyan bg-accent-cyan/10 rounded-full mb-3">Schedule</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-accent-violet to-accent-cyan bg-clip-text text-transparent">
              Event Timeline
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-accent-violet to-accent-cyan mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="relative pl-8
            before:absolute before:left-6 before:top-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-accent-violet before:to-accent-cyan
            before:opacity-30 before:rounded-full
            sm:pl-20 sm:before:left-10
          ">
            {[
              { 
                date: "Till Sep 12, 2025", 
                event: "Team registration with theme/domain selection", 
                icon: Users,
                color: "from-purple-900 to-indigo-500"
              },
              { 
                date: "Sep 15, 2025", 
                event: "RSVP deadline for confirmed teams", 
                icon: Clock,
                color: "from-cyan-500 to-blue-900"
              },
              { 
                date: "Sep 16, 2025", 
                event: "Finalization of selected teams", 
                icon: Target,
                color: "from-emerald-500 to-teal-500"
              },
              { 
                date: "Sep 19, 2025", 
                event: "Onsite Hackathon begins (12-hour coding sprint)", 
                icon: Calendar,
                color: "from-amber-500 to-orange-500"
              },
              { 
                date: "Sep 20, 2025", 
                event: "Presentations & Prize Distribution", 
                icon: Trophy,
                color: "from-rose-500 to-pink-500"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className={`relative mb-8 sm:mb-10 group ${index === 4 ? 'pb-0' : 'pb-4'}`}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                {/* Timeline dot */}
                <div className={`absolute left-0 sm:left-10 top-1 w-5 h-5 rounded-full bg-gradient-to-r ${item.color} transform -translate-x-1/2 
                  flex items-center justify-center text-white shadow-lg shadow-accent-violet/30 z-10`}>
                  <item.icon className="w-3 h-3" />
                </div>
                
                {/* Card */}
                <div className={`relative p-6 rounded-xl bg-gradient-to-br from-primary-100/30 to-primary/50 backdrop-blur-sm 
                  border border-accent-violet/20 shadow-lg hover:shadow-xl transition-all duration-300
                  hover:translate-x-2 hover:-translate-y-1 group-hover:border-accent-violet/40
                  before:absolute before:inset-0 before:bg-gradient-to-r ${item.color} before:opacity-0 before:transition-opacity 
                  before:duration-300 before:rounded-xl before:-z-10 group-hover:before:opacity-10`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h4 className="text-lg font-bold text-accent-violet">{item.date}</h4>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${item.color} text-white`}>
                      {item.event.split(' ')[0]}
                    </span>
                  </div>
                  <p className="mt-2 text-neutral-chapter">{item.event}</p>
                  
                  {/* Decorative elements */}
                  <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-gradient-to-r from-accent-violet to-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute -left-2 -bottom-2 w-4 h-4 rounded-full bg-gradient-to-r from-accent-cyan to-accent-violet opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Explore More Button */}
          {!showMoreSections && (
            <motion.div 
              className="text-center mt-12 sm:mt-16" 
              {...fadeInUp}
            >
              <button 
                onClick={handleExploreMore}
                className="bg-gradient-to-r  px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-all shadow-lg shadow-accent-violet/25 text-white flex items-center space-x-2 mx-auto"
              >
                <span>Explore More</span>
                <ChevronDown className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </Section>

      {/* Rules & Guidelines and Contact */}
      {showMoreSections && (
        <Section id="rules" className="bg-primary/20">
          <motion.div {...fadeInUp} className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 sm:mb-16 text-white">
              Event Details
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              {/* Rules Section - 75% width */}
              <div className="w-full md:w-3/4">
                <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-accent-violet">
                  Rules & Guidelines
                </h3>
                <Card className="bg-gradient-to-r from-primary-100/40 to-primary/60 border border-accent-violet/20">
                  <h4 className="text-xl font-bold mb-4 text-accent-violet flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    For Students
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-accent-cyan mb-2 text-sm sm:text-base">Facilities</h5>
                      <p className="text-neutral-chapter text-xs sm:text-sm">Wi-Fi, meals & snacks provided; accommodation available (details shared later)</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-accent-cyan mb-2 text-sm sm:text-base">Check-In</h5>
                      <p className="text-neutral-chapter text-xs sm:text-sm">Teams must report by 8:00 AM, Sep 19. Problem statements revealed by 10:00 AM</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-accent-cyan mb-2 text-sm sm:text-base">Work Hours</h5>
                      <p className="text-neutral-chapter text-xs sm:text-sm">Development permitted on campus until 8:00 PM</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-accent-cyan mb-2 text-sm sm:text-base">Equipment</h5>
                      <p className="text-neutral-chapter text-xs sm:text-sm">Bring your own laptops & accessories</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-accent-cyan mb-2 text-sm sm:text-base">Teams</h5>
                      <p className="text-neutral-chapter text-xs sm:text-sm">2–3 members per team; mixed-college teams allowed</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-accent-cyan mb-2 text-sm sm:text-base">Submissions</h5>
                      <p className="text-neutral-chapter text-xs sm:text-sm">Code must be pushed to GitHub before deadline. No further coding allowed; only presentations can be refined afterward</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Contact Section - 25% width */}
              <div id='contact' className="w-full md:w-1/4">
                <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-accent-violet">
                  Contact Us
                </h3>
                <Card className="bg-gradient-to-r from-primary-100/40 to-primary/60 border border-accent-violet/20 h-full">
                  <h4 className="font-semibold text-accent-cyan mb-4 text-center">Event Coordinators</h4>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-accent-violet rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">MK</span>
                      </div>
                      <h5 className="font-semibold text-accent-violet mb-1">Manikandan K S</h5>
                      <div className="space-y-1 text-xs">
                        <a href="mailto:24mx112@psgtech.ac.in" className="text-neutral-chapter hover:text-accent-cyan transition-colors block">
                          24mx112@psgtech.ac.in
                        </a>
                        <a href="tel:+916381730919" className="text-neutral-chapter hover:text-accent-cyan transition-colors block">
                          +91 63817 30919
                        </a>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-accent-cyan rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">RS</span>
                      </div>
                      <h5 className="font-semibold text-accent-violet mb-1">Rishi Sundaresan</h5>
                      <div className="space-y-1 text-xs">
                        <a href="mailto:24mx122@psgtech.ac.in" className="text-neutral-chapter hover:text-accent-cyan transition-colors block">
                          24mx122@psgtech.ac.in
                        </a>
                        <a href="tel:+918072566317" className="text-neutral-chapter hover:text-accent-cyan transition-colors block">
                          +91 80725 66317
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        </Section>
      )}

      {/* Scroll to top button */}
      {showMoreSections && (
        <motion.button
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 bg-accent-violet rounded-full flex items-center justify-center shadow-lg shadow-accent-violet/25 hover:scale-110 transition-transform"
          onClick={() => scrollToSection('home')}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-white rotate-180" />
        </motion.button>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            id={toast.id}
            message={toast.message}
            textColor={toast.textColor}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}