export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed';

export interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceType: string;
  preferredDate: string;
  message: string;
  status: BookingStatus;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or string key
  visible: boolean;
  basePrice: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular: boolean;
}

export interface MessageItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  serviceType: string;
  preferredDate: string;
  message: string;
  date: string;
  read: boolean;
}
