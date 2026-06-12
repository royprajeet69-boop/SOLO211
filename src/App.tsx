import React, { useState, useEffect, useRef } from 'react';
import {
  Star, Shield, ArrowRight, Menu, X, Smile, Clock,
  Check, Sparkles, Home, Building, ChevronRight, Phone,
  Mail, MapPin, BadgeCheck, ShieldAlert, Instagram, Facebook, MessageCircle
} from 'lucide-react';
import { Booking, ServiceItem, PricingPlan, MessageItem } from './types';
import BubblesBg from './components/BubblesBg';
import BookingForm from './components/BookingForm';
import AdminPortal from './components/AdminPortal';
import AIChatBot from './components/AIChatBot';

// Helper to trigger the ripple effect on button clicks
export function triggerRipple(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  
  const circle = document.createElement("span");
  circle.style.width = circle.style.height = `${size}px`;
  circle.style.left = `${e.clientX - rect.left - size / 2}px`;
  circle.style.top = `${e.clientY - rect.top - size / 2}px`;
  circle.classList.add("ripple-span");
  
  // Clean up any old ripple
  const existingRipple = button.getElementsByClassName("ripple-span")[0];
  if (existingRipple) {
    existingRipple.remove();
  }
  
  button.classList.add("ripple-container");
  button.appendChild(circle);
  
  setTimeout(() => {
    circle.remove();
  }, 600);
}

