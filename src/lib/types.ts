export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type BookingType = "in_salon" | "call_in";
export type StaffRole = "stylist" | "barber" | "receptionist" | "manager";

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price_kes: number;
  duration_minutes: number;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Staff {
  id: string;
  full_name: string;
  role: StaffRole;
  phone: string;
  email: string;
  active: boolean;
  created_at: string;
}

export interface Shift {
  id: string;
  staff_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
}

export interface Booking {
  id: string;
  type: BookingType;
  customer_name: string;
  phone: string;
  email: string;
  service_id: string | null;
  preferred_date: string;
  preferred_time: string;
  address: string;
  notes: string;
  status: BookingStatus;
  staff_id: string | null;
  created_at: string;
  services?: Pick<Service, "name" | "price_kes"> | null;
  staff?: Pick<Staff, "full_name"> | null;
}

export interface Walkin {
  id: string;
  customer_name: string;
  service_id: string | null;
  staff_id: string | null;
  price_kes: number;
  served_at: string;
  created_at: string;
  services?: Pick<Service, "name"> | null;
  staff?: Pick<Staff, "full_name"> | null;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  sort_order: number;
  active: boolean;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  quote: string;
  rating: number;
  active: boolean;
  sort_order: number;
}

export interface SiteHours {
  monday_friday: string;
  saturday: string;
  sunday: string;
}

export interface SiteContact {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  tiktok: string;
}

export interface SiteHero {
  tagline: string;
  subtext: string;
}
