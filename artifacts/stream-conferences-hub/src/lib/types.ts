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
  | 'mentors';

export type EventType = 'conference' | 'webinar';
export type EventPageTab =
  | 'dashboard'
  | 'details'
  | 'participants'
  | 'payments'
  | 'abstracts'
  | 'enquiries';

export interface Track {
  title: string;
  description: string;
  image: string;
  imagePreview?: string;
  referenceLinks: { label: string; url: string }[];
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
  brochureUrl?: string;
  bannerUrl?: string;
  logoUrl?: string;
  fees?: { label: string; amount: number }[];
  organizerContact?: { name: string; email: string; phone: string };
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
  brochureUrl?: string;
  bannerUrl?: string;
  logoUrl?: string;
  fees?: { label: string; amount: number }[];
  organizerContact?: { name: string; email: string; phone: string };
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
