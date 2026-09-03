export type Role = 'admin' | 'mentor';

export interface User {
  id: string;
  username: string;
  role: Role;
  isTempPassword?: boolean;
}

export type Tab =
  | 'overview'
  | 'conferences'
  | 'webinars'
  | 'blogs'
  | 'registrations'
  | 'abstracts'
  | 'contacts'
  | 'orders'
  | 'mediaPartners'
  | 'collaborators'
  | 'exhibitors'
  | 'venues'
  | 'profile'
  | 'mentors'
  | 'liveChat';

export type EventType = 'conference' | 'webinar';
export type EventPageTab =
  | 'dashboard'
  | 'details'
  | 'participants'
  | 'payments'
  | 'abstracts'
  | 'enquiries'
  | 'speakers'
  | 'program'
  | 'itinerary'
  | 'faqs'
  | 'sponsors'
  | 'exhibitors'
  | 'guidelines'
  | 'terms'
  | 'venue-details';

export interface Track {
  title: string;
  description: string;
  image: string;
  imagePreview?: string;
  referenceLinks: { label: string; url: string }[];
}

export interface ItineraryItem {
  time: string;
  title: string;
  description?: string;
  speaker?: string;
  track?: string;
  type?: 'session' | 'break' | 'keynote' | 'panel' | 'workshop' | 'networking';
}

export interface Speaker {
  name: string;
  designation?: string;
  organization?: string;
  bio?: string;
  avatar?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  topic?: string;
  isKeynote?: boolean;
}

export interface ProgramDay {
  dayNumber: number;
  date?: string;
  title?: string;
  description?: string;
  sessions: ItineraryItem[];
}

export interface FAQ {
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

export interface EventSponsor {
  name: string;
  logo?: string;
  logoPreview?: string;
  website?: string;
  description?: string;
  tier?: 'platinum' | 'gold' | 'silver' | 'bronze' | 'supporter';
  order?: number;
}

export interface EventExhibitor {
  name: string;
  logo?: string;
  logoPreview?: string;
  website?: string;
  description?: string;
  boothNumber?: string;
  contactEmail?: string;
  order?: number;
}

export interface VenueDetails {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  description?: string;
  images?: string[];
  mapUrl?: string;
  directions?: string;
  parking?: string;
  accommodation?: string;
}

export interface Conference {
  _id: string;
  eventId?: string;
  title: string;
  slug?: string;
  description: string;
  day: string;
  month: string;
  location: string;
  eventDate: string;
  date: 'upcoming' | 'past';
  announcedBy: string;
  registrationLink?: string;
  tracks?: Track[];
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  subdomain?: string;
  assignedMentor?: string | null;
  venue?: string;
  venueAddress?: string;
  venueMapUrl?: string;
  brochureUrl?: string;
  bannerUrl?: string;
  logoUrl?: string;
  fees?: { label: string; amount: number }[];
  organizerContact?: { name: string; email: string; phone: string; website?: string; address?: string };
  
  // New fields for conference website tabs
  itinerary?: ItineraryItem[];
  speakers?: Speaker[];
  program?: ProgramDay[];
  faqs?: FAQ[];
  sponsors?: EventSponsor[];
  exhibitors?: EventExhibitor[];
  guidelines?: string;
  termsAndConditions?: string;
  venueDetails?: VenueDetails;
}

export interface Webinar {
  _id: string;
  eventId?: string;
  title: string;
  slug?: string;
  description: string;
  day: string;
  month: string;
  location: string;
  eventDate: string;
  date: 'upcoming' | 'past';
  speaker: string;
  announcedBy: string;
  registrationLink?: string;
  tracks?: Track[];
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  subdomain?: string;
  assignedMentor?: string | null;
  venue?: string;
  venueAddress?: string;
  venueMapUrl?: string;
  brochureUrl?: string;
  bannerUrl?: string;
  logoUrl?: string;
  fees?: { label: string; amount: number }[];
  organizerContact?: { name: string; email: string; phone: string; website?: string; address?: string };
  
  // New fields for conference website tabs
  itinerary?: ItineraryItem[];
  speakers?: Speaker[];
  program?: ProgramDay[];
  faqs?: FAQ[];
  sponsors?: EventSponsor[];
  exhibitors?: EventExhibitor[];
  guidelines?: string;
  termsAndConditions?: string;
  venueDetails?: VenueDetails;
}

export interface Blog {
  _id: string;
  title: string;
  label: string;
  copy: string;
  content: string;
  bannerUrl?: string;
  announcedBy: string;
  createdAt: string;
}

export interface Registration {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  institution: string;
  country: string;
  category: string;
  presentingAbstract: string;
  paymentStatus?: 'unpaid' | 'paid' | 'pending';
  eventId?: string;
  eventType?: string;
  eventTitle?: string;
  status?: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Abstract {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  institution?: string;
  country?: string;
  abstractFile?: string;
  track?: string;
  summary?: string;
  eventId?: string;
  eventType?: string;
  eventTitle?: string;
  status?: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  conference?: string;
  message: string;
  createdAt: string;
}

export interface Order {
  _id: string;
  orderId: string;
  paymentId?: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed';
  mode: string;
  createdAt: string;
}

export interface Venue {
  _id: string;
  name: string;
  address: string;
  locationUrl: string;
  createdBy: string;
  createdAt: string;
}

export interface MediaPartner {
  _id: string;
  name: string;
  logo: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface Collaborator {
  _id: string;
  name: string;
  logo: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface Exhibitor {
  _id: string;
  name: string;
  logo: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface MentorProfile {
  _id?: string;
  username: string;
  fullName: string;
  title: string;
  bio: string;
  avatar: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  expertise: string[];
  education: { degree: string; institution: string; year: string }[];
  experiences: { title: string; organization: string; duration: string; description: string }[];
  certifications: { name: string; issuer: string; year: string }[];
  isActive?: boolean;
}

export interface EventDetail {
  eventId: string;
  stats: {
    totalParticipants: number;
    totalPayments: number;
    paidCount: number;
    pendingCount: number;
    failedCount: number;
    revenue: string;
  };
  participants: Registration[];
  payments: Order[];
}

export interface MediaAssetState {
  brochureUrl: string;
  bannerUrl: string;
  logoUrl: string;
  brochurePreview: string;
  bannerPreview: string;
  logoPreview: string;
}

export type LogoKind = 'partner' | 'collaborator' | 'exhibitor';

export interface PartnerFormState {
  open: boolean;
  editingId: string | null;
  name: string;
  logo: string;
  logoPreview: string;
  description: string;
}

export interface VenueFormState {
  open: boolean;
  editingId: string | null;
  name: string;
  address: string;
  locationUrl: string;
}

export interface ChatSession {
  _id: string;
  visitorId: string;
  visitorName: string;
  visitorEmail: string;
  status: 'open' | 'closed';
  assignedTo: string | null;
  lastMessageAt: string;
  unreadByAdmin: number;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  sessionId: string;
  sender: 'visitor' | 'admin';
  senderName: string;
  text: string;
  createdAt: string;
}