// React component to trigger scroll reveal fade-ins cleanly
function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string; key?: React.Key }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(domRef.current!);
      }
    }, { threshold: 0.1 });
    
    if (domRef.current) {
      observer.observe(domRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`scroll-reveal ${isVisible ? 'active' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

// Counter that animates smoothly from 0 to target on scroll entry
function AnimatedCounter({ end, duration = 2000, suffix = '', decimals = 0 }: { end: number; duration?: number; suffix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number | null = null;
          
          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeProgress = progress * (2 - progress); // ease out quad
            setCount(easeProgress * end);
            
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCount(end);
            }
          };
          
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={elementRef} className="font-serif">
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function App() {
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  // Core App states loaded inside localStorage with fallbacks
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);

  // Pre-load default values once if empty inside local storage
  useEffect(() => {
    // 1. BOOKINGS
    const savedBookings = localStorage.getItem('purespace_bookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    } else {
      const defaultBookings: Booking[] = [
        {
          id: 'b-1',
          clientName: 'Eleanor Vance',
          clientPhone: '555-0192',
          serviceType: 'Residential Cleaning',
          preferredDate: '2026-06-19',
          message: 'Please pay extra attention to the kitchen wooden floors and dusting the ceiling fans.',
          status: 'Confirmed',
          createdAt: '2026-06-12T07:12:31-07:00'
        },
        {
          id: 'b-2',
          clientName: 'Marcus Sterling',
          clientPhone: '555-0243',
          serviceType: 'Office & Commercial',
          preferredDate: '2026-06-15',
          message: 'Weekly office cleaning for our 12-desk co-working floor. Needs trash removal and desk sanitization.',
          status: 'Pending',
          createdAt: '2026-06-12T07:12:31-07:00'
        },
        {
          id: 'b-3',
          clientName: 'Clara Oswald',
          clientPhone: '555-0871',
          serviceType: 'Deep Clean & Move-Out',
          preferredDate: '2026-06-12',
          message: 'End of tenancy deep clean. Needs to be spotless for full deposit return.',
          status: 'Completed',
          createdAt: '2026-06-11T07:12:31-07:00'
        },
        {
          id: 'b-4',
          clientName: 'Arthur Pendragon',
          clientPhone: '555-1049',
          serviceType: 'Residential Cleaning',
          preferredDate: '2026-06-18',
          message: 'Bi-weekly general upkeep. We have a friendly golden retriever who sheds quite a bit.',
          status: 'Pending',
          createdAt: '2026-06-12T07:12:31-07:00'
        },
        {
          id: 'b-5',
          clientName: 'Diana Prince',
          clientPhone: '555-9082',
          serviceType: 'Deep Clean & Move-Out',
          preferredDate: '2026-06-20',
          message: 'Post-renovation deep cleaning to remove fine drywall dust and polish all light fittings.',
          status: 'Confirmed',
          createdAt: '2026-06-12T07:12:31-07:00'
        }
      ];
      setBookings(defaultBookings);
      localStorage.setItem('purespace_bookings', JSON.stringify(defaultBookings));
    }

    // 2. SERVICES
    const savedServices = localStorage.getItem('purespace_services');
    if (savedServices) {
      setServices(JSON.parse(savedServices));
    } else {
      const defaultServices: ServiceItem[] = [
        {
          id: 's-1',
          name: 'Residential Cleaning',
          description: 'Standard detailed upkeep dusting, vacuuming, mopping, and biological sanitation for living spaces.',
          icon: '🏠',
          visible: true,
          basePrice: 79
        },
        {
          id: 's-2',
          name: 'Office & Commercial',
          description: 'Tailored regular workspace polishing, communal kitchen sanitization, and trash management operations.',
          icon: '🏢',
          visible: true,
          basePrice: 189
        },
        {
          id: 's-3',
          name: 'Deep Clean & Move-Out',
          description: 'Heavy grease scrub, complete appliance interiors polish, high-dusting, and detail sanitation checks.',
          icon: '✨',
          visible: true,
          basePrice: 249
        }
      ];
      setServices(defaultServices);
      localStorage.setItem('purespace_services', JSON.stringify(defaultServices));
    }

    // 3. PRICING PLANS
    const savedPricing = localStorage.getItem('purespace_pricing');
    if (savedPricing) {
      setPricingPlans(JSON.parse(savedPricing));
    } else {
      const defaultPricing: PricingPlan[] = [
        {
          id: 'p-1',
          name: 'Basic',
          price: 59,
          description: 'Perfect for regular maintenance of small flats and townhouses.',
          features: [
            'Basic dusting & vacuuming',
            'Communal trash disposal',
            'Full room mopping & sweeping',
            'Eco-friendly cleaning supplies',
            '1 Dedicated Professional Cleaner'
          ],
          popular: false
        },
        {
          id: 'p-2',
          name: 'Standard',
          price: 149,
          description: 'Comprehensive deep cleaning or bi-weekly home sanitation.',
          features: [
            'All Basic package items',
            'Detailed kitchen & bathroom sanitizing',
            'Exterior appliance detailing',
            'Indoor windows pristine polishing',
            '2 Professional Cleaners',
            'Flex rescheduling benefits'
          ],
          popular: true
        },
        {
          id: 'p-3',
          name: 'Premium',
          price: 249,
          description: 'Heavy duty sterilization covering move-out or holiday needs.',
          features: [
            'Heavy scrub and stain treatment',
            'Oven & Fridge interior steam sterile',
            'Doors, trim & baseboard wipe downs',
            'AC filter sanitization check',
            'Up to 3 Professional Cleaners',
            'Priority 24/7 client dispatch hotline'
          ],
          popular: false
        }
      ];
      setPricingPlans(defaultPricing);
      localStorage.setItem('purespace_pricing', JSON.stringify(defaultPricing));
    }

    // 4. INBOX MESSAGES
    const savedMessages = localStorage.getItem('purespace_messages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const defaultMessages: MessageItem[] = [
        {
          id: 'm-1',
          name: 'Madelyn Fletcher',
          phone: '555-4921',
          serviceType: 'Residential Cleaning',
          preferredDate: '2026-06-11',
          message: 'The team was lovely! Our bathrooms shine like mirrors and everything feels so calm.',
          date: '2026-06-11',
          read: true
        },
        {
          id: 'm-2',
          name: 'Sienna Rodriguez',
          phone: '555-8833',
          serviceType: 'Deep Clean & Move-Out',
          preferredDate: '2026-06-12',
          message: 'Absolutely perfect move-out help. My agent commented on how pristine the baseboards are. 5 stars!',
          date: '2026-06-12',
          read: false
        }
      ];
      setMessages(defaultMessages);
      localStorage.setItem('purespace_messages', JSON.stringify(defaultMessages));
    }
  }, []);

  // Listen to global scroll position to toggle sticky navigation shadow effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Globally bind the Ctrl+Shift+A event to trigger the admin modal interface
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'A') {
        e.preventDefault();
        setIsAdminOpen((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Client triggers a new booking from the booking form
  const handleAddNewBooking = (newB: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
    const newId = `b-${Date.now()}`;
    const fullBooking: Booking = {
      ...newB,
      id: newId,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    
    // Add to bookings list
    const updatedBookings = [fullBooking, ...bookings];
    setBookings(updatedBookings);
    localStorage.setItem('purespace_bookings', JSON.stringify(updatedBookings));

    // Also pipe this into Admin Messages Inbox
    const messageId = `m-${Date.now()}`;
    const newMsg: MessageItem = {
      id: messageId,
      name: newB.clientName,
      phone: newB.clientPhone,
      serviceType: newB.serviceType,
      preferredDate: newB.preferredDate,
      message: newB.message || 'Booked directly via the online portal request form.',
      date: new Date().toISOString().split('T')[0],
      read: false
    };

    const updatedMessages = [newMsg, ...messages];
    setMessages(updatedMessages);
    localStorage.setItem('purespace_messages', JSON.stringify(updatedMessages));
  };

  // Quick scroll to element ID helper
  const navigateTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    triggerRipple(e);
    setMobileMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      const topOffset = 80; // height of sticky nav
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A2E] font-sans antialiased selection:bg-[#4ECDC4]/20 selection:text-[#1A1A2E] overflow-x-hidden">
      
      {/* 1. STICKY BACKDROP-BLUR NAVIGATION */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white/80 backdrop-blur-md ${
          scrolled ? 'shadow-md border-b border-gray-150 py-3' : 'py-5 border-b border-transparent'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          
          {/* Bran Logo with custom Typography and accent teal dot */}
          <a
            href="#"
            onClick={(e) => navigateTo(e, 'hero-top')}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EEF9F8] border border-[#4ECDC4]/30 flex items-center justify-center font-serif text-[#4ECDC4] font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
              P
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-[#1A1A2E]">
              PureSpace<span className="text-[#4ECDC4]">.</span>
            </span>
          </a>

          {/* Nav core links for desktop viewport */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#services"
              onClick={(e) => navigateTo(e, 'services-grid')}
              className="text-gray-500 hover:text-[#4ECDC4] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#4ECDC4] after:transition-all hover:after:w-full"
            >
              Services
            </a>
            <a
              href="#about"
              onClick={(e) => navigateTo(e, 'how-it-works')}
              className="text-gray-500 hover:text-[#4ECDC4] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#4ECDC4] after:transition-all hover:after:w-full"
            >
              How it Works
            </a>
            <a
              href="#pricing"
              onClick={(e) => navigateTo(e, 'pricing-plans')}
              className="text-gray-500 hover:text-[#4ECDC4] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#4ECDC4] after:transition-all hover:after:w-full"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              onClick={(e) => navigateTo(e, 'testimonials-section')}
              className="text-gray-500 hover:text-[#4ECDC4] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#4ECDC4] after:transition-all hover:after:w-full"
            >
              Reviews
            </a>
            <a
              href="#contact"
              onClick={(e) => navigateTo(e, 'contact-section')}
              className="text-gray-500 hover:text-[#4ECDC4] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#4ECDC4] after:transition-all hover:after:w-full"
            >
              Contact
            </a>
          </nav>

          {/* Call to action "Book Now" */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-xs font-mono text-[#6B7280] hover:text-[#4ECDC4] transition-colors px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded"
              title="Click or press Ctrl+Shift+A"
            >
              Portal Login
            </button>
            <a
              href="#book"
              onClick={(e) => navigateTo(e, 'contact-section')}
              className="bg-[#4ECDC4] hover:bg-[#38B2AC] hover:scale-[1.02] active:scale-[0.99] text-[#1A1A2E] text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-transform cursor-pointer ripple-container text-center"
            >
              Book Now
            </a>
          </div>

          {/* Mobile hamburger button trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-[#4ECDC4] p-1 border border-gray-100 rounded bg-gray-50"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu panel overlay drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-150 absolute top-[77px] left-0 right-0 py-6 px-6 shadow-xl flex flex-col gap-4 animate-fadeIn">
            <a
              href="#services"
              onClick={(e) => navigateTo(e, 'services-grid')}
              className="text-gray-700 hover:text-[#4ECDC4] font-medium text-lg py-2 border-b border-gray-50"
            >
              Services
            </a>
            <a
              href="#about"
              onClick={(e) => navigateTo(e, 'how-it-works')}
              className="text-gray-700 hover:text-[#4ECDC4] font-medium text-lg py-2 border-b border-gray-50"
            >
              How it Works
            </a>
            <a
              href="#pricing"
              onClick={(e) => navigateTo(e, 'pricing-plans')}
              className="text-gray-700 hover:text-[#4ECDC4] font-medium text-lg py-2 border-b border-gray-50"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              onClick={(e) => navigateTo(e, 'testimonials-section')}
              className="text-gray-700 hover:text-[#4ECDC4] font-medium text-lg py-2 border-b border-gray-50"
            >
              Reviews
            </a>
            <a
              href="#contact"
              onClick={(e) => navigateTo(e, 'contact-section')}
              className="text-gray-700 hover:text-[#4ECDC4] font-medium text-lg py-2"
            >
              Contact Booking
            </a>
            <div className="pt-4 flex flex-col gap-3">
              <a
                href="#book"
                onClick={(e) => navigateTo(e, 'contact-section')}
                className="w-full bg-[#4ECDC4] hover:bg-[#38B2AC] text-[#1A1A2E] text-center font-bold py-3 rounded-lg"
              >
                Book Now
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAdminOpen(true);
                }}
                className="w-full bg-gray-150 text-[#1A1A2E] hover:bg-gray-200 text-center font-bold py-3 rounded-lg text-xs font-mono"
              >
                Admin Panel Login
              </button>
            </div>
          </div>
        )}
      </header>

      {/* spacer for header */}
      <div id="hero-top" className="h-[76px]"></div>

      {/* 2. HERO SECTION */}
      <section className="relative w-full bg-[#FFFFFF] py-20 md:py-32 overflow-hidden border-b border-gray-100 flex items-center justify-center min-h-[85vh]">
        
        {/* Slow, ambient bubbles rising backgound */}
        <BubblesBg />

        <div className="w-full max-w-7xl mx-auto px-6 md:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-8 select-none">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 bg-[#EEF9F8] text-[#4ECDC4] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full px-4 py-1.5 mb-2 border border-[#4ECDC4]/10">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Premium Cleaning Solutions</span>
            </div>

            {/* Headline with elegant editorial serif typography */}
            <h1 className="font-serif text-5xl md:text-[64px] text-[#1A1A2E] leading-[1.1] mb-6 tracking-tight max-w-xl">
              Your Space, <br />
              <span className="text-[#4ECDC4] relative inline-block">
                Perfectly Clean
                <span className="absolute bottom-2 left-0 w-full h-[3px] bg-[#EEF9F8]"></span>
              </span>
              .
            </h1>

            {/* Sub-headline */}
            <p className="text-gray-500 font-sans text-lg md:text-xl max-w-lg leading-relaxed">
              Professional commercial and residential cleaning configured for wellness, pristine air, and zero stressful clutter.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a
                href="#book"
                onClick={(e) => navigateTo(e, 'contact-section')}
                className="bg-[#4ECDC4] hover:bg-[#38B2AC] text-[#1A1A2E] text-sm font-semibold px-8 py-4 rounded-xl text-center shadow-lg shadow-teal-500/10 hover:shadow-teal-500/15 hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer ripple-container"
              >
                Book a Clean
              </a>
              <a
                href="#services"
                onClick={(e) => navigateTo(e, 'services-grid')}
                className="border-2 border-gray-250 hover:border-gray-400 hover:bg-gray-50 text-[#1A1A2E] text-sm font-semibold px-8 py-3.5 rounded-xl text-center transition-all cursor-pointer ripple-container"
              >
                View Services
              </a>
            </div>

            {/* Trust badges row */}
            <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center gap-6 text-sm text-[#1A1A2E] font-medium">
              <span className="flex items-center gap-1.5 bg-gray-50 py-1.5 px-3 rounded-lg border border-gray-100 shadow-3xs">
                <span className="text-amber-400 text-base">⭐</span> 4.9 Avg Rating
              </span>
              <span className="flex items-center gap-1.5 bg-gray-50 py-1.5 px-3 rounded-lg border border-gray-100 shadow-3xs">
                <Check className="w-4 h-4 text-[#4ECDC4]" /> 500+ Happy Clients
              </span>
              <span className="flex items-center gap-1.5 bg-gray-50 py-1.5 px-3 rounded-lg border border-gray-100 shadow-3xs">
                <Clock className="w-4 h-4 text-[#4ECDC4]" /> Same-Day Booking
              </span>
            </div>
          </div>

          {/* Right Hero Graphic block */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-[#4ECDC4]/10 rounded-[2rem] blur-3xl transform rotate-3 scale-95 pointer-events-none"></div>
            
            {/* Visual element representing sterile/clean space without heavy stock images */}
            <div className="relative bg-white border border-gray-100 rounded-[2rem] p-8 md:p-10 shadow-2xl space-y-8 select-none">
              
              {/* Daily Clean Tracker Mock UI */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-xl font-medium tracking-tight text-[#1A1A2E]">Today's Clean Status</h4>
                  <p className="text-xs text-gray-400 mt-0.5">PureSpace Premium Care Dispatch</p>
                </div>
                <span className="bg-[#4ECDC4]/15 text-[#38B2AC] text-[11px] font-bold px-2 py-1 rounded font-mono uppercase tracking-wider">
                  Active Area
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[#F8F9FA] p-4 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold text-lg">
                    ✓
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-mono uppercase text-gray-400 font-bold tracking-wide">Living Lounge Area</p>
                    <p className="text-sm font-semibold text-gray-700">HEPA vacuum & dusting finalized</p>
                  </div>
                  <span className="text-xs text-[#4ECDC4] font-medium font-mono">10:45 AM</span>
                </div>

                <div className="flex items-center gap-4 bg-[#F8F9FA] p-4 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold text-lg">
                    ✓
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-mono uppercase text-gray-400 font-bold tracking-wide">Microbial Sanitization</p>
                    <p className="text-sm font-semibold text-gray-700">Eco friendly sanitation check</p>
                  </div>
                  <span className="text-xs text-[#4ECDC4] font-medium font-mono">11:20 AM</span>
                </div>

                <div className="flex items-center gap-4 bg-[#F8F9FA] p-4 rounded-xl border border-gray-100 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-base">
                    ✦
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-mono uppercase text-[#4ECDC4] font-bold tracking-wide">Air Filtration Loop</p>
                    <p className="text-sm font-semibold text-gray-700">PureAir Aromatherapy spray...</p>
                  </div>
                  <span className="text-xs text-amber-500 font-medium font-mono">In Progress</span>
                </div>
              </div>

              {/* Bottom Quote indicator */}
              <div className="bg-[#EEF9F8] border border-dashed border-[#4ECDC4]/20 p-4 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4ECDC4]/20 text-[#1A1A2E] flex items-center justify-center font-semibold text-xs shrink-0">
                  ★
                </div>
                <p className="text-xs font-medium text-[#1A1A2E]/80">
                  "The most pristine, zero-residue clean I've ever experienced."
                </p>
              </div>

              {/* Decorative circle details */}
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-[#4ECDC4]/20 rounded-full blur-xl"></div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-teal-100/30 rounded-full blur-lg"></div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SERVICES SECTION */}
      <section className="py-24 md:py-32 w-full bg-[#F8F9FA]" id="services-grid">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
          
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#4ECDC4] font-bold bg-[#EEF9F8] py-1.5 px-3.5 rounded-full">
              What we offer
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A2E] font-medium">
              Pure Service. Perfect Execution.
            </h2>
            <p className="text-gray-500 text-base leading-relaxed">
              We focus on premium, detailed methods using eco-friendly solutions to sterilize, reorganize, and bring comfort back to your architecture.
            </p>
          </ScrollReveal>

          {/* 3-column card grid mapping from services list state */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services
              .filter((service) => service.visible)
              .map((service, index) => (
                <ScrollReveal key={service.id}>
                  <div
                    className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-full group"
                  >
                    <div>
                      {/* Icon container */}
                      <div className="w-14 h-14 rounded-xl bg-[#EEF9F8] text-[#4ECDC4] flex items-center justify-center text-3xl mb-6 shadow-2xs group-hover:bg-[#4ECDC4] group-hover:text-white transition-colors duration-300">
                        {service.icon}
                      </div>

                      {/* Header */}
                      <h3 className="font-serif text-2xl text-[#1A1A2E] font-semibold mb-3 group-hover:text-[#4ECDC4] transition-colors">
                        {service.name}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        {service.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-auto">
                      <span className="font-mono text-sm text-gray-500">
                        Starting from <span className="text-[#1A1A2E] font-bold font-sans text-base">${service.basePrice}</span>
                      </span>
                      
                      <a
                        href="#book"
                        onClick={(e) => navigateTo(e, 'contact-section')}
                        className="text-xs font-bold text-[#4ECDC4] group-hover:text-[#38B2AC] flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>Book Plan</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
          </div>

        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="py-24 md:py-32 w-full bg-white relative overflow-hidden" id="how-it-works">
        {/* Subtle geometric grid background details */}
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#1A1A2E_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
          
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#4ECDC4] font-bold">
              Simple Workflow
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A2E] font-medium">
              Three Steps to absolute Pristine
            </h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              We've refined dry cleaning procedures to be completely hands-off. Secure booking takes 60 seconds.
            </p>
          </ScrollReveal>

          {/* Horizontal layout steps */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            
            {/* Connecting dashed line behind (md screens only) */}
            <div className="hidden md:block absolute top-14 left-[15%] right-[15%] h-0.5 border-t border-dashed border-gray-200 z-0"></div>

            {/* Step 1 */}
            <ScrollReveal className="relative z-10 flex flex-col items-center text-center space-y-4 group">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-[#4ECDC4] text-[#1A1A2E] flex items-center justify-center font-serif text-2xl font-bold font-mono shadow-md group-hover:bg-[#4ECDC4] group-hover:text-white transition-all duration-300">
                1
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#1A1A2E]">Book Online</h3>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                Pick an active cleaning routine, select your preferred date, and submit with zero deposit requirements.
              </p>
            </ScrollReveal>

            {/* Step 2 */}
            <ScrollReveal className="relative z-10 flex flex-col items-center text-center space-y-4 group">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-[#4ECDC4] text-[#1A1A2E] flex items-center justify-center font-serif text-2xl font-bold font-mono shadow-md group-hover:bg-[#4ECDC4] group-hover:text-white transition-all duration-300">
                2
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#1A1A2E]">We Clean</h3>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                Our highly-vetted team arrives with cutting-edge HEPA micro-filters & certified non-toxic clean formulas.
              </p>
            </ScrollReveal>

            {/* Step 3 */}
            <ScrollReveal className="relative z-10 flex flex-col items-center text-center space-y-4 group">
              <div className="w-16 h-16 rounded-full bg-white border-2 border-[#4ECDC4] text-[#1A1A2E] flex items-center justify-center font-serif text-2xl font-bold font-mono shadow-md group-hover:bg-[#4ECDC4] group-hover:text-white transition-all duration-300">
                3
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#1A1A2E]">You Relax</h3>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                Walk into a wonderfully aromatic, safe-to-breathe, spotless environment. 100% Quality Assurance.
              </p>
            </ScrollReveal>

          </div>

        </div>
      </section>

      {/* 5. STATS ROW - POLISHED MOOD CONTAINER */}
      <section className="w-full bg-white pb-24 select-none" id="stats-banner">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
          <div className="bg-[#1A1A2E] text-white py-12 px-8 rounded-[2rem] shadow-xl relative overflow-hidden grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y divide-gray-800 lg:divide-y-0 lg:divide-x lg:divide-gray-800/60 border border-gray-850">
            {/* Subtle light effect on the banner */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4ECDC4]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col items-center text-center p-2 justify-center">
              <span className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#4ECDC4]">
                <AnimatedCounter end={500} suffix="+" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-gray-400 mt-3">
                Happy Clients
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-2 pt-6 lg:pt-2 justify-center">
              <span className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#4ECDC4]">
                <AnimatedCounter end={3000} suffix="+" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-gray-400 mt-3">
                Cleans Done
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-2 pt-6 lg:pt-2 justify-center">
              <span className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#4ECDC4]">
                <AnimatedCounter end={4.9} decimals={1} suffix="★" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-gray-400 mt-3">
                Avg Rating
              </span>
            </div>

            <div className="flex flex-col items-center text-center p-2 pt-6 lg:pt-2 justify-center">
              <span className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#4ECDC4]">
                <AnimatedCounter end={2} suffix="hr" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-gray-400 mt-3">
                Response Time
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section className="py-24 md:py-32 w-full bg-[#F8F9FA]" id="pricing-plans">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
          
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#4ECDC4] font-bold bg-[#EEF9F8] py-1.5 px-3.5 rounded-full">
              Transparent Pricing
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A2E] font-medium">
              Simple flat pricing for any space size
            </h2>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              No hidden fees, no complex calculations. Pick an honest baseline plan and scale up as you demand.
            </p>
          </ScrollReveal>

          {/* Pricing cards grid mapping pricing plans from state */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {pricingPlans.map((plan) => (
              <ScrollReveal key={plan.id} className="flex">
                <div
                  className={`w-full bg-white rounded-2xl p-8 border transition-all duration-300 relative flex flex-col justify-between ${
                    plan.popular
                      ? 'border-[#4ECDC4] popular-glow scale-[1.03] shadow-md z-10'
                      : 'border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3.5 left-6 bg-[#4ECDC4] text-[#1A1A2E] text-[10px] uppercase font-bold tracking-widest px-4 py-1 rounded-full shadow-sm">
                      Most Popular
                    </span>
                  )}

                  <div>
                    {/* Header */}
                    <div className="mb-6">
                      <h3 className="font-serif text-2xl text-[#1A1A2E] font-medium capitalize">{plan.name} Plan</h3>
                      <p className="text-gray-500 text-xs mt-1 italic leading-relaxed min-h-[32px]">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 flex items-baseline gap-1.5 border-b border-gray-100 pb-6">
                      <span className="text-4xl font-serif font-semibold text-[#1A1A2E]">${plan.price}</span>
                      <span className="text-xs text-gray-400 font-mono">/ visit check</span>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-3.5 mb-8 text-sm text-[#1A1A2E]/90">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-[#4ECDC4] shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Booking Link */}
                  <a
                    href="#book"
                    onClick={(e) => {
                      navigateTo(e, 'contact-section');
                    }}
                    className={`w-full text-center py-3.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      plan.popular
                        ? 'bg-[#4ECDC4] hover:bg-[#38B2AC] text-[#1A1A2E] shadow-sm'
                        : 'bg-[#1A1A2E] hover:bg-[#252542] text-white shadow-sm'
                    }`}
                  >
                    Book This Plan
                  </a>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION */}
      <section className="py-24 md:py-32 w-full bg-white" id="testimonials-section">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8">
          
          <ScrollReveal className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#4ECDC4] font-bold">
              Testimonials
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A2E] font-medium">
              Loved by local residents & offices
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Read transparent feedback from households and commercial operations who rely on our immaculate cleaning team.
            </p>
          </ScrollReveal>

          {/* 3 cards with star rating, client name, avatar initial circle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <ScrollReveal>
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-8 shadow-2xs hover:shadow-md transition-all h-full flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-gray-600 text-sm italic leading-relaxed">
                    &ldquo;PureSpace has completely revolutionized our weekly maintenance. The teams are meticulously clean, punctual, and use products that leave my home smelling amazing instead of like harsh bleach.&rdquo;
                  </p>
                </div>

                {/* Profile */}
                <div className="flex items-center gap-3 pt-6 border-t border-gray-150/40 mt-6">
                  <div className="w-10 h-10 rounded-full bg-[#4ECDC4]/15 text-[#1A1A2E] font-bold flex items-center justify-center text-sm shrink-0">
                    MF
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-gray-900 text-sm">Madelyn Fletcher</h4>
                    <p className="text-[11px] text-gray-500 font-mono">Verified Flat Owner</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2 */}
            <ScrollReveal>
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-8 shadow-2xs hover:shadow-md transition-all h-full flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-gray-600 text-sm italic leading-relaxed">
                    &ldquo;As a startup with clients visiting constantly, office hygiene is non-negotiable. PureSpace keeps our corporate co-working floor immaculately sterile and well-ordered, allowing us to focus on production.&rdquo;
                  </p>
                </div>

                {/* Profile */}
                <div className="flex items-center gap-3 pt-6 border-t border-gray-150/40 mt-6">
                  <div className="w-10 h-10 rounded-full bg-[#4ECDC4]/15 text-[#1A1A2E] font-bold flex items-center justify-center text-sm shrink-0">
                    DV
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-gray-900 text-sm">David Vance</h4>
                    <p className="text-[11px] text-gray-500 font-mono">CTO, Sterling Startup Hub</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 3 */}
            <ScrollReveal>
              <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-8 shadow-2xs hover:shadow-md transition-all h-full flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-gray-600 text-sm italic leading-relaxed">
                    &ldquo;I booked their Deep Clean service for my move-out inspection, and the landlord was so impressed we returned the key with zero issues. Truly premium standard of clean.&rdquo;
                  </p>
                </div>

                {/* Profile */}
                <div className="flex items-center gap-3 pt-6 border-t border-gray-150/40 mt-6">
                  <div className="w-10 h-10 rounded-full bg-[#4ECDC4]/15 text-[#1A1A2E] font-bold flex items-center justify-center text-sm shrink-0">
                    SR
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-gray-900 text-sm">Sienna Rodriguez</h4>
                    <p className="text-[11px] text-gray-500 font-mono">Residential Tenant</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

          </div>

        </div>
      </section>

      {/* 8. CONTACT / BOOKING COLUMN SECTION */}
      <section className="py-24 md:py-32 bg-[#EEF9F8]/50 w-full border-t border-b border-gray-100" id="contact-section">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <ScrollReveal className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#4ECDC4] font-bold">
              Secure Appointment
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A2E] font-medium leading-[1.1]">
              Ready to schedule? Book in under 60 seconds
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Fill out the form with your desired date and preferred cleaning plan. No up-front payments required – pay only after a thoroughly satisfactory service.
            </p>

            <div className="space-y-4 pt-4 text-sm font-sans">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-[#4ECDC4] flex items-center justify-center shadow-xs">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Direct Care Hotline</p>
                  <p className="text-gray-500 text-xs">+1 (800) PURE-SPACE</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-[#4ECDC4] flex items-center justify-center shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">General Support Email</p>
                  <p className="text-gray-500 text-xs">care@purespacecleaning.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-[#4ECDC4] flex items-center justify-center shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Headquarters</p>
                  <p className="text-gray-500 text-xs">300 Pine Street, Suit 200, Seattle WA</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-[#4ECDC4] flex items-center justify-center shadow-xs">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Direct Chat & Socials</p>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <a
                      href="https://wa.me/18007873253?text=Hello%20PureSpace%2C%20I%20would%20like%20to%20inquire%20about%20a%20cleaning%20booking."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-all text-xs font-medium flex items-center gap-1"
                    >
                      WhatsApp
                    </a>
                    <a
                      href="https://www.instagram.com/purespace"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C]/20 transition-all text-xs font-medium flex items-center gap-1"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://www.facebook.com/purespace"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-all text-xs font-medium flex items-center gap-1"
                    >
                      Facebook
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Form col */}
          <ScrollReveal className="lg:col-span-7">
            <BookingForm
              services={services}
              onAddBooking={handleAddNewBooking}
              triggerRipple={triggerRipple}
            />
          </ScrollReveal>

        </div>
      </section>

      {/* 9. FOOTER LAYER */}
      <footer className="bg-[#1A1A2E] text-gray-400 py-16 w-full border-t border-gray-800">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-gray-800">
          
          {/* Logo & Tagline column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-[#4ECDC4] border border-[#4ECDC4]/20 flex items-center justify-center font-serif font-bold text-base">
                P
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                PureSpace<span className="text-[#4ECDC4]">.</span>
              </span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed text-gray-450">
              Transforming standard residential and corporate environments into sparkling sterile sanctuaries across the country.
            </p>
            {/* Social media icons links */}
            <div className="flex gap-3 pt-2 text-white">
              <a
                href="https://www.instagram.com/purespace"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => triggerRipple(e)}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#E1306C] hover:text-white flex items-center justify-center transition-all text-sm group"
                title="Instagram"
              >
                <Instagram className="w-4 h-4 transition-transform group-hover:scale-115" />
              </a>
              <a
                href="https://www.facebook.com/purespace"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => triggerRipple(e)}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#1877F2] hover:text-white flex items-center justify-center transition-all text-sm group"
                title="Facebook"
              >
                <Facebook className="w-4 h-4 transition-transform group-hover:scale-115" />
              </a>
              <a
                href="https://wa.me/18007873253?text=Hello%20PureSpace%2C%20I%20would%20like%20to%20inquire%20about%20a%20cleaning%20booking."
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => triggerRipple(e)}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-all text-sm group"
                title="WhatsApp Support"
              >
                <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-115" />
              </a>
            </div>
          </div>

          {/* Quick links columns */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif text-white font-medium text-base">Site Map</h4>
            <ul className="text-sm space-y-2.5">
              <li>
                <a href="#services" onClick={(e) => navigateTo(e, 'services-grid')} className="hover:text-white transition-colors">
                  Services List
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => navigateTo(e, 'how-it-works')} className="hover:text-white transition-colors">
                  Our Method
                </a>
              </li>
              <li>
                <a href="#pricing" onClick={(e) => navigateTo(e, 'pricing-plans')} className="hover:text-white transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#testimonials" onClick={(e) => navigateTo(e, 'testimonials-section')} className="hover:text-white transition-colors">
                  Client Reviews
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="font-serif text-white font-medium text-base">Legal & Trust</h4>
            <ul className="text-sm space-y-2.5">
              <li className="flex items-center gap-1.5 text-xs text-emerald-400">
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                <span>Fully Insured & Bonded to $2M</span>
              </li>
              <li className="flex items-center gap-1.5 text-xs text-emerald-400">
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                <span>HEPA & EcoCert Compliant</span>
              </li>
              <li className="text-xs pt-1">
                Privacy Policy · Terms of Clean Care · Rescheduling Policies
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright strip & admin portal trigger link */}
        <div className="w-full max-w-7xl mx-auto px-6 md:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono space-y-4 sm:space-y-0 text-gray-550">
          <div>
            &copy; {new Date().getFullYear()} PureSpace Cleaning LLC. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-gray-600 hidden md:inline">
              Shortcut: <kbd className="bg-gray-800 text-[#4ECDC4] px-1 py-0.5 rounded font-bold font-mono">Ctrl</kbd> + <kbd className="bg-gray-800 text-[#4ECDC4] px-1 py-0.5 rounded font-bold font-mono">Shift</kbd> + <kbd className="bg-gray-800 text-[#4ECDC4] px-1 py-0.5 rounded font-bold font-mono">A</kbd>
            </span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-[#4ECDC4] hover:text-[#38B2AC] hover:underline"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Embedded Admin Portal overlay dashboard drawer */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        bookings={bookings}
        setBookings={setBookings}
        services={services}
        setServices={setServices}
        pricingPlans={pricingPlans}
        setPricingPlans={setPricingPlans}
        messages={messages}
        setMessages={setMessages}
        triggerRipple={triggerRipple}
      />

      {/* 10. FLOATING SOCIAL CONNECTS */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3 pointer-events-none md:bottom-8 md:right-8">
        {/* Tooltip or small promo badge */}
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-gray-100 text-[11px] font-semibold text-gray-700 flex items-center gap-2 pointer-events-auto select-none transition-all hover:scale-105 active:scale-95">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Instant Assistance</span>
        </div>
        
        <div className="flex gap-2.5 bg-white/90 backdrop-blur-md p-2 rounded-[1.2rem] shadow-2xl border border-gray-100/80 pointer-events-auto">
          <a
            href="https://wa.me/18007873253?text=Hello%20PureSpace%2C%20I%20would%20like%20to%20inquire%20about%20a%20cleaning%20booking."
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-5 h-5 fill-white/10" />
          </a>
          <a
            href="https://www.instagram.com/purespace"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md shadow-pink-500/10 hover:shadow-pink-500/20"
            title="Follow on Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="https://www.facebook.com/purespace"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
            title="Visit Facebook Page"
          >
            <Facebook className="w-5 h-5 fill-white/15" />
          </a>
        </div>
      </div>

      {/* LEFT SIDE AI CHAT BOT */}
      <AIChatBot />

    </div>
  );
}
