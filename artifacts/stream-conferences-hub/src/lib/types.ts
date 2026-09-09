export type Role = 'admin' | 'mentor';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: Role;
  isTempPassword?: boolean;
}

export type Tab =
  | 'overview'
  | 'conferences'
  | 'webinars'
  | 'blogs'
  | 'mediaPartners'
  | 'collaborators'
  | 'venues'
  | 'mentors'
  | 'liveChat';

export type EventType = 'conference' | 'webinar';
export type EventPageTab =
  | 'dashboard'
  | 'details'
  | 'scientific-program'
  | 'color-theme'
  | 'fees'
  | 'participants'
  | 'payments'
  | 'abstracts'
  | 'enquiries'
  | 'brochures'
  | 'speakers'
  | 'tracks'
  | 'program'
  | 'banners'
  | 'faqs'
  | 'partners'
  | 'guidelines'
  | 'organizer-contact'
  | 'organizing-committee'
  | 'venue-details'
  | 'cohorts';

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
  degree?: string;
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

export interface OrganizingCommitteeMember {
  name?: string;
  image?: string;
  imagePreview?: string;
  degree?: string;
  specialization?: string;
  country?: string;
  biography?: string;
  researchArea?: string;
}

export interface EventPartner {
  title: string;
  order?: number;
}

export interface CourseCohort {
  _id: string;
  courseType?: 'conference' | 'webinar';
  courseId?: string;
  cohortId?: string;
  year: number;
  batchNo: number;
  title?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  isCurrent?: boolean;
  label?: string;
  subdomain?: string | null;
  assignedMentor?: string | null;
  mentorName?: string | null;
  content?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface VenueDetails {
  venueId?: string;      // reference to Venue model
  name?: string;
  address?: string;
  locationUrl?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  mainImage?: string;
  subImages?: string[];
  description?: string;
  images?: string[];
  moreInfo?: string;
}

export interface FeeEntry {
  type: string;      // accordion header, e.g. "Student"
  dateLabel: string; // row heading, e.g. "on/before 25 Dec"
  usd: number;
  gbp: number;
  eur: number;
}

export type FeeGroup = {
  type: string;
  rows: FeeEntry[];
};

export interface Conference {
  _id: string;
  eventId?: string;
  title: string;
  slug?: string;
  description: string;
  theme?: string;
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
  mentorName?: string | null;
  venue?: string;
  venueAddress?: string;
  venueMapUrl?: string;
  brochureUrl?: string;
  bannerUrl?: string;
  logoUrl?: string;
  headerBanners?: string[];
  fees?: FeeEntry[];
  organizerContact?: { name: string; email: string; phone: string; website?: string; address?: string };
  
  // New fields for conference website tabs
  speakers?: Speaker[];
  program?: ProgramDay[];
  faqs?: FAQ[];
  partners?: EventPartner[];
  guidelines?: string;
  termsAndConditions?: string;
  venueDetails?: VenueDetails;
  organizingCommittee?: OrganizingCommitteeMember[];
  currentCohortId?: string;
  currentCohort?: CourseCohort | null;
  cohorts?: CourseCohort[];
}

export interface Webinar {
  _id: string;
  eventId?: string;
  title: string;
  slug?: string;
  description: string;
  theme?: string;
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
  mentorName?: string | null;
  venue?: string;
  venueAddress?: string;
  venueMapUrl?: string;
  brochureUrl?: string;
  bannerUrl?: string;
  logoUrl?: string;
  headerBanners?: string[];
  fees?: FeeEntry[];
  organizerContact?: { name: string; email: string; phone: string; website?: string; address?: string };
  
  // New fields for conference website tabs
  speakers?: Speaker[];
  program?: ProgramDay[];
  faqs?: FAQ[];
  partners?: EventPartner[];
  guidelines?: string;
  termsAndConditions?: string;
  venueDetails?: VenueDetails;
  organizingCommittee?: OrganizingCommitteeMember[];
  currentCohortId?: string;
  currentCohort?: CourseCohort | null;
  cohorts?: CourseCohort[];
}

export interface Blog {
  _id: string;
  eventId?: string;
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

export interface BrochureLead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  institution?: string;
  country?: string;
  eventId?: string;
  eventType?: string;
  eventTitle?: string;
  eventSlug?: string;
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
  password?: string;
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

export interface EventDashboard {
  eventId: string;
  title?: string;
  stats: {
    totalParticipants: number;
    totalPayments: number;
    paidCount: number;
    pendingCount: number;
    failedCount: number;
    revenuePaise: number;
    revenue: string;
  };
}

export interface MediaAssetState {
  brochureUrl: string;
  bannerUrl: string;
  logoUrl: string;
  headerBanners: string[];
  brochurePreview: string;
  bannerPreview: string;
  logoPreview: string;
  headerBannersPreviews: string[];
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
