export type Role = 'admin' | 'mentor';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: Role;
  isTempPassword?: boolean;
}

export type ModalType = 'confirm' | 'danger' | 'success' | 'info' | 'alert';

export interface ModalOptions {
  type?: ModalType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ModalState extends ModalOptions {
  isOpen: boolean;
  resolve?: (value: boolean) => void;
}

export type Tab =
  | 'overview'
  | 'conferences'
  | 'blogs'
  | 'mediaPartners'
  | 'collaborators'
  | 'venues'
  | 'mentors'
  | 'liveChat'
  | 'userWebsite'
  | 'gallery'
  | 'brochure'
  | 'abstractTemplate';

export interface MainBrochureItem {
  _id?: string;
  title: string;
  fileUrl: string;
  fileName?: string;
  updatedAt?: string;
}

export type EventType = 'conference';
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
  | 'welcome-banner'
  | 'faqs'
  | 'partners'
  | 'sponsors'
  | 'media-partners'
  | 'guidelines'
  | 'organizer-contact'
  | 'organizing-committee'
  | 'venue-details'
  | 'cohorts'
  | 'live-chat'
  | 'seo-config'
  | 'abstract-template';

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
  category?: 'keynote' | 'speaker' | 'poster' | 'yrf' | 'student';
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

export interface EventSponsor {
  name: string;
  logo: string;
}

export interface EventMediaPartner {
  name: string;
  logo: string;
}

export interface CourseCohort {
  _id: string;
  courseType?: 'conference';
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
  cityHighlights?: string[];
  description?: string;
  images?: string[];
  moreInfo?: string;
}

export interface FeeSubItem {
  id?: string;
  name: string;
  prices: {
    USD?: number;
    GBP?: number;
    EUR?: number;
    [key: string]: number | undefined;
  };
}

export interface FeeCategory {
  id?: string;
  name: string;
  items: FeeSubItem[];
}

export interface DeadlineTier {
  id?: string;
  title: string;
  dateText?: string;
  deadlineDate?: string;
  categories: FeeCategory[];
}

export interface FeeEntry {
  type: string;      // accordion header, e.g. "Student"
  dateLabel: string; // row heading, e.g. "on/before 25 Dec"
  deadline: string;  // ISO date string, e.g. "2026-12-25" — used for auto-expiry
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
  subjectImageUrl?: string;
  headerBanners?: string[];
  organizerContact?: { name: string; email: string; phone: string; website?: string; address?: string; country?: string };
  welcomeBannerTitle?: string;
  welcomeBannerDescription?: string;
  gtmCode?: string;
  gaCode?: string;
  mcCode?: string;
  metaTitle?: string;
  metaDescription?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  country?: string;
  
  // New fields for conference website tabs
  speakers?: Speaker[];
  program?: ProgramDay[];
  faqs?: FAQ[];
  partners?: EventPartner[];
  sponsors?: EventSponsor[];
  mediaPartners?: EventMediaPartner[];
  guidelines?: string;
  termsAndConditions?: string;
  venueDetails?: VenueDetails;
  organizingCommittee?: OrganizingCommitteeMember[];
  currentCohortId?: string;
  currentCohort?: CourseCohort | null;
  cohorts?: CourseCohort[];
  fees?: any;
  exhibitors?: any[];
  themeColor?: string;
  heroThemeColor?: string;
  scientificProgramUrl?: string;
  about?: string;
  terms?: string;
  privacy?: string;
  registerSteps?: any[];
  brochure?: any;
  feeLevels?: any[];
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
  title?: string;
  fullName?: string;
  name: string;
  email: string;
  phone?: string;
  institution: string;
  address?: string;
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
  title?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  institution?: string;
  address?: string;
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
  country?: string;
  subject?: string;
  conference?: string;
  message: string;
  createdAt: string;
}

export interface BrochureLead {
  _id: string;
  title?: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  institution?: string;
  designation?: string;
  address?: string;
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
  title?: string;
  fullName?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
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
  isActive?: boolean;
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

export interface CurrencyPaymentStat {
  currency: string;
  totalCount: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  failedAmount: number;
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
    byCurrency?: CurrencyPaymentStat[];
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
  conferenceId?: string | null;
  eventId?: string | null;
  conferenceTitle?: string;
  scope?: 'main' | 'conference';
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  visitorCountry?: string;
  status: 'open' | 'closed';
  assignedTo: string | null;
  lastMessageAt: string;
  unreadByAdmin: number;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  sessionId?: string;
  sender?: 'visitor' | 'admin';
  senderName?: string;
  senderEmail?: string;
  senderPhone?: string;
  senderCountry?: string;
  senderRole?: string;
  text?: string;
  message?: string;
  createdAt: string;
}

export interface GalleryItem {
  _id: string;
  title: string;
  description?: string;
  image: string;
  createdBy?: string;
  createdAt?: string;
}
