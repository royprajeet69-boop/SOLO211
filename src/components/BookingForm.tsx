import React, { useState } from 'react';
import { Calendar, Phone, User, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { ServiceItem, Booking } from '../types';
import { countryCodes, CountryCode } from '../utils/countryCodes';

interface BookingFormProps {
  services: ServiceItem[];
  onAddBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt'>) => void;
  triggerRipple: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function BookingForm({ services, onAddBooking, triggerRipple }: BookingFormProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    countryCodes.find((c) => c.iso === 'US') || countryCodes[0]
  );

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceType: '',
    preferredDate: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const activeServices = services.filter(s => s.visible);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple verification
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Please enter a reachability telephone number.');
      return;
    }
    if (!formData.serviceType) {
      setErrorMessage('Please select a cleaning arrangement.');
      return;
    }
    if (!formData.preferredDate) {
      setErrorMessage('Please pick your desired schedule date.');
      return;
    }

    const combinedPhone = `${selectedCountry.flag} ${selectedCountry.code} ${formData.phone.trim()}`;

    // Call state handler in parent
    onAddBooking({
      clientName: formData.name,
      clientPhone: combinedPhone,
      serviceType: formData.serviceType,
      preferredDate: formData.preferredDate,
      message: formData.message
    });

    setFormData(prev => ({ ...prev, phone: combinedPhone }));
    setErrorMessage('');
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      serviceType: activeServices[0]?.name || '',
      preferredDate: '',
      message: ''
    });
    setSelectedCountry(countryCodes.find((c) => c.iso === 'US') || countryCodes[0]);
    setIsSubmitted(false);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden relative" id="contact-booking">
      {/* Decorative Top Accent Bar */}
      <div className="bg-[#4ECDC4] h-1.5 w-full"></div>

      {isSubmitted ? (
        <div className="p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[450px] transition-all">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h3 className="font-serif text-3xl text-[#1A1A2E] tracking-tight mb-2">Request Received!</h3>
          <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed mb-8">
            Thank you, <span className="font-semibold text-gray-700">{formData.name}</span>. Your PureSpace cleaning request for <strong className="text-[#4ECDC4] font-medium">{formData.serviceType}</strong> has been received has been logged in our queue.
          </p>

          {/* Clean Receipt breakdown Card */}
          <div className="w-full max-w-sm bg-[#EEF9F8] border border-[#4ECDC4]/20 p-6 rounded-xl text-left text-xs space-y-3 mb-8">
            <div className="flex justify-between border-b border-teal-100/50 pb-2">
              <span className="text-gray-400 font-mono">CLIENT DETAILS</span>
              <span className="font-semibold text-gray-700">{formData.name}</span>
            </div>
            <div className="flex justify-between border-b border-teal-100/50 pb-2">
              <span className="text-gray-400 font-mono">PHONE CONTACT</span>
              <span className="font-medium text-gray-700">{formData.phone}</span>
            </div>
            <div className="flex justify-between border-b border-teal-100/50 pb-2">
              <span className="text-gray-400 font-mono">CLEAN TYPE</span>
              <span className="font-semibold text-[#1A1A2E]">{formData.serviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 font-mono">DATE REQUESTED</span>
              <span className="font-bold text-[#4ECDC4]">{formData.preferredDate}</span>
            </div>
          </div>

          <button
            onClick={(e) => {
              triggerRipple(e);
              handleReset();
            }}
            className="px-6 py-2.5 bg-[#1A1A2E] hover:bg-[#252542] text-white text-xs font-medium rounded-lg transition-transform hover:scale-[1.02] ripple-container shadow-md"
          >
            Submit Another Cleaning Request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
          <div className="border-b border-gray-150 pb-4">
            <h3 className="font-serif text-2xl text-[#1A1A2E] font-medium">Book a Clean Service</h3>
            <p className="text-gray-500 text-xs mt-1">Submit your details, and our local team will coordinate scheduling instantly.</p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-mono">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400">FullName</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Charlotte Wood"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50/50 focus:bg-white border border-gray-200 focus:border-[#4ECDC4] outline-none rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#1A1A2E] placeholder-gray-400 transition-all font-sans"
                />
              </div>
            </div>

            {/* Phone Input with Country Code Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400">Phone number</label>
              <div className="flex gap-2 font-sans">
                {/* Country Code Select */}
                <div className="relative shrink-0 w-[115px]">
                  <select
                    value={selectedCountry.iso}
                    onChange={(e) => {
                      const matched = countryCodes.find(c => c.iso === e.target.value);
                      if (matched) setSelectedCountry(matched);
                    }}
                    className="w-full bg-gray-50/50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 focus:border-[#4ECDC4] outline-none rounded-lg px-2.5 py-2.5 text-xs text-[#1A1A2E] cursor-pointer transition-all appearance-none font-sans"
                    title="Select Country Calling Code"
                  >
                    {countryCodes.map((country) => (
                      <option key={country.iso} value={country.iso}>
                        {country.flag} {country.iso} ({country.code})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
                    <span className="text-[8px]">▼</span>
                  </div>
                </div>

                {/* Local Number Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-50/50 focus:bg-white border border-gray-200 focus:border-[#4ECDC4] outline-none rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#1A1A2E] placeholder-gray-400 transition-all font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Service Selection dropdown */}
            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400">Service required</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <select
                  required
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="w-full bg-gray-50/50 focus:bg-white border border-gray-200 focus:border-[#4ECDC4] outline-none rounded-lg pl-10 pr-3 py-2.5 text-sm text-[#1A1A2E] transition-all font-sans appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select from active services...</option>
                  {activeServices.map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name} (from ${service.basePrice})
                    </option>
                  ))}
                  {/* Plus default pricing plans as options in dropdown for custom synergy */}
                  <option value="Basic Plan">Basic Plan ($59/visit)</option>
                  <option value="Standard Plan">Standard Plan ($149/visit)</option>
                  <option value="Premium Plan">Premium Plan ($249/visit)</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                  <span className="text-[10px]">▼</span>
                </div>
              </div>
            </div>

            {/* Preferred Date */}
            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400">Preferred clean date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="w-full bg-gray-50/50 focus:bg-white border border-gray-200 focus:border-[#4ECDC4] outline-none rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#1A1A2E] cursor-pointer transition-all font-mono"
                />
              </div>
            </div>

            {/* Message / Details */}
            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-gray-400">Special Notes (optional)</label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none text-gray-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <textarea
                  placeholder="e.g. Any lockboxes, pets, specific priority areas or special instructions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-50/50 focus:bg-white border border-gray-200 focus:border-[#4ECDC4] outline-none rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#1A1A2E] placeholder-gray-400 transition-all font-sans"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            onClick={triggerRipple}
            className="w-full bg-[#4ECDC4] hover:bg-[#38B2AC] hover:scale-[1.01] active:scale-[0.99] text-[#1A1A2E] font-semibold py-3.5 rounded-lg transition-transform shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer ripple-container text-sm"
          >
            <span>Request Booking Now</span>
          </button>
        </form>
      )}
    </div>
  );
}
