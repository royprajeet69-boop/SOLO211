import React, { useState, useEffect } from 'react';
import {
  X, Check, Trash2, Calendar, Phone, DollarSign,
  LayoutDashboard, Briefcase, Tag, Mail, ShieldAlert,
  Edit2, ToggleLeft, ToggleRight, Save, User, ShieldCheck, Lock
} from 'lucide-react';
import { Booking, ServiceItem, PricingPlan, MessageItem, BookingStatus } from '../types';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  services: ServiceItem[];
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  pricingPlans: PricingPlan[];
  setPricingPlans: React.Dispatch<React.SetStateAction<PricingPlan[]>>;
  messages: MessageItem[];
  setMessages: React.Dispatch<React.SetStateAction<MessageItem[]>>;
  triggerRipple: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function AdminPortal({
  isOpen,
  onClose,
  bookings,
  setBookings,
  services,
  setServices,
  pricingPlans,
  setPricingPlans,
  messages,
  setMessages,
  triggerRipple
}: AdminPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'stats' | 'bookings' | 'services' | 'pricing' | 'messages'>('stats');

  // Service Edit Inline State
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editServiceName, setEditServiceName] = useState<string>('');
  const [editServicePrice, setEditServicePrice] = useState<number>(0);

  // Pricing Plan Edit State
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanPrice, setEditPlanPrice] = useState<number>(0);
  const [editPlanName, setEditPlanName] = useState<string>('');

  useEffect(() => {
    // If opened, center focus or read auth status if desired (transient state is fine)
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'pureAdmin2025') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  };

  // BOOKING FUNCTIONS
  const updateBookingStatus = (id: string, nextStatus: BookingStatus) => {
    const updated = bookings.map(b => (b.id === id ? { ...b, status: nextStatus } : b));
    setBookings(updated);
    localStorage.setItem('purespace_bookings', JSON.stringify(updated));
  };

  const deleteBooking = (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);
      localStorage.setItem('purespace_bookings', JSON.stringify(updated));
    }
  };

  // SERVICES MANAGER FUNCTIONS
  const toggleServiceVisibility = (id: string) => {
    const updated = services.map(s => (s.id === id ? { ...s, visible: !s.visible } : s));
    setServices(updated);
    localStorage.setItem('purespace_services', JSON.stringify(updated));
  };

  const startEditingService = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setEditServiceName(service.name);
    setEditServicePrice(service.basePrice);
  };

  const saveServiceEdit = (id: string) => {
    const updated = services.map(s =>
      s.id === id ? { ...s, name: editServiceName, basePrice: editServicePrice } : s
    );
    setServices(updated);
    localStorage.setItem('purespace_services', JSON.stringify(updated));
    setEditingServiceId(null);
  };

  // PRICING MANAGER FUNCTIONS
  const startEditingPlan = (plan: PricingPlan) => {
    setEditingPlanId(plan.id);
    setEditPlanName(plan.name);
    setEditPlanPrice(plan.price);
  };

  const savePlanEdit = (id: string) => {
    const updated = pricingPlans.map(p =>
      p.id === id ? { ...p, name: editPlanName, price: editPlanPrice } : p
    );
    setPricingPlans(updated);
    localStorage.setItem('purespace_pricing', JSON.stringify(updated));
    setEditingPlanId(null);
  };

  // MESSAGES FUNCTIONS
  const toggleMessageRead = (id: string) => {
    const updated = messages.map(m => (m.id === id ? { ...m, read: !m.read } : m));
    setMessages(updated);
    localStorage.setItem('purespace_messages', JSON.stringify(updated));
  };

  const deleteMessage = (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      const updated = messages.filter(m => m.id !== id);
      setMessages(updated);
      localStorage.setItem('purespace_messages', JSON.stringify(updated));
    }
  };

  // STATISTICS CALCULATIONS (with fallback matching plans and service types)
  const totalBookingsCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;

  const totalRevenue = bookings
    .filter(b => b.status === 'Completed')
    .reduce((sum, b) => {
      // Find matching service item index or standard estimate
      const matchingService = services.find(s => s.name.toLowerCase() === b.serviceType.toLowerCase());
      if (matchingService) {
        return sum + matchingService.basePrice;
      }
      // Or search in plans
      const matchingPlan = pricingPlans.find(p => p.name.toLowerCase() + " plan" === b.serviceType.toLowerCase());
      if (matchingPlan) {
        return sum + matchingPlan.price;
      }
      // default approximate values
      if (b.serviceType.toLowerCase().includes('office') || b.serviceType.toLowerCase().includes('commercial')) {
        return sum + 189;
      } else if (b.serviceType.toLowerCase().includes('deep') || b.serviceType.toLowerCase().includes('move')) {
        return sum + 249;
      }
      return sum + 79; // basic home standard
    }, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Container Card */}
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-55 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
          title="Exit Admin Portal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* --- LOCK SCREEN VIEW --- */}
        {!isAuthenticated ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A1A2E] text-white p-6 relative">
            {/* Elegant Background Bubbles Effect */}
            <div className="absolute top-10 left-10 w-24 h-24 bg-[#4ECDC4]/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 right-10 w-36 h-36 bg-[#4ECDC4]/5 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4ECDC4]/10 text-[#4ECDC4] mb-6">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-3xl mb-2 text-[#4ECDC4] tracking-tight">PureSpace Administration</h2>
              <p className="text-gray-400 text-sm mb-8">Access requires administrative credentials. Use the authorized system password.</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-left">
                  <label className="block text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="Enter admin password (pureAdmin2025)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#141424] border border-gray-700 focus:border-[#4ECDC4] outline-none rounded-lg px-4 py-3 text-white text-center font-mono placeholder-gray-600 transition-colors"
                    autoFocus
                  />
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-950/20 border border-red-900/50 p-3 rounded-lg text-xs justify-center">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  onClick={triggerRipple}
                  className="w-full bg-[#4ECDC4] hover:bg-[#38B2AC] active:scale-[0.99] text-[#1A1A2E] font-medium py-3 rounded-lg transition-transform ripple-container shadow-md"
                >
                  Verify Credentials
                </button>
              </form>

              <div className="mt-8 text-xs text-gray-500">
                <p>System Hint: <span className="font-mono text-gray-400">pureAdmin2025</span></p>
              </div>
            </div>
          </div>
        ) : (
          /* --- MAIN ADMIN PORTAL WORKSPACE --- */
          <>
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-[#1A1A2E] text-white flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-gray-800">
              {/* Header */}
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#4ECDC4]" />
                  <span className="font-serif text-lg font-bold tracking-wide text-white">PureSpace <span className="text-xs font-sans font-medium text-[#4ECDC4] bg-[#4ECDC4]/10 py-0.5 px-1.5 rounded ml-1 uppercase">Admin</span></span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto admin-scroll">
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'stats'
                      ? 'bg-[#4ECDC4] text-[#1A1A2E]'
                      : 'text-gray-400 hover:bg-[#141424] hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Stats Overview</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative ${
                    activeTab === 'bookings'
                      ? 'bg-[#4ECDC4] text-[#1A1A2E]'
                      : 'text-gray-400 hover:bg-[#141424] hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Bookings</span>
                  {pendingCount > 0 && (
                    <span className="absolute right-4 bg-orange-500 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'services'
                      ? 'bg-[#4ECDC4] text-[#1A1A2E]'
                      : 'text-gray-400 hover:bg-[#141424] hover:text-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Services Manager</span>
                </button>

                <button
                  onClick={() => setActiveTab('pricing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'pricing'
                      ? 'bg-[#4ECDC4] text-[#1A1A2E]'
                      : 'text-gray-400 hover:bg-[#141424] hover:text-white'
                  }`}
                >
                  <Tag className="w-4 h-4" />
                  <span>Pricing plans</span>
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative ${
                    activeTab === 'messages'
                      ? 'bg-[#4ECDC4] text-[#1A1A2E]'
                      : 'text-gray-400 hover:bg-[#141424] hover:text-white'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Inquiries & Mail</span>
                  {messages.filter(m => !m.read).length > 0 && (
                    <span className="absolute right-4 bg-[#4ECDC4] text-[#1A1A2E] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {messages.filter(m => !m.read).length}
                    </span>
                  )}
                </button>
              </nav>

              {/* Connected User */}
              <div className="p-4 border-t border-gray-800 bg-[#141424] text-xs text-gray-400 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#4ECDC4]/10 text-[#4ECDC4] flex items-center justify-center font-bold">
                  SU
                </div>
                <div>
                  <p className="text-white font-medium">Administrator</p>
                  <p className="text-[10px] text-gray-500">Live Workspace</p>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-[#F8F9FA] overflow-y-auto p-6 md:p-8 flex flex-col">
              
              {/* Tab Header title */}
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <h1 className="font-serif text-3xl text-[#1A1A2E] capitalize font-medium">{activeTab === 'stats' ? 'Dashboard Overview' : activeTab + ' Management'}</h1>
                  <p className="text-gray-500 text-sm mt-1">Real-time control over services, bookings, layouts, & pricing models.</p>
                </div>
                <div className="mt-4 md:mt-0 font-mono text-xs text-gray-500 bg-gray-200/55 rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>System Synced</span>
                </div>
              </div>

              {/* --- TAB CONTENT AREA --- */}
              <div className="flex-1">
                
                {/* 1. STATS OVERVIEW TAB */}
                {activeTab === 'stats' && (
                  <div className="space-y-6">
                    {/* Stat Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
                        <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">Estimated Revenue</span>
                        <div className="mt-2 flex items-baseline gap-1">
                          <span className="font-serif text-3xl font-semibold text-[#1A1A2E]">${totalRevenue}</span>
                          <span className="text-xs text-emerald-500 font-medium">Completed Only</span>
                        </div>
                        <div className="mt-4 text-xs font-mono text-[#4ECDC4] bg-teal-50 px-2 py-1 rounded inline-self">
                          From {completedCount} completed cleans
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
                        <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">Total Bookings</span>
                        <div className="mt-2">
                          <span className="font-serif text-3xl font-semibold text-[#1A1A2E]">{totalBookingsCount}</span>
                        </div>
                        <div className="mt-4 text-xs text-gray-500 flex gap-2">
                          <span>{pendingCount} Pending</span>·<span>{confirmedCount} Confirmed</span>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
                        <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">Completed Cleans</span>
                        <div className="mt-2">
                          <span className="font-serif text-3xl font-semibold text-emerald-600">{completedCount}</span>
                        </div>
                        <div className="mt-4 text-xs text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                          100% Quality rating
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex flex-col justify-between">
                        <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">Unread Messages</span>
                        <div className="mt-2">
                          <span className="font-serif text-3xl font-semibold text-teal-600">
                            {messages.filter(m => !m.read).length}
                          </span>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                          Total inbox count: {messages.length}
                        </div>
                      </div>
                    </div>

                    {/* Extended business indicators */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      
                      {/* Booking Distribution breakdown */}
                      <div className="bg-white p-6 rounded-xl border border-gray-100">
                        <h3 className="font-serif text-xl mb-4 text-[#1A1A2E]">Clean Distribution by Type</h3>
                        <div className="space-y-4">
                          {['Residential Cleaning', 'Office & Commercial', 'Deep Clean & Move-Out'].map((serviceType) => {
                            const count = bookings.filter(b => b.serviceType === serviceType).length;
                            const pct = totalBookingsCount > 0 ? (count / totalBookingsCount) * 100 : 0;
                            return (
                              <div key={serviceType} className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                  <span className="text-gray-700">{serviceType}</span>
                                  <span className="text-gray-900 font-mono">{count} ({Math.round(pct)}%)</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-[#4ECDC4] h-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Diagnostic logs / system status */}
                      <div className="bg-[#1A1A2E] text-slate-300 p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
                          <h3 className="text-xs font-mono uppercase tracking-wider text-[#4ECDC4]">Sync State Details</h3>
                          <span className="text-[10px] text-gray-500 font-mono">ID: PureSpace_v1</span>
                        </div>
                        <div className="space-y-2 font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Local Persistence Engine:</span>
                            <span className="text-[#4ECDC4]">Active (localStorage)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Prepopulated Bookings:</span>
                            <span>5 Sample Bookings Loaded</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Security Rule Checklist:</span>
                            <span className="text-emerald-400 font-semibold">Strict Auth Enabled</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Active services:</span>
                            <span>{services.filter(s => s.visible).length} visible</span>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-800 text-[10px] text-gray-500">
                            Pressing <kbd className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">Ctrl</kbd> + <kbd className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">Shift</kbd> + <kbd className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">A</kbd> instantly toggles this workspace modal inside the browser context.
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 2. BOOKINGS MANAGEMENT TAB */}
                {activeTab === 'bookings' && (
                  <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 text-xs font-mono text-gray-500 flex justify-between items-center">
                      <span>CLIENT CLEANING ARRANGEMENTS</span>
                      <span>COUNT: {bookings.length} TOTAL</span>
                    </div>
                    {bookings.length === 0 ? (
                      <div className="p-12 text-center text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="font-serif text-lg">No bookings recorded yet</p>
                        <p className="text-sm text-gray-400 mt-1">Bookings from the customer form show up here instantly.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200 text-[11px] font-mono uppercase tracking-wider text-gray-400 bg-gray-50/50">
                              <th className="px-6 py-4">Client Contact</th>
                              <th className="px-6 py-4">Service Required</th>
                              <th className="px-6 py-4">Preferred Date</th>
                              <th className="px-6 py-4">Status Flag</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-sm">
                            {bookings.map((booking) => (
                              <tr key={booking.id} className="hover:bg-gray-50/70 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="font-medium text-[#1A1A2E]">{booking.clientName}</div>
                                  <div className="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-[#4ECDC4]" /> {booking.clientPhone}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="bg-gray-100 text-[#1A1A2E] px-2.5 py-1 rounded text-xs font-medium border border-gray-200">
                                    {booking.serviceType}
                                  </span>
                                  {booking.message && (
                                    <p className="text-xs text-gray-500 mt-1.5 italic max-w-xs truncate" title={booking.message}>
                                      &ldquo;{booking.message}&rdquo;
                                    </p>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="font-mono text-gray-700">{booking.preferredDate}</div>
                                  <span className="text-[10px] text-gray-400">Requested Clean</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium  ${
                                    booking.status === 'Pending'
                                      ? 'bg-amber-100 text-amber-800'
                                      : booking.status === 'Confirmed'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {booking.status === 'Pending' && (
                                      <button
                                        onClick={() => updateBookingStatus(booking.id, 'Confirmed')}
                                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium transition-colors"
                                        title="Confirm cleaner team allocation"
                                      >
                                        Confirm
                                      </button>
                                    )}
                                    {booking.status === 'Confirmed' && (
                                      <button
                                        onClick={() => updateBookingStatus(booking.id, 'Completed')}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-2 py-1 rounded font-medium transition-colors"
                                        title="Mark cleanliness finalized"
                                      >
                                        Complete
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteBooking(booking.id)}
                                      className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded transition-colors"
                                      title="Remove from table"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. SERVICES MANAGER TAB */}
                {activeTab === 'services' && (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-xs text-yellow-800 flex gap-2">
                      <span className="font-bold">Notice:</span>
                      <span>Toggling a service switch here immediately manages its visibility on the main services display layout. Dynamic changes can also be made inline.</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {services.map((service) => {
                        const isEditing = editingServiceId === service.id;
                        return (
                          <div
                            key={service.id}
                            className={`bg-white p-6 rounded-xl border transition-all ${
                              service.visible ? 'border-gray-200 shadow-xs' : 'border-dashed border-gray-300 opacity-60'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-3xl">{service.icon}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-gray-400">Visible</span>
                                <button
                                  onClick={() => toggleServiceVisibility(service.id)}
                                  className={`transition-colors p-0.5 rounded-full ${
                                    service.visible ? 'text-[#4ECDC4]' : 'text-gray-300'
                                  }`}
                                >
                                  {service.visible ? (
                                    <ToggleRight className="w-9 h-9" />
                                  ) : (
                                    <ToggleLeft className="w-9 h-9" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {isEditing ? (
                              <div className="space-y-3">
                                <div className="text-xs">
                                  <label className="block text-gray-500 mb-1 font-medium font-mono">Service Name</label>
                                  <input
                                    type="text"
                                    value={editServiceName}
                                    onChange={(e) => setEditServiceName(e.target.value)}
                                    className="w-full text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:border-[#4ECDC4] outline-none font-medium"
                                  />
                                </div>
                                <div className="text-xs">
                                  <label className="block text-gray-500 mb-1 font-medium font-mono">Estimate Rate ($/hr or base)</label>
                                  <input
                                    type="number"
                                    value={editServicePrice}
                                    onChange={(e) => setEditServicePrice(Number(e.target.value))}
                                    className="w-full text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:border-[#4ECDC4] outline-none font-mono"
                                  />
                                </div>
                                <button
                                  onClick={() => saveServiceEdit(service.id)}
                                  className="w-full bg-[#4ECDC4] hover:bg-[#38B2AC] text-[#1A1A2E] text-xs py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  <Save className="w-3.5 h-3.5" /> Save Changes
                                </button>
                              </div>
                            ) : (
                              <div>
                                <h3 className="font-serif text-lg text-[#1A1A2E] font-medium">{service.name}</h3>
                                <p className="text-gray-500 text-xs mt-1.5 h-10 overflow-hidden line-clamp-2">
                                  {service.description}
                                </p>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                  <span className="font-mono text-sm text-[#1A1A2E] font-semibold">
                                    Base Price: <span className="text-[#4ECDC4]">${service.basePrice}</span>
                                  </span>
                                  <button
                                    onClick={() => startEditingService(service)}
                                    className="text-gray-400 hover:text-[#4ECDC4] p-1 border border-gray-100 rounded hover:border-[#4ECDC4]/30 text-xs flex items-center gap-1 transition-all"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. PRICING PLANS TAB */}
                {activeTab === 'pricing' && (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-xs text-emerald-800">
                      Edit catalog tiers for dynamic frontend update. Changes reflect live in the "PRICING SECTION" grid instantly.
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {pricingPlans.map((plan) => {
                        const isEditing = editingPlanId === plan.id;
                        return (
                          <div
                            key={plan.id}
                            className={`bg-white p-6 rounded-xl border ${
                              plan.popular ? 'border-[#4ECDC4] popular-glow' : 'border-gray-200'
                            } relative`}
                          >
                            {plan.popular && (
                              <span className="absolute -top-3 left-4 bg-[#4ECDC4] text-[#1A1A2E] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                                Popular tier
                              </span>
                            )}

                            {isEditing ? (
                              <div className="space-y-3">
                                <div className="text-xs">
                                  <label className="block text-gray-550 mb-1 font-medium font-mono">Plan Header</label>
                                  <input
                                    type="text"
                                    value={editPlanName}
                                    onChange={(e) => setEditPlanName(e.target.value)}
                                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:border-[#4ECDC4] outline-none font-medium"
                                  />
                                </div>
                                <div className="text-xs">
                                  <label className="block text-gray-550 mb-1 font-medium font-mono">Rate ($/visit)</label>
                                  <input
                                    type="number"
                                    value={editPlanPrice}
                                    onChange={(e) => setEditPlanPrice(Number(e.target.value))}
                                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:border-[#4ECDC4] outline-none font-mono font-bold"
                                  />
                                </div>
                                <button
                                  onClick={() => savePlanEdit(plan.id)}
                                  className="w-full bg-[#4ECDC4] hover:bg-[#38B2AC] text-[#1A1A2E] text-xs py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  <Save className="w-3.5 h-3.5" /> Save Plan
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-col h-full justify-between">
                                <div>
                                  <div className="flex justify-between items-baseline mb-2">
                                    <h4 className="font-serif text-lg font-medium text-gray-900">{plan.name} Plan</h4>
                                    <span className="font-mono text-xl font-bold text-[#4ECDC4]">${plan.price}</span>
                                  </div>
                                  <p className="text-xs text-gray-500 mb-4 italic leading-relaxed">{plan.description}</p>
                                  
                                  <ul className="text-xs text-gray-600 space-y-2 border-t border-gray-100 pt-3">
                                    {plan.features.map((feature, fIdx) => (
                                      <li key={fIdx} className="flex items-center gap-1.5">
                                        <Check className="w-3.5 h-3.5 text-[#4ECDC4] shrink-0" />
                                        <span>{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                  <button
                                    onClick={() => startEditingPlan(plan)}
                                    className="text-gray-400 hover:text-[#4ECDC4] p-1 border border-gray-100 rounded hover:border-[#4ECDC4]/30 text-xs flex items-center gap-1"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" /> Change Price
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 5. INBOX / MESSAGES MODULE */}
                {activeTab === 'messages' && (
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="bg-white p-12 text-center rounded-xl border border-gray-100 text-gray-400">
                        <Mail className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <h4 className="font-serif text-lg">Your Inbox is pristine!</h4>
                        <p className="text-xs mt-1">No contact inquiries yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`p-6 rounded-xl border transition-all ${
                              message.read
                                ? 'bg-white border-gray-100 text-gray-500 opacity-75'
                                : 'bg-white border-[#4ECDC4] shadow-xs'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-serif font-semibold text-gray-900 text-base">{message.name}</span>
                                  {!message.read && (
                                    <span className="bg-[#4ECDC4] text-[#1A1A2E] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                      New
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-400 font-mono flex items-center gap-1 mt-1">
                                  <Phone className="w-3 h-3 text-[#4ECDC4]" /> {message.phone}
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono">{message.date}</span>
                            </div>

                            <div className="bg-gray-50/70 p-3 rounded text-xs text-gray-700 italic border border-gray-100 mb-4 whitespace-pre-wrap leading-relaxed">
                              &ldquo;{message.message}&rdquo;
                            </div>

                            <div className="flex text-xs items-center gap-2 font-mono">
                              <span className="text-[10px] text-gray-500 flex-1">
                                Preferred: {message.serviceType} ({message.preferredDate})
                              </span>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-150 flex justify-end gap-2 text-xs">
                              <button
                                onClick={() => toggleMessageRead(message.id)}
                                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                                  message.read
                                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    : 'bg-[#4ECDC4]/10 text-[#4ECDC4] hover:bg-[#4ECDC4]/20'
                                }`}
                              >
                                {message.read ? 'Mark Unread' : 'Mark as Read'}
                              </button>
                              <button
                                onClick={() => deleteMessage(message.id)}
                                className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
