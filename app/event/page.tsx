'use client'
import { useState, useEffect } from "react";
import Image from "next/image";
import useEvents from "@/hooks/useEvents";
import { PageLoader } from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";

export default function EventPage() {
  const router = useRouter();
  const { events, loading } = useEvents();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [carouselClass, setCarouselClass] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const nextSlide = () => {
    setIsFading(true);
    setCarouselClass('next');
    setIsAutoPlaying(false);
    
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % events.length);
      setCarouselClass('');
      setIsFading(false);
    }, 500);
  };

  const prevSlide = () => {
    setIsFading(true);
    setCarouselClass('prev');
    setIsAutoPlaying(false);
    
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + events.length) % events.length);
      setCarouselClass('');
      setIsFading(false);
    }, 500);
  };

  // Auto-move every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || !mounted || events.length === 0) return;
    
    const interval = setInterval(() => {
      // Use the same logic as manual nextSlide but without stopping auto-play
      setIsFading(true);
      setCarouselClass('next');
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % events.length);
        setCarouselClass('');
        setIsFading(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, mounted, events.length]);

  // Hide navigation header on this page
  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      header.style.display = 'none';
    }

    // Cleanup: show header when leaving this page
    return () => {
      if (header) {
        header.style.display = 'block';
      }
    };
  }, []);

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to get circular rotated events for bottom cards
  // First card shows NEXT event, second shows NEXT+1, etc.
  const getCircularEvents = () => {
    if (!events || events.length === 0) return [];
    
    const rotatedEvents = [];
    for (let i = 1; i <= 4; i++) {
      const index = (activeIndex + i) % events.length;
      if (events[index]) {
        rotatedEvents.push(events[index]);
      }
    }
    return rotatedEvents;
  };

  // Debug: Log current event data
  useEffect(() => {
    if (events.length > 0) {
      console.log('Current event:', events[activeIndex]);
      console.log('Active index:', activeIndex);
      console.log('Total events:', events.length);
    }
  }, [activeIndex, events]);

  if (loading) return <PageLoader text="Loading events..." />;

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <PageLoader text="Loading..." />;
  }

  // Ensure we have valid events and activeIndex
  if (events.length === 0 || !events[activeIndex]) {
    return <PageLoader text="Loading events..." />;
  }

  return (
    <div>
      <div className={`carousel bg-gradient-to-br from-accent-first via-accent-second to-accent-third min-h-screen w-full overflow-hidden relative ${carouselClass}`}>
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeOut {
            from {
              opacity: 1;
              transform: translateY(0);
            }
            to {
              opacity: 0;
              transform: translateY(-20px);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-out forwards;
          }
          .animate-fadeOut {
            animation: fadeOut 0.3s ease-in forwards;
          }
        `}</style>
        
        {/* Back Button */}
        <button 
          onClick={() => router.push('/')} 
          className="absolute top-4 left-4 z-[200] bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors border border-white/30 flex items-center gap-2 text-sm md:text-base"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        {/* Desktop Layout - Absolute Positioning */}
        <div className="hidden md:block">
          <div className="list">
            <div className="item absolute inset-0 w-full h-full">
              <div className="absolute top-[10%] left-[10%] w-[80%] max-w-[80%] pr-[10%] box-border text-white">
                <div className={`author font-bold tracking-[8px] text-base transition-all duration-300 ${isFading ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>Our Events</div>
                <div className={`title text-[5em] font-bold leading-[1.3em] flex flex-row items-center gap-6 transition-all duration-300 ${isFading ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
                  <div className="w-20 h-20 bg-blue-200/10 border border-blue-200/20 rounded-full p-2 flex items-center justify-center overflow-hidden">
                    <Image
                      src={events[activeIndex]?.logoUrl || "/event/1.png"}
                      alt={`${events[activeIndex]?.name || "Event"} logo`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain rounded-full"
                      
                    />
                  </div>
                  <span className="break-words">{events[activeIndex]?.name || "Loading..."}</span>
                </div>
                <div className={`topic text-[2em] font-bold leading-[1.3em] text-[#f7794f] mt-4 transition-all duration-300 ${isFading ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>{events[activeIndex]?.type || "Loading..."}</div>
                <div className={`des mb-8 pr-[30%] text-lg leading-relaxed text-justify transition-all duration-300 ${isFading ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
                  {events[activeIndex]?.description || events[activeIndex]?.tagline || "Loading event details..."}
                </div>
                <button onClick={() => router.push(`/events/${events[activeIndex]?.id}`)} className={`border-none bg-[#eee] text-gray-800 tracking-[3px] p-3 rounded-md font-[Poppins] font-medium text-base transition-all duration-300 ${isFading ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>Explore More</button>
              </div>
            </div>
          </div>

          {/* Desktop Thumbnails */}
          <div className="thumbnail absolute bottom-[50px] left-[60%] w-max z-[100] flex gap-[20px] overflow-hidden">
            <div className={`flex gap-[20px] transition-transform duration-500 ease-in-out ${
              carouselClass === 'next' ? 'transform -translate-x-[170px]' : 
              carouselClass === 'prev' ? 'transform translate-x-[170px]' : ''
            }`}>
              {getCircularEvents().slice(0, 4).map((event, index) => (
                <div 
                  key={`${event.id}-${activeIndex}-${index}`}
                  className="item w-[150px] h-[220px] shrink-0 relative"
                >
                  <Image
                    src={event.images?.[0]?.url || "/event/1.png"}
                    alt={event.name}
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover rounded-[20px]"
                  />
                  <div className="absolute top-2 left-2 w-14 h-14 bg-white rounded-full p-2 overflow-hidden">
                    <Image
                      src={event.logoUrl || "/event/1.png"}
                      alt={`${event.name} logo`}
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="content absolute bottom-[10px] left-[10px] right-[10px] text-white">
                    <div className="title text-[#f1683a] font-medium text-sm truncate">
                      {event.name}
                    </div>
                    <div className="description text-[#f1683a] font-light text-xs truncate">
                      {event.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="absolute top-[80%] right-[35%] z-[100] w-[300px] max-w-[30%] flex items-center gap-[10px]">
            <button onClick={prevSlide} className="w-14 h-14 rounded-full bg-[#eee4] border-none text-white font-mono font-bold transition duration-500 hover:bg-white hover:text-black">
              &lt;
            </button>
            <button onClick={nextSlide} className="w-14 h-14 rounded-full bg-[#eee4] border-none text-white font-mono font-bold transition duration-500 hover:bg-white hover:text-black">
              &gt;
            </button>
          </div>
        </div>

                  {/* Mobile Layout - Column Flow */}
          <div className="md:hidden flex flex-col min-h-screen">
            {/* Mobile Main Content */}
            <div className="flex-1 flex flex-col justify-center px-5 pt-20 pb-8">
              <div className="text-white text-left">
              <div className={`author font-bold tracking-[4px] text-sm transition-all duration-300 ${isFading ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>Our Events</div>
                              <div className={`title text-[2.5em] font-bold leading-[1.2em] flex flex-col items-start gap-3 mt-4 transition-all duration-300 ${isFading ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
                  <div className="w-16 h-16 bg-blue-200/10 border border-blue-200/20 rounded-full p-2 flex items-center justify-center">
                    <Image
                      src={events[activeIndex]?.logoUrl || "/event/1.png"}
                      alt={`${events[activeIndex]?.name || "Event"} logo`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <span className="break-words">{events[activeIndex]?.name || "Loading..."}</span>
                </div>
              <div className={`topic text-[2em] font-bold leading-[1.2em] text-[#f1683a] mt-2 transition-all duration-300 ${isFading ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>{events[activeIndex]?.type || "Loading..."}</div>
              <div className={`des mb-6 text-sm leading-relaxed transition-all duration-300 ${isFading ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
                {events[activeIndex]?.description || events[activeIndex]?.tagline || "Loading event details..."}
              </div>
              <button onClick={() => router.push(`/events/${events[activeIndex]?.id}`)} className={`border-none bg-[#eee] text-gray-800 tracking-[2px] p-2 rounded-md font-[Poppins] font-medium text-sm transition-all duration-300 ${isFading ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>Explore More</button>
            </div>
          </div>

          {/* Mobile Thumbnails */}
          <div className="px-5 pb-4">
            <div className="flex justify-center">
              <div className={`flex gap-[10px] transition-transform duration-500 ease-in-out ${
                carouselClass === 'next' ? 'transform -translate-x-[120px]' : 
                carouselClass === 'prev' ? 'transform translate-x-[120px]' : ''
              }`}>
                {getCircularEvents().slice(0, 3).map((event, index) => (
                  <div 
                    key={`${event.id}-${activeIndex}-${index}`}
                    className="item w-[100px] h-[140px] shrink-0 relative"
                  >
                    <Image
                      src={event.images?.[0]?.url || "/event/1.png"}
                      alt={event.name}
                      width={1000}
                      height={1000}
                      className="w-full h-full object-cover rounded-[15px]"
                    />
                    <div className="absolute top-1 left-1 w-8 h-8 bg-white rounded-full p-1 overflow-hidden">
                      <Image
                        src={event.logoUrl || "/event/1.png"}
                        alt={`${event.name} logo`}
                        width={40}
                        height={40}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="content absolute bottom-[5px] left-[5px] right-[5px] text-white">
                      <div className="title text-[#f1683a] font-medium  text-xs truncate">
                        {event.name}
                      </div>
                      <div className="description text-[#f1683a] font-light text-xs truncate">
                        {event.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="px-5 pb-6">
            <div className="flex justify-center items-center gap-[5px]">
              <button onClick={prevSlide} className="w-10 h-10 rounded-full bg-[#eee4] border-none text-white font-mono font-bold transition duration-500 hover:bg-white hover:text-black text-sm">
                &lt;
              </button>
              <button onClick={nextSlide} className="w-10 h-10 rounded-full bg-[#eee4] border-none text-white font-mono font-bold transition duration-500 hover:bg-white hover:text-black text-sm">
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}