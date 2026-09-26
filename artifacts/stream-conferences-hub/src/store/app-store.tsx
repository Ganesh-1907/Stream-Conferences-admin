import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type FormEvent,
  type ReactNode,
} from 'react';
import { useLocation } from 'wouter';
import { io, type Socket } from 'socket.io-client';
import { API_BASE, SERVER_ORIGIN } from '@/lib/constants';
import {
  compressImage,
  computeDayAndMonth,
  mediaUrl,
  parseStartAndEndDates,
} from '@/lib/utils';
import {
  Abstract,
  Blog,
  BrochureLead,
  ChatMessage,
  ChatSession,
  Collaborator,
  Conference,
  Contact,
  CourseCohort,
  EventDashboard,
  EventPageTab,
  EventType,
  EventPartner,
  EventSponsor,
  EventMediaPartner,
  Exhibitor,
  FAQ,
  LogoKind,
  MediaAssetState,
  MediaPartner,
  MentorProfile,
  Order,
  PartnerFormState,
  OrganizingCommitteeMember,
  Registration,
  Tab,
  Track,
  User,
  Venue,
  VenueFormState,
  GalleryItem,
  MainBrochureItem,
  ModalOptions,
  ModalState,
} from '@/lib/types';

type EditableType = 'conference' | 'blog';
type DeleteType = 'conferences' | 'blogs';

interface FeeRow {
  label: string;
  amount: number;
}

interface OrganizerContact {
  name: string;
  email: string;
  phone: string;
}

interface DashboardStats {
  counts: { conferences: number; blogs: number; registrations: number; abstracts: number; confUpcoming: number; confPast: number };
  revenue: { total: number; paidOrders: number; totalOrders: number };
  registrations: { paid: number; unpaid: number; pending: number };
  monthly: { conferences: { _id: number; count: number }[] };
  yearly: { conferences: { _id: number; count: number }[] };
  recent: { conferences: any[]; blogs: any[]; registrations: any[]; abstracts: any[] };
}

interface AppStoreValue {
  // Session
  user: User | null;
  loginLoading: boolean;
  loginError: string;
  usernameInput: string;
  passwordInput: string;
  setUsernameInput: (v: string) => void;
  setPasswordInput: (v: string) => void;
  handleLogin: (e: FormEvent) => Promise<void>;
  handleLogout: () => void;

  // Navigation
  activeTab: Tab;
  goToTab: (tab: Tab) => void;
  isEventPage: boolean;
  eventPageType: EventType | null;
  eventPageId: string | null;
  eventPageTab: EventPageTab;
  eventPage: Conference | null;
  currentEventLoading: boolean;
  eventPageMode: 'view' | 'edit';
  isAddMode: boolean;
  setEventPageMode: (mode: 'view' | 'edit') => void;
  openEventPage: (item: Conference, type: EventType, tab?: EventPageTab, mode?: 'view' | 'edit') => void;
  createDraftEvent: (type: EventType) => Promise<Conference | null>;
  navigateToAddEvent: (type: EventType, parent?: Conference) => void;
  closeEventPage: () => void;
  updateEventField: (field: string, value: any) => void;
  updateEventFields: (fields: Record<string, any>) => Promise<boolean>;
  eventCohortId: string | null;
  activeCohort: CourseCohort | null;
  openCohortTab: (cohort: CourseCohort, tab: EventPageTab) => void;
  openCohortTabEdit: (cohort: CourseCohort, tab: EventPageTab) => void;
  openEventTab: (tab: EventPageTab) => void;

  // Data lists
  loadingData: boolean;
  dashboardStats: DashboardStats | null;
  conferences: Conference[];
  blogs: Blog[];
  registrations: Registration[];
  abstracts: Abstract[];
  contacts: Contact[];
  orders: Order[];
  mediaPartners: MediaPartner[];
  collaborators: Collaborator[];
  exhibitors: Exhibitor[];
  venues: Venue[];
  galleryItems: GalleryItem[];
  profile: MentorProfile | null;
  mentors: MentorProfile[];
  refreshData: () => Promise<void>;
  loadTabData: (tab: Tab) => Promise<void>;
  loadGalleryItems: () => Promise<void>;
  addGalleryItem: (title: string, description: string, image: string) => Promise<boolean>;
  deleteGalleryItem: (id: string) => Promise<boolean>;
  mainBrochure: MainBrochureItem | null;
  loadMainBrochure: () => Promise<void>;
  saveMainBrochure: (fileUrlOrData: string | { title?: string; fileUrl: string; fileName?: string }, fileName?: string, title?: string) => Promise<boolean>;
  deleteMainBrochure: () => Promise<boolean>;
  abstractTemplate: MainBrochureItem | null;
  loadAbstractTemplate: () => Promise<void>;
  saveAbstractTemplate: (fileUrlOrData: string | { title?: string; fileUrl: string; fileName?: string }, fileName?: string, title?: string) => Promise<boolean>;
  deleteAbstractTemplate: () => Promise<boolean>;

  // Generic add/edit modal
  showForm: boolean;
  editingItemType: EditableType | null;
  editingItemId: string | null;
  openAddForm: (type: EditableType) => void;
  openEditForm: (item: any, type: EditableType) => void;
  closeForm: () => void;
  handleSaveItem: (e: FormEvent) => Promise<void>;
  handleDeleteItem: (id: string, type: DeleteType) => Promise<void>;
  activeDropdownId: string | null;
  setActiveDropdownId: (id: string | null) => void;

  // Wizard state (conference)
  wizardOpen: boolean;
  wizardType: EventType | null;
  wizardStep: number;
  wizardEditId: string | null;
  wizardSaving: boolean;
  wizardError: string;
  setWizardStep: (step: number) => void;
  closeWizard: () => void;
  canGoNext: () => boolean;
  canGoToStep: (step: number) => boolean;
  submitWizard: () => Promise<void>;
  openEditCohortContent: (cohort: CourseCohort) => void;

  // Wizard fields (conference)
  confTitle: string;
  setConfTitle: (v: string) => void;
  confDesc: string;
  setConfDesc: (v: string) => void;
  confLocation: string;
  setConfLocation: (v: string) => void;
  confStartDate: string;
  setConfStartDate: (v: string) => void;
  confEndDate: string;
  setConfEndDate: (v: string) => void;
  confIsOnline: boolean;
  setConfIsOnline: (v: boolean) => void;
  confVenue: string;
  setConfVenue: (v: string) => void;
  confSubdomain: string;
  setConfSubdomain: (v: string) => void;
  confOnlineLink: string;
  setConfOnlineLink: (v: string) => void;
  confStartTime: string;
  setConfStartTime: (v: string) => void;
  confEndTime: string;
  setConfEndTime: (v: string) => void;
  confFees: FeeRow[];
  setConfFees: (fees: FeeRow[]) => void;
  confOrg: OrganizerContact;
  setConfOrg: (org: OrganizerContact) => void;
  confMedia: MediaAssetState;
  setConfMedia: Dispatch<SetStateAction<MediaAssetState>>;
  confTracks: Track[];
  setConfTracks: Dispatch<SetStateAction<Track[]>>;

  // Wizard helpers
  wizardTitle: () => string;
  setWizardTitle: (v: string) => void;
  wizardDesc: () => string;
  setWizardDesc: (v: string) => void;
  wizardTheme: () => string;
  setWizardTheme: (v: string) => void;
  wizardStartDate: () => string;
  setWizardStartDate: (v: string) => void;
  wizardEndDate: () => string;
  setWizardEndDate: (v: string) => void;
  wizardIsOnline: () => boolean;
  setWizardIsOnline: (v: boolean) => void;
  wizardVenue: () => string;
  setWizardVenue: (v: string) => void;
  wizardSubdomain: () => string;
  setWizardSubdomain: (v: string) => void;
  wizardOnlineLink: () => string;
  setWizardOnlineLink: (v: string) => void;
  wizardStartTime: () => string;
  setWizardStartTime: (v: string) => void;
  wizardEndTime: () => string;
  setWizardEndTime: (v: string) => void;
  wizardFees: () => FeeRow[];
  setWizardFees: (fees: FeeRow[]) => void;
  wizardOrg: () => OrganizerContact;
  setWizardOrg: (org: OrganizerContact) => void;
  wizardMentor: () => string;
  setWizardMentor: (v: string) => void;
  selectMentor: (username: string) => void;
  wizardMedia: () => MediaAssetState;
  setWizardMedia: (m: SetStateAction<MediaAssetState>) => void;
  wizardTracks: () => Track[];
  setWizardTracks: (tracks: SetStateAction<Track[]>) => void;
  wizardFaqs: () => FAQ[];
  setWizardFaqs: (v: SetStateAction<FAQ[]>) => void;
  wizardPartners: () => EventPartner[];
  setWizardPartners: (v: SetStateAction<EventPartner[]>) => void;
  wizardSponsors: () => EventSponsor[];
  setWizardSponsors: (v: SetStateAction<EventSponsor[]>) => void;
  wizardMediaPartners: () => EventMediaPartner[];
  setWizardMediaPartners: (v: SetStateAction<EventMediaPartner[]>) => void;
  wizardOrganizingCommittee: () => OrganizingCommitteeMember[];
  setWizardOrganizingCommittee: (v: SetStateAction<OrganizingCommitteeMember[]>) => void;
  wizardGuidelines: () => string;
  setWizardGuidelines: (v: string) => void;
  wizardTerms: () => string;
  setWizardTerms: (v: string) => void;
  addFeeRow: () => void;
  updateFeeRow: (index: number, field: 'label' | 'amount', value: string) => void;
  removeFeeRow: (index: number) => void;
  addTrack: () => void;
  updateTrack: (index: number, field: 'title' | 'description', value: string) => void;
  removeTrack: (index: number) => void;
  addFaq: () => void;
  updateFaq: (index: number, field: keyof FAQ, value: string | number) => void;
  removeFaq: (index: number) => void;
  addPartner: () => void;
  updatePartner: (index: number, field: keyof EventPartner, value: string) => void;
  removePartner: (index: number) => void;
  addSponsor: () => void;
  updateSponsor: (index: number, field: keyof EventSponsor, value: string) => void;
  removeSponsor: (index: number) => void;
  handleSponsorLogoUpload: (index: number, file: File | null) => Promise<void>;
  addMediaPartner: () => void;
  updateMediaPartner: (index: number, field: keyof EventMediaPartner, value: string) => void;
  removeMediaPartner: (index: number) => void;
  handleMediaPartnerLogoUpload: (index: number, file: File | null) => Promise<void>;
  addOrganizingCommitteeMember: () => void;
  updateOrganizingCommitteeMember: (index: number, field: keyof OrganizingCommitteeMember, value: string) => void;
  removeOrganizingCommitteeMember: (index: number) => void;
  handleCommitteeMemberImageUpload: (index: number, file: File | null) => Promise<void>;
  addReferenceLink: (trackIndex: number) => void;
  updateReferenceLink: (trackIndex: number, linkIndex: number, field: 'label' | 'url', value: string) => void;
  removeReferenceLink: (trackIndex: number, linkIndex: number) => void;
  trackImageLoading: Record<number, boolean>;
  handleTrackImageUpload: (trackIndex: number, file: File | null) => Promise<void>;
  handleMediaUpload: (kind: 'brochure' | 'banner' | 'logo', file: File | null) => Promise<void>;
  clearMedia: (kind: 'brochure' | 'banner' | 'logo') => void;
  handleHeaderBannerUpload: (file: File | null) => Promise<void>;
  removeHeaderBanner: (index: number) => void;
  uploadHeaderBannerForEvent: (eventId: string, eventType: 'conference', file: File) => Promise<void>;
  removeHeaderBannerForEvent: (eventId: string, eventType: 'conference', index: number) => Promise<void>;

  // Blog fields
  blogTitle: string;
  setBlogTitle: (v: string) => void;
  blogLabel: string;
  setBlogLabel: (v: string) => void;
  blogCopy: string;
  setBlogCopy: (v: string) => void;
  blogContent: string;
  setBlogContent: (v: string) => void;
  blogBannerUrl: string;
  setBlogBannerUrl: (v: string) => void;
  blogBannerPreview: string;
  setBlogBannerPreview: (v: string) => void;
  handleBlogBannerUpload: (file: File | null) => Promise<void>;

  // Content sections (partners/collaborators/exhibitors/venues)
  partnerForm: PartnerFormState;
  setPartnerForm: Dispatch<SetStateAction<PartnerFormState>>;
  collaboratorForm: PartnerFormState;
  setCollaboratorForm: Dispatch<SetStateAction<PartnerFormState>>;
  exhibitorForm: PartnerFormState;
  setExhibitorForm: Dispatch<SetStateAction<PartnerFormState>>;
  venueForm: VenueFormState;
  setVenueForm: Dispatch<SetStateAction<VenueFormState>>;
  openPartnerForm: (item: MediaPartner | null) => void;
  savePartner: () => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  openCollaboratorForm: (item: Collaborator | null) => void;
  saveCollaborator: () => Promise<void>;
  deleteCollaborator: (id: string) => Promise<void>;
  openExhibitorForm: (item: Exhibitor | null) => void;
  saveExhibitor: () => Promise<void>;
  deleteExhibitor: (id: string) => Promise<void>;
  openVenueForm: (item: Venue | null) => void;
  saveVenue: () => Promise<void>;
  deleteVenue: (id: string) => Promise<void>;
  toggleVenueStatus: (id: string, currentStatus?: boolean) => Promise<void>;
  ensureMentorsAndVenues: (force?: boolean) => Promise<void>;
  handleLogoUpload: (kind: LogoKind, file: File | null) => void;

  // Profile
  profileForm: MentorProfile & { avatarPreview?: string };
  setProfileForm: Dispatch<SetStateAction<MentorProfile & { avatarPreview?: string }>>;
  saveProfile: () => Promise<void>;
  handleProfileAvatarUpload: (file: File | null) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;

  // Per-event data
  eventDashboard: EventDashboard | null;
  eventParticipants: Registration[];
  eventPayments: Order[];
  eventDetailLoading: boolean;
  eventDetailError: string;
  eventAbstracts: Abstract[];
  eventEnquiries: Contact[];
  eventAbstractsLoading: boolean;
  eventEnquiriesLoading: boolean;
  eventBrochureLeads: BrochureLead[];
  eventBrochureLeadsLoading: boolean;
  abstractActionLoading: string | null;
  handleAbstractAction: (id: string, action: 'approve' | 'reject', reason?: string) => Promise<void>;
  viewingParticipant: Registration | null;
  setViewingParticipant: (p: Registration | null) => void;

  // Course cohorts
  eventCohorts: CourseCohort[];
  eventCohortsLoading: boolean;
  loadCohorts: () => Promise<void>;
  createCohort: (payload: Partial<CourseCohort>) => Promise<void>;
  updateCohort: (cohortId: string, payload: Partial<CourseCohort>) => Promise<void>;
  setCurrentCohort: (cohortId: string) => Promise<void>;
  deleteCohort: (cohortId: string) => Promise<void>;
  assignCohortMentor: (cohortId: string, assignedMentor: string | null) => Promise<void>;

  // Mentor assignment
  assignOpen: boolean;
  assignTarget: Conference | null;
  assignUsername: string;
  openAssignMentor: (item: Conference) => void;
  closeAssignMentor: () => void;
  setAssignUsername: (v: string) => void;
  submitAssignMentor: () => Promise<void>;

  // Live chat
  chatSessions: ChatSession[];
  activeChatId: string | null;
  activeChatMessages: ChatMessage[];
  chatLoading: boolean;
  loadChatSessions: (conferenceId?: string | null, scope?: 'main' | 'conference', eventId?: string | null) => Promise<void>;
  setActiveChatId: (id: string | null) => void;
  sendChatReply: (text: string) => Promise<void>;
  markChatRead: (sessionId: string) => Promise<void>;
  setChatStatus: (sessionId: string, status: 'open' | 'closed') => Promise<void>;

  // Global Centered Modal Dialogs
  modalState: ModalState;
  confirmModal: (options: ModalOptions) => Promise<boolean>;
  alertModal: (options: ModalOptions | string) => Promise<void>;
  closeModal: (result: boolean) => void;

  // Image Preview Lightbox
  imagePreviewState: { isOpen: boolean; url: string; title?: string };
  openImagePreview: (url: string, title?: string) => void;
  closeImagePreview: () => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

const EMPTY_MEDIA: MediaAssetState = {
  brochureUrl: '',
  bannerUrl: '',
  logoUrl: '',
  headerBanners: [],
  brochurePreview: '',
  bannerPreview: '',
  logoPreview: '',
  headerBannersPreviews: [],
};

const EMPTY_ORG: OrganizerContact = { name: '', email: '', phone: '' };

const EMPTY_PARTNER_FORM: PartnerFormState = {
  open: false,
  editingId: null,
  name: '',
  logo: '',
  logoPreview: '',
  description: '',
};

const EMPTY_VENUE_FORM: VenueFormState = {
  open: false,
  editingId: null,
  name: '',
  address: '',
  locationUrl: '',
};

const EMPTY_PROFILE: MentorProfile & { avatarPreview?: string } = {
  username: '',
  fullName: '',
  title: '',
  bio: '',
  avatar: '',
  avatarPreview: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  website: '',
  expertise: [],
  education: [],
  experiences: [],
  certifications: [],
};

const ADMIN_USER_KEY = 'stream-admin-user';
const ADMIN_SESSION_EXPIRES_KEY = 'stream-admin-session-expires';
const SESSION_WINDOW_MS = 4 * 60 * 60 * 1000;
const SESSION_TOUCH_INTERVAL_MS = 60 * 1000;
const SESSION_CHECK_INTERVAL_MS = 30 * 1000;
const SESSION_ACTIVITY_EVENTS: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];

function readSessionExpiry(): number | null {
  const raw = localStorage.getItem(ADMIN_SESSION_EXPIRES_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function extendSession(now = Date.now()): number {
  const expiry = now + SESSION_WINDOW_MS;
  localStorage.setItem(ADMIN_SESSION_EXPIRES_KEY, String(expiry));
  return expiry;
}

function isSessionActive(now = Date.now()): boolean {
  const expiry = readSessionExpiry();
  return expiry !== null && now < expiry;
}

function clearSession() {
  localStorage.removeItem(ADMIN_USER_KEY);
  localStorage.removeItem(ADMIN_SESSION_EXPIRES_KEY);
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();

  // Session
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(ADMIN_USER_KEY);
    if (!saved || !isSessionActive()) {
      clearSession();
      return null;
    }
    try {
      return JSON.parse(saved);
    } catch {
      clearSession();
      return null;
    }
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation — read initial tab from URL hash so refresh restores it
  const VALID_TABS: Tab[] = [
    'overview','conferences','blogs','mediaPartners','collaborators','venues',
    'mentors','liveChat','userWebsite','gallery','brochure','abstractTemplate'
  ];
  const getTabFromHash = (): Tab => {
    const hash = window.location.hash.replace('#', '');
    return VALID_TABS.includes(hash as Tab) ? (hash as Tab) : 'overview';
  };
  const [activeTab, setActiveTab] = useState<Tab>(getTabFromHash);

  // Data lists
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [abstracts, setAbstracts] = useState<Abstract[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mediaPartners, setMediaPartners] = useState<MediaPartner[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [mainBrochure, setMainBrochure] = useState<MainBrochureItem | null>(null);
  const [abstractTemplate, setAbstractTemplate] = useState<MainBrochureItem | null>(null);
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Cache: track when each tab's data was last fetched (skip re-fetch within 30s)
  const lastFetched = useRef<Record<string, number>>({});
  const CACHE_TTL = 30_000;

  // Global Modal Dialog state
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    cancelText: 'Cancel',
  });

  const confirmModal = useCallback((options: ModalOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setModalState({
        isOpen: true,
        type: options.type || 'confirm',
        title: options.title || 'Please Confirm',
        message: options.message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        resolve,
      });
    });
  }, []);

  const alertModal = useCallback((options: ModalOptions | string): Promise<void> => {
    return new Promise<void>((resolve) => {
      if (typeof options === 'string') {
        setModalState({
          isOpen: true,
          type: 'info',
          title: 'Notice',
          message: options,
          confirmText: 'OK',
          resolve: () => resolve(),
        });
      } else {
        setModalState({
          isOpen: true,
          type: options.type || 'info',
          title: options.title || 'Notice',
          message: options.message,
          confirmText: options.confirmText || 'OK',
          resolve: () => resolve(),
        });
      }
    });
  }, []);

  const closeModal = useCallback((result: boolean) => {
    setModalState((prev) => {
      if (prev.resolve) {
        prev.resolve(result);
      }
      return { ...prev, isOpen: false, resolve: undefined };
    });
  }, []);

  // Image Preview Lightbox State
  const [imagePreviewState, setImagePreviewState] = useState<{ isOpen: boolean; url: string; title?: string }>({
    isOpen: false,
    url: '',
    title: '',
  });

  const openImagePreview = useCallback((url: string, title?: string) => {
    if (!url) return;
    const fullUrl = mediaUrl(url);
    setImagePreviewState({
      isOpen: true,
      url: fullUrl,
      title: title || 'Image Preview',
    });
  }, []);

  const closeImagePreview = useCallback(() => {
    setImagePreviewState({ isOpen: false, url: '', title: '' });
  }, []);

  // Modal / form state
  const [showForm, setShowForm] = useState(false);
  const [editingItemType, setEditingItemType] = useState<EditableType | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Event detail data
  const [eventDashboard, setEventDashboard] = useState<EventDashboard | null>(null);
  const [eventParticipants, setEventParticipants] = useState<Registration[]>([]);
  const [eventPayments, setEventPayments] = useState<Order[]>([]);
  const [eventDetailLoading, setEventDetailLoading] = useState(false);
  const [eventDetailError, setEventDetailError] = useState('');

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<EventType | null>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardEditId, setWizardEditId] = useState<string | null>(null);
  const [wizardTargetCohortId, setWizardTargetCohortId] = useState<string | null>(null);
  const [wizardSaving, setWizardSaving] = useState(false);
  const [wizardError, setWizardError] = useState('');

  // Conference fields
  const [confTitle, setConfTitle] = useState('');
  const [confDesc, setConfDesc] = useState('');
  const [confTheme, setConfTheme] = useState('');
  const [confLocation, setConfLocation] = useState('');
  const [confStartDate, setConfStartDate] = useState('');
  const [confEndDate, setConfEndDate] = useState('');
  const [confIsOnline, setConfIsOnline] = useState(false);
  const [confVenue, setConfVenue] = useState('');
  const [confSubdomain, setConfSubdomain] = useState('');
  const [confOnlineLink, setConfOnlineLink] = useState('');
  const [confStartTime, setConfStartTime] = useState('');
  const [confEndTime, setConfEndTime] = useState('');
  const [confFees, setConfFees] = useState<FeeRow[]>([]);
  const [confOrg, setConfOrg] = useState<OrganizerContact>(EMPTY_ORG);
  const [wizardMentorUsername, setWizardMentorUsername] = useState('');
  const [confMedia, setConfMedia] = useState<MediaAssetState>(EMPTY_MEDIA);
  const [confTracks, setConfTracks] = useState<Track[]>([]);
  const [trackImageLoading, setTrackImageLoading] = useState<Record<number, boolean>>({});
  const [confFaqs, setConfFaqs] = useState<FAQ[]>([]);
  const [confPartners, setConfPartners] = useState<EventPartner[]>([]);
  const [confSponsors, setConfSponsors] = useState<EventSponsor[]>([]);
  const [confMediaPartners, setConfMediaPartners] = useState<EventMediaPartner[]>([]);
  const [confOrganizingCommittee, setConfOrganizingCommittee] = useState<OrganizingCommitteeMember[]>([]);
  const [confGuidelines, setConfGuidelines] = useState('');
  const [confTerms, setConfTerms] = useState('');

  // Blog fields
  const [blogTitle, setBlogTitle] = useState('');
  const [blogLabel, setBlogLabel] = useState('');
  const [blogCopy, setBlogCopy] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogBannerUrl, setBlogBannerUrl] = useState('');
  const [blogBannerPreview, setBlogBannerPreview] = useState('');

  // Content section forms
  const [partnerForm, setPartnerForm] = useState<PartnerFormState>(EMPTY_PARTNER_FORM);
  const [collaboratorForm, setCollaboratorForm] = useState<PartnerFormState>(EMPTY_PARTNER_FORM);
  const [exhibitorForm, setExhibitorForm] = useState<PartnerFormState>(EMPTY_PARTNER_FORM);
  const [venueForm, setVenueForm] = useState<VenueFormState>(EMPTY_VENUE_FORM);

  // Profile
  const [profileForm, setProfileForm] = useState<MentorProfile & { avatarPreview?: string }>(EMPTY_PROFILE);

  // Per-event extras
  const [viewingParticipant, setViewingParticipant] = useState<Registration | null>(null);

  // Mentor assignment
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Conference | null>(null);
  const [assignUsername, setAssignUsername] = useState('');

  // Live chat state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatSocketRef = useRef<Socket | null>(null);
  const activeChatIdRef = useRef<string | null>(null);
  const [eventAbstracts, setEventAbstracts] = useState<Abstract[]>([]);
  const [eventEnquiries, setEventEnquiries] = useState<Contact[]>([]);
  const [eventAbstractsLoading, setEventAbstractsLoading] = useState(false);
  const [eventEnquiriesLoading, setEventEnquiriesLoading] = useState(false);
  const [eventBrochureLeads, setEventBrochureLeads] = useState<BrochureLead[]>([]);
  const [eventBrochureLeadsLoading, setEventBrochureLeadsLoading] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Conference | null>(null);
  const [currentEventLoading, setCurrentEventLoading] = useState(false);
  const [abstractActionLoading, setAbstractActionLoading] = useState<string | null>(null);
  const [eventCohorts, setEventCohorts] = useState<CourseCohort[]>([]);
  const [eventCohortsLoading, setEventCohortsLoading] = useState(false);

  // URL-driven event page resolution
  const isEditPath =
    location.includes('/edit/') ||
    location.endsWith('/edit') ||
    new URLSearchParams(window.location.search).get('mode') === 'edit';

  const eventPageTab: EventPageTab =
    (['dashboard', 'details', 'scientific-program', 'color-theme', 'fees', 'participants', 'payments', 'abstracts', 'enquiries', 'brochures',
      'speakers', 'tracks', 'program', 'banners', 'welcome-banner', 'faqs', 'partners', 'sponsors', 'media-partners',
      'guidelines', 'organizer-contact', 'organizing-committee', 'venue-details', 'cohorts', 'live-chat', 'seo-config', 'abstract-template'] as const).find(
      (t) => location.includes(`/${t}`),
    ) || 'details';
  const eventPageType: EventType | null = location.startsWith('/conference/')
    ? 'conference'
    : null;
  const rawEventPageId = eventPageType ? location.split('/')[2] || null : null;
  const isAddMode = rawEventPageId === 'add';
  const eventPageId = isAddMode ? null : rawEventPageId;
  const isEventPage = Boolean(eventPageType && (eventPageId || isAddMode));

  const eventPageMode: 'view' | 'edit' = isAddMode ? 'edit' : (isEditPath ? 'edit' : 'view');

  const searchParams = new URLSearchParams(window.location.search);
  const parentId = searchParams.get('parent');
  const parentDoc = parentId
    ? conferences.find((c) => c._id === parentId)
    : null;
  const initialTitle = parentDoc ? parentDoc.title : (searchParams.get('parentTitle') || '');
  const initialSubdomain = parentDoc ? parentDoc.subdomain : (searchParams.get('parentSubdomain') || '');

  const baseEventPage: Conference | null = isEventPage
    ? (isAddMode
        ? ({
            _id: '',
            title: initialTitle,
            subdomain: initialSubdomain,
            description: '',
            day: '',
            month: '',
            location: '',
            eventDate: '',
            date: 'upcoming',
            announcedBy: user?.username || '',
            fees: [],
            tracks: [],
            speakers: [],
            program: [],
            faqs: [],
            partners: [],
            sponsors: [],
            mediaPartners: [],
            guidelines: '',
            organizingCommittee: [],
            organizerContact: {},
            socialLinks: {},
            gtmCode: '',
            gaCode: '',
            mcCode: '',
            metaTitle: '',
            metaDescription: '',
          } as any as Conference)
        : (currentEvent && currentEvent._id === eventPageId
            ? currentEvent
            : conferences.find((c) => c._id === eventPageId) || null))
    : null;

  // Cohort context for the current event page (e.g. ?cohort=SCC00001-2).
  const eventCohortId = new URLSearchParams(window.location.search).get('cohort');

  const activeCohort: CourseCohort | null = eventCohortId
    ? (eventCohorts.find((c) => c.cohortId === eventCohortId || c._id === eventCohortId) || null)
    : null;

  const eventPage: Conference | null = baseEventPage && activeCohort
    ? ({
        ...baseEventPage,
        title: activeCohort.title || baseEventPage.title,
        subdomain: activeCohort.subdomain || activeCohort.content?.subdomain || baseEventPage.subdomain || '',
        startDate: activeCohort.startDate || baseEventPage.startDate || '',
        endDate: activeCohort.endDate || baseEventPage.endDate || '',
        eventDate: activeCohort.startDate || baseEventPage.eventDate || '',
        assignedMentor: activeCohort.assignedMentor || baseEventPage.assignedMentor || null,
        description: activeCohort.content?.description || baseEventPage.description || '',
        location: activeCohort.content?.location || baseEventPage.location || '',
        venue: activeCohort.content?.venue || baseEventPage.venue || '',
        venueAddress: activeCohort.content?.venueAddress || baseEventPage.venueAddress || '',
        venueMapUrl: activeCohort.content?.venueMapUrl || baseEventPage.venueMapUrl || '',
        speakers: (Array.isArray(activeCohort.content?.speakers) && activeCohort.content.speakers.length > 0) ? activeCohort.content.speakers : (baseEventPage.speakers || []),
        tracks: (Array.isArray(activeCohort.content?.tracks) && activeCohort.content.tracks.length > 0) ? activeCohort.content.tracks : (baseEventPage.tracks || []),
        faqs: (Array.isArray(activeCohort.content?.faqs) && activeCohort.content.faqs.length > 0) ? activeCohort.content.faqs : (baseEventPage.faqs || []),
        fees: (Array.isArray(activeCohort.content?.fees) && activeCohort.content.fees.length > 0) ? activeCohort.content.fees : (baseEventPage.fees || []),
        sponsors: (Array.isArray(activeCohort.content?.sponsors) && activeCohort.content.sponsors.length > 0) ? activeCohort.content.sponsors : (baseEventPage.sponsors || []),
        partners: (Array.isArray(activeCohort.content?.partners) && activeCohort.content.partners.length > 0) ? activeCohort.content.partners : (baseEventPage.partners || []),
        mediaPartners: (Array.isArray(activeCohort.content?.mediaPartners) && activeCohort.content.mediaPartners.length > 0) ? activeCohort.content.mediaPartners : (baseEventPage.mediaPartners || []),
        exhibitors: (Array.isArray(activeCohort.content?.exhibitors) && activeCohort.content.exhibitors.length > 0) ? activeCohort.content.exhibitors : (baseEventPage.exhibitors || []),
        guidelines: activeCohort.content?.guidelines || baseEventPage.guidelines || '',
        organizingCommittee: (Array.isArray(activeCohort.content?.organizingCommittee) && activeCohort.content.organizingCommittee.length > 0) ? activeCohort.content.organizingCommittee : (baseEventPage.organizingCommittee || []),
        venueDetails: (activeCohort.content?.venueDetails && Object.keys(activeCohort.content.venueDetails).length > 0) ? activeCohort.content.venueDetails : (baseEventPage.venueDetails || null),
        program: (Array.isArray(activeCohort.content?.program) && activeCohort.content.program.length > 0) ? activeCohort.content.program : (baseEventPage.program || []),
        headerBanners: (Array.isArray(activeCohort.content?.headerBanners) && activeCohort.content.headerBanners.length > 0) ? activeCohort.content.headerBanners : (baseEventPage.headerBanners || []),
        welcomeBannerTitle: activeCohort.content?.welcomeBannerTitle || baseEventPage.welcomeBannerTitle || '',
        welcomeBannerDescription: activeCohort.content?.welcomeBannerDescription || baseEventPage.welcomeBannerDescription || '',
        themeColor: activeCohort.content?.themeColor || baseEventPage.themeColor || '',
        theme: activeCohort.content?.theme || baseEventPage.theme || '',
        organizerContact: (activeCohort.content?.organizerContact && Object.keys(activeCohort.content.organizerContact).length > 0) ? activeCohort.content.organizerContact : (baseEventPage.organizerContact || {}),
        socialLinks: (activeCohort.content?.socialLinks && Object.keys(activeCohort.content.socialLinks).length > 0) ? activeCohort.content.socialLinks : (baseEventPage.socialLinks || {}),
        brochureUrl: activeCohort.content?.brochureUrl || baseEventPage.brochureUrl || '',
        bannerUrl: activeCohort.content?.bannerUrl || baseEventPage.bannerUrl || '',
        logoUrl: activeCohort.content?.logoUrl || baseEventPage.logoUrl || '',
        scientificProgramUrl: activeCohort.content?.scientificProgramUrl || baseEventPage.scientificProgramUrl || '',
        termsAndConditions: activeCohort.content?.termsAndConditions || baseEventPage.termsAndConditions || '',
        about: activeCohort.content?.about || baseEventPage.about || '',
        terms: activeCohort.content?.terms || baseEventPage.terms || '',
        privacy: activeCohort.content?.privacy || baseEventPage.privacy || '',
        registerSteps: (Array.isArray(activeCohort.content?.registerSteps) && activeCohort.content.registerSteps.length > 0) ? activeCohort.content.registerSteps : (baseEventPage.registerSteps || []),
        brochure: activeCohort.content?.brochure || baseEventPage.brochure || null,
        feeLevels: (Array.isArray(activeCohort.content?.feeLevels) && activeCohort.content.feeLevels.length > 0) ? activeCohort.content.feeLevels : (baseEventPage.feeLevels || []),
        gtmCode: activeCohort.content?.gtmCode || baseEventPage.gtmCode || '',
        gaCode: activeCohort.content?.gaCode || baseEventPage.gaCode || '',
        mcCode: activeCohort.content?.mcCode || baseEventPage.mcCode || '',
        metaTitle: activeCohort.content?.metaTitle || baseEventPage.metaTitle || '',
        metaDescription: activeCohort.content?.metaDescription || baseEventPage.metaDescription || '',
      } as Conference)
    : baseEventPage;

  const setEventPageMode = (mode: 'view' | 'edit') => {
    if (!eventPage || !eventPageType) return;
    const search = new URLSearchParams(window.location.search);
    search.delete('mode');
    const qs = search.toString() ? `?${search.toString()}` : '';
    if (mode === 'edit') {
      navigate(`/${eventPageType}/${eventPage._id}/edit/${eventPageTab}${qs}`);
    } else {
      navigate(`/${eventPageType}/${eventPage._id}/${eventPageTab}${qs}`);
    }
  };

  const openEventPage = (
    item: Conference,
    type: EventType,
    tab: EventPageTab = 'details',
    mode: 'view' | 'edit' = 'view',
  ) => {
    const search = new URLSearchParams();
    const cohortId = (item as any).cohortId;
    if (cohortId) search.set('cohort', cohortId);
    const qs = search.toString() ? `?${search.toString()}` : '';
    if (mode === 'edit') {
      navigate(`/${type}/${item._id}/edit/${tab}${qs}`);
    } else {
      navigate(`/${type}/${item._id}/${tab}${qs}`);
    }
  };

  const createDraftEvent = async (type: EventType): Promise<Conference | null> => {
    if (!user) return null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    try {
      const url = `${API_BASE}/conferences`;
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: 'Untitled' }),
      });
      if (!res.ok) throw new Error('Failed to create draft');
      const item = await res.json();
      refreshData();
      return item;
    } catch {
      return null;
    }
  };

  const navigateToAddEvent = (type: EventType, parent?: Conference) => {
    if (parent) {
      const search = new URLSearchParams();
      if (parent._id) search.set('parent', parent._id);
      if (parent.title) search.set('parentTitle', parent.title);
      if (parent.subdomain) search.set('parentSubdomain', parent.subdomain);
      navigate(`/${type}/add?${search.toString()}`);
    } else {
      navigate(`/${type}/add`);
    }
  };

  const openEventTab = (tab: EventPageTab) => {
    if (!eventPage || !eventPageType) return;
    if (isAddMode) {
      navigate(`/${eventPageType}/add/${tab}`);
      return;
    }
    const search = new URLSearchParams(window.location.search);
    search.delete('mode');
    const qs = search.toString() ? `?${search.toString()}` : '';
    if (eventPageMode === 'edit') {
      navigate(`/${eventPageType}/${eventPage._id}/edit/${tab}${qs}`);
    } else {
      navigate(`/${eventPageType}/${eventPage._id}/${tab}${qs}`);
    }
  };

  const openCohortTab = (cohort: CourseCohort, tab: EventPageTab) => {
    if (!eventPage || !eventPageType) return;
    const search = new URLSearchParams(window.location.search);
    search.set('cohort', cohort.cohortId || cohort._id);
    search.delete('mode');
    const qs = search.toString() ? `?${search.toString()}` : '';
    if (eventPageMode === 'edit') {
      navigate(`/${eventPageType}/${eventPage._id}/edit/${tab}?${search.toString()}`);
    } else {
      navigate(`/${eventPageType}/${eventPage._id}/${tab}?${search.toString()}`);
    }
  };

  const openCohortTabEdit = (cohort: CourseCohort, tab: EventPageTab) => {
    if (!eventPage || !eventPageType) return;
    const search = new URLSearchParams(window.location.search);
    search.set('cohort', cohort.cohortId || cohort._id);
    navigate(`/${eventPageType}/${eventPage._id}/edit/${tab}?${search.toString()}`);
  };

  const closeEventPage = () => {
    setCurrentEvent(null);
    navigate('/');
  };

  const updateEventField = async (field: string, value: any) => {
    if (!eventPage || !eventPageType) return;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-role': user?.role || '',
      'x-user-name': user?.username || '',
    };

    // If a specific cohort is active, update that cohort's content instead.
    if (activeCohort) {
      try {
        const content = { ...(activeCohort.content || {}), [field]: value };
        const res = await fetch(`${API_BASE}/cohorts/${activeCohort._id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ content }),
        });
        if (res.ok) {
          await loadCohorts();
        }
      } catch (error) {
        console.error('Failed to update cohort field:', error);
      }
      return;
    }

    const endpoint = 'conferences';
    try {
      const res = await fetch(`${API_BASE}/${endpoint}/${eventPage._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ [field]: value }),
      });
      
      if (res.ok) {
        const updated = await res.json();
        setCurrentEvent(updated);
        setConferences((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      }
    } catch (error) {
      console.error('Failed to update event field:', error);
    }
  };

  const updateEventFields = async (fields: Record<string, any>): Promise<boolean> => {
    if (!eventPage || !eventPageType) return false;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-role': user?.role || '',
      'x-user-name': user?.username || '',
    };

    if (activeCohort) {
      try {
        const content = { ...(activeCohort.content || {}), ...fields };
        const res = await fetch(`${API_BASE}/cohorts/${activeCohort._id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ content }),
        });
        if (res.ok) {
          await loadCohorts();
          return true;
        }
      } catch (error) {
        console.error('Failed to update cohort fields:', error);
      }
      return false;
    }

    const endpoint = 'conferences';
    const search = new URLSearchParams(window.location.search);
    const parentId = search.get('parent');

    if (isAddMode && parentId) {
      try {
        const res = await fetch(`${API_BASE}/${endpoint}/${parentId}/cohorts`, {
          method: 'POST',
          headers,
          body: JSON.stringify(fields),
        });
        if (res.ok) {
          await loadCohorts();
          navigate(`/${eventPageType}/${parentId}/cohorts`);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Failed to create cohort under parent:', err);
        return false;
      }
    }

    try {
      const isCreating = isAddMode || !eventPage._id;
      const url = isCreating
        ? `${API_BASE}/${endpoint}`
        : `${API_BASE}/${endpoint}/${eventPage._id}`;
      const res = await fetch(url, {
        method: isCreating ? 'POST' : 'PUT',
        headers,
        body: JSON.stringify(fields),
      });

      if (res.ok) {
        const updated = await res.json();
        setCurrentEvent(updated);
        setConferences((prev) => isCreating ? [...prev, updated] : prev.map((c) => (c._id === updated._id ? updated : c)));
        if (isCreating) {
          navigate(`/${eventPageType}/${updated._id}/edit/${eventPageTab}`);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update event fields:', error);
      return false;
    }
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setWizardType(null);
    setWizardStep(1);
    setWizardEditId(null);
    setWizardTargetCohortId(null);
    setWizardError('');
    resetWizardFields();
  };

  const goToTab = (tab: Tab) => {
    if (tab !== activeTab) {
      closeWizard();
      setPartnerForm(EMPTY_PARTNER_FORM);
      setCollaboratorForm(EMPTY_PARTNER_FORM);
      setExhibitorForm(EMPTY_PARTNER_FORM);
      setVenueForm(EMPTY_VENUE_FORM);
      setShowForm(false);
    }
    setActiveTab(tab);
    navigate('/');
    window.location.hash = tab;
  };

  const resetWizardFields = () => {
    setConfTitle(''); setConfDesc(''); setConfTheme(''); setConfLocation(''); setConfStartDate(''); setConfEndDate('');
    setConfIsOnline(false); setConfVenue(''); setConfSubdomain(''); setConfOnlineLink('');
    setConfStartTime(''); setConfEndTime(''); setConfFees([]); setConfOrg(EMPTY_ORG);
    setConfMedia(EMPTY_MEDIA); setConfTracks([]);
    setWizardMentorUsername('');
    setConfFaqs([]); setConfPartners([]); setConfSponsors([]); setConfMediaPartners([]); setConfOrganizingCommittee([]); setConfGuidelines(''); setConfTerms('');
    setBlogTitle(''); setBlogLabel(''); setBlogCopy(''); setBlogContent('');
    setBlogBannerUrl(''); setBlogBannerPreview('');
  };

  const loadProfile = async () => {
    if (!user) return;
    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    try {
      const profileRes = await fetch(`${API_BASE}/mentors/me`, { headers });
      if (profileRes.ok) {
        const prof = await profileRes.json();
        setProfile(prof);
        setProfileForm({ ...prof, avatarPreview: prof.avatar ? mediaUrl(prof.avatar) : '' });
      } else {
        setProfile(null);
        setProfileForm((cur) => ({ ...cur, username: user.username }));
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    }
  };

  const loadTabData = async (tab: Tab) => {
    if (!user) return;
    const now = Date.now();
    const cacheKey = `tab:${tab}`;
    if (lastFetched.current[cacheKey] && now - lastFetched.current[cacheKey] < CACHE_TTL) return;
    setLoadingData(true);
    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    const isAdmin = user.role === 'admin';

    const fetchInto = async (url: string, setter: (d: any) => void) => {
      const res = await fetch(url, { headers });
      if (res.ok) setter(await res.json());
    };

    try {
      switch (tab) {
        case 'overview':
          await fetchInto(`${API_BASE}/stats`, setDashboardStats);
          break;
        case 'conferences':
          await fetchInto(`${API_BASE}/conferences?summary=true`, setConferences);
          break;
        case 'blogs':
          await fetchInto(`${API_BASE}/blogs`, setBlogs);
          break;
        case 'gallery':
          await fetchInto(`${API_BASE}/gallery`, setGalleryItems);
          break;
        case 'mediaPartners':
          await fetchInto(`${API_BASE}/media-partners`, setMediaPartners);
          break;
        case 'collaborators':
          await fetchInto(`${API_BASE}/collaborators`, setCollaborators);
          break;
        case 'venues':
          await fetchInto(`${API_BASE}/venues`, setVenues);
          break;
        case 'mentors':
          await fetchInto(`${API_BASE}/mentors`, setMentors);
          break;
        case 'brochure':
        case 'abstractTemplate':
        case 'userWebsite':
          await Promise.all([
            fetchInto(`${API_BASE}/media-partners`, setMediaPartners),
            fetchInto(`${API_BASE}/collaborators`, setCollaborators),
            fetchInto(`${API_BASE}/venues`, setVenues),
            fetchInto(`${API_BASE}/mentors`, setMentors),
            fetchInto(`${API_BASE}/gallery`, setGalleryItems),
            loadMainBrochure(),
            loadAbstractTemplate(),
          ]);
          break;
        case 'liveChat':
          await loadChatSessions();
          break;
        default:
          break;
      }
      lastFetched.current[cacheKey] = Date.now();
    } catch (e) {
      console.error('Failed to load data from backend API server', e);
    } finally {
      setLoadingData(false);
    }
  };

  // Reloads current tab data. If on an event page, also refreshes that event.
  const refreshData = async () => {
    if (!user) return;
    // Invalidate cache for current tab so it re-fetches
    lastFetched.current[`tab:${activeTab}`] = 0;
    await loadTabData(activeTab);
    // If on an event page, invalidate and re-fetch the single event
    if (isEventPage && eventPageId && eventPageType) {
      lastFetched.current[`evt:${eventPageId}:dashboard`] = 0;
      lastFetched.current[`evt:${eventPageId}:participants`] = 0;
      lastFetched.current[`evt:${eventPageId}:payments`] = 0;
      lastFetched.current[`evt:${eventPageId}:abstracts`] = 0;
      lastFetched.current[`evt:${eventPageId}:enquiries`] = 0;
      const endpoint = 'conferences';
      try {
        const res = await fetch(`${API_BASE}/${endpoint}/${eventPageId}`, {
          headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        });
        if (res.ok) setCurrentEvent(await res.json());
      } catch { /* ignore */ }
    }
  };

  const refreshEventCohortState = async () => {
    if (!isEventPage || !eventPageId || !eventPageType || !user) return;
    const endpoint = 'conferences';
    try {
      const res = await fetch(`${API_BASE}/${endpoint}/${eventPageId}`, {
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
      });
      if (res.ok) setCurrentEvent(await res.json());
    } catch { /* ignore */ }
  };

  const loadCohorts = async () => {
    if (!eventPage || !eventPageType || !eventPage._id) return;
    const headers: Record<string, string> = {
      'x-user-role': user?.role || '',
      'x-user-name': user?.username || '',
    };
    const endpoint = 'conferences';
    setEventCohortsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${endpoint}/${eventPage._id}/cohorts`, { headers });
      if (res.ok) setEventCohorts(await res.json());
    } catch (err) {
      console.error('Load cohorts error:', err);
    } finally {
      setEventCohortsLoading(false);
    }
  };

  const createCohort = async (payload: Partial<CourseCohort>) => {
    if (!eventPage || !eventPageType || !user) return;
    const endpoint = 'conferences';
    const res = await fetch(`${API_BASE}/${endpoint}/${eventPage._id}/cohorts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create cohort');
    await loadCohorts();
    await refreshEventCohortState();
  };

  const updateCohort = async (cohortId: string, payload: Partial<CourseCohort>) => {
    if (!user) return;
    const res = await fetch(`${API_BASE}/cohorts/${cohortId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update cohort');
    await loadCohorts();
    await refreshEventCohortState();
  };

  const setCurrentCohort = async (cohortId: string) => {
    if (!user) return;
    const res = await fetch(`${API_BASE}/cohorts/${cohortId}/set-current`, {
      method: 'PUT',
      headers: { 'x-user-role': user.role, 'x-user-name': user.username },
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to set current cohort');
    await loadCohorts();
    await refreshEventCohortState();
  };

  const deleteCohort = async (cohortId: string) => {
    if (!user) return;
    const res = await fetch(`${API_BASE}/cohorts/${cohortId}`, {
      method: 'DELETE',
      headers: { 'x-user-role': user.role, 'x-user-name': user.username },
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete cohort');
    await loadCohorts();
    await refreshEventCohortState();
  };

  const assignCohortMentor = async (cohortId: string, assignedMentor: string | null) => {
    if (!user) return;
    const res = await fetch(`${API_BASE}/cohorts/${cohortId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username },
      body: JSON.stringify({ assignedMentor: assignedMentor || null }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to assign mentor');
    await loadCohorts();
    await refreshEventCohortState();
  };

  const loadEventTabData = async () => {
    if (!eventPage || !eventPageType) return;
    const headers: Record<string, string> = {
      'x-user-role': user?.role || '',
      'x-user-name': user?.username || '',
    };
    const endpoint = 'conferences';
    const tab = eventPageTab;
    const now = Date.now();
    const cohortParam = eventCohortId ? `&cohortId=${encodeURIComponent(eventCohortId)}` : '';

    try {
      // dashboard tab - stats only
      if (tab === 'dashboard') {
        const cacheKey = `evt:${eventPage._id}:dashboard`;
        if (lastFetched.current[cacheKey] && now - lastFetched.current[cacheKey] < CACHE_TTL) return;
        setEventDetailError('');
        setEventDetailLoading(true);
        try {
          const res = await fetch(`${API_BASE}/${endpoint}/${eventPage._id}/dashboard${cohortParam ? '?' + cohortParam.slice(1) : ''}`, { headers });
          if (!res.ok) throw new Error('Failed to load event dashboard');
          setEventDashboard(await res.json());
          lastFetched.current[cacheKey] = Date.now();
        } catch (err: any) {
          console.error('Load event dashboard error:', err);
          setEventDetailError(err.message || 'Failed to load event dashboard');
        } finally {
          setEventDetailLoading(false);
        }
      }

      // participants tab - participants only
      if (tab === 'participants') {
        const cacheKey = `evt:${eventPage._id}:participants`;
        if (lastFetched.current[cacheKey] && now - lastFetched.current[cacheKey] < CACHE_TTL) return;
        setEventDetailError('');
        setEventDetailLoading(true);
        try {
          const res = await fetch(`${API_BASE}/${endpoint}/${eventPage._id}/participants${cohortParam ? '?' + cohortParam.slice(1) : ''}`, { headers });
          if (!res.ok) throw new Error('Failed to load participants');
          const data = await res.json();
          setEventParticipants(data.participants || []);
          lastFetched.current[cacheKey] = Date.now();
        } catch (err: any) {
          console.error('Load participants error:', err);
          setEventDetailError(err.message || 'Failed to load participants');
        } finally {
          setEventDetailLoading(false);
        }
      }

      // payments tab - payments only
      if (tab === 'payments') {
        const cacheKey = `evt:${eventPage._id}:payments`;
        if (lastFetched.current[cacheKey] && now - lastFetched.current[cacheKey] < CACHE_TTL) return;
        setEventDetailError('');
        setEventDetailLoading(true);
        try {
          const res = await fetch(`${API_BASE}/${endpoint}/${eventPage._id}/payments${cohortParam ? '?' + cohortParam.slice(1) : ''}`, { headers });
          if (!res.ok) throw new Error('Failed to load payments');
          const data = await res.json();
          setEventPayments(data.payments || []);
          lastFetched.current[cacheKey] = Date.now();
        } catch (err: any) {
          console.error('Load payments error:', err);
          setEventDetailError(err.message || 'Failed to load payments');
        } finally {
          setEventDetailLoading(false);
        }
      }

      // abstracts tab
      if (tab === 'abstracts') {
        const cacheKey = `evt:${eventPage._id}:abstracts`;
        if (lastFetched.current[cacheKey] && now - lastFetched.current[cacheKey] < CACHE_TTL) return;
        setEventAbstractsLoading(true);
        try {
          const res = await fetch(`${API_BASE}/${endpoint}/${eventPage._id}/abstracts${cohortParam ? '?' + cohortParam.slice(1) : ''}`, { headers });
          if (res.ok) setEventAbstracts(await res.json());
          lastFetched.current[cacheKey] = Date.now();
        } catch (err) {
          console.error('Load event abstracts error:', err);
        } finally {
          setEventAbstractsLoading(false);
        }
      }

      // enquiries tab
      if (tab === 'enquiries') {
        const cacheKey = `evt:${eventPage._id}:enquiries`;
        if (lastFetched.current[cacheKey] && now - lastFetched.current[cacheKey] < CACHE_TTL) return;
        setEventEnquiriesLoading(true);
        try {
          const res = await fetch(`${API_BASE}/${endpoint}/${eventPage._id}/enquiries${cohortParam ? '?' + cohortParam.slice(1) : ''}`, { headers });
          if (res.ok) setEventEnquiries(await res.json());
          lastFetched.current[cacheKey] = Date.now();
        } catch (err) {
          console.error('Load event enquiries error:', err);
        } finally {
          setEventEnquiriesLoading(false);
        }
      }

      // brochure leads tab
      if (tab === 'brochures') {
        const cacheKey = `evt:${eventPage._id}:brochures`;
        if (lastFetched.current[cacheKey] && now - lastFetched.current[cacheKey] < CACHE_TTL) return;
        setEventBrochureLeadsLoading(true);
        try {
          const res = await fetch(`${API_BASE}/brochure-requests?eventId=${eventPage._id}`, { headers });
          if (res.ok) setEventBrochureLeads(await res.json());
          lastFetched.current[cacheKey] = Date.now();
        } catch (err) {
          console.error('Load brochure leads error:', err);
        } finally {
          setEventBrochureLeadsLoading(false);
        }
      }

      // cohorts tab
      if (tab === 'cohorts') {
        await loadCohorts();
      }
    } catch (err) {
      console.error('Load event tab data error:', err);
    }
  };

  const handleAbstractAction = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    if (!user) return;
    setAbstractActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/abstracts/${id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to ${action} abstract`);
      }
      const updated = await res.json();
      setAbstracts((prev) => prev.map((a) => (a._id === id ? updated : a)));
      setEventAbstracts((prev) => prev.map((a) => (a._id === id ? updated : a)));
    } catch (err: any) {
      console.error(`Abstract ${action} error:`, err);
      alert(err.message || `Failed to ${action} abstract`);
    } finally {
      setAbstractActionLoading(null);
    }
  };

  const loadChatSessions = async (conferenceId?: string | null, scope?: 'main' | 'conference', eventId?: string | null) => {
    if (!user) return;
    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    try {
      const params = new URLSearchParams();
      if (conferenceId) params.set('conferenceId', conferenceId);
      if (eventId) params.set('eventId', eventId);
      if (scope) params.set('scope', scope);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/chat/sessions${query}`, { headers });
      if (res.ok) setChatSessions(await res.json());
    } catch (err) {
      console.error('Load chat sessions error:', err);
    }
  };

  const loadChatMessages = async (sessionId: string) => {
    if (!user) return;
    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}/messages`, { headers });
      if (res.ok) setActiveChatMessages(await res.json());
    } catch (err) {
      console.error('Load chat messages error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const selectChat = (sessionId: string | null) => {
    setActiveChatId(sessionId);
    activeChatIdRef.current = sessionId;
    if (sessionId) {
      loadChatMessages(sessionId);
      markChatRead(sessionId);
      chatSocketRef.current?.emit('admin:join', sessionId);
    } else {
      setActiveChatMessages([]);
    }
  };

  const sendChatReply = async (text: string) => {
    if (!user || !activeChatId) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    const session = chatSessions.find((s) => s._id === activeChatId);
    const socket = chatSocketRef.current;
    if (socket) {
      socket.emit('admin:message', {
        sessionId: activeChatId,
        visitorId: session?.visitorId,
        senderName: user.username,
        text: trimmed
      });
      return;
    }

    // Fallback: REST append if socket is not connected
    try {
      const res = await fetch(`${API_BASE}/chat/sessions/${activeChatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
        body: JSON.stringify({ text: trimmed, senderName: user.username })
      });
      if (!res.ok) throw new Error('Failed to send reply');
      const message = await res.json();
      setActiveChatMessages((prev) => [...prev, message]);
    } catch (err) {
      console.error('Send chat reply error:', err);
    }
  };

  const markChatRead = async (sessionId: string) => {
    if (!user) return;
    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    try {
      await fetch(`${API_BASE}/chat/sessions/${sessionId}/read`, { method: 'POST', headers });
      setChatSessions((prev) => prev.map((s) => (s._id === sessionId ? { ...s, unreadByAdmin: 0 } : s)));
    } catch (err) {
      console.error('Mark chat read error:', err);
    }
  };

  const setChatStatus = async (sessionId: string, status: 'open' | 'closed') => {
    if (!user) return;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    try {
      const res = await fetch(`${API_BASE}/chat/sessions/${sessionId}/status`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setChatSessions((prev) => prev.map((s) => (s._id === sessionId ? updated : s)));
      }
    } catch (err) {
      console.error('Set chat status error:', err);
    }
  };

  // Sync tab from URL hash (handles browser back/forward and manual hash edits)
  useEffect(() => {
    // Skip hash sync when on event pages (path-based routing)
    const currentPath = window.location.pathname;
    const isOnEventPage = currentPath.startsWith('/conference/');
    if (!isOnEventPage && !window.location.hash) {
      window.location.hash = activeTab;
    }
    const onHashChange = () => {
      const tab = getTabFromHash();
      setActiveTab((prev) => (prev === tab ? prev : tab));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Realtime socket for the team member
  useEffect(() => {
    if (!user) return;
    loadChatSessions();

    const socket = io(SERVER_ORIGIN, {
      query: { role: user.role, username: user.username }
    });
    chatSocketRef.current = socket;

    socket.on('admin:message', (payload: { session: ChatSession; message: ChatMessage }) => {
      setChatSessions((prev) => {
        const exists = prev.some((s) => s._id === payload.session._id);
        if (exists) {
          return prev
            .map((s) => (s._id === payload.session._id ? payload.session : s))
            .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        }
        return [payload.session, ...prev];
      });
      setActiveChatMessages((prev) => {
        if (activeChatIdRef.current === payload.session._id) {
          if (prev.some((m) => m._id === payload.message._id)) return prev;
          return [...prev, payload.message];
        }
        return prev;
      });
    });

    socket.on('admin:typing', (payload: { visitorId: string; typing: boolean }) => {
      // Optional: could surface "visitor is typing" in the active session
    });

    // The team member's own replies echo back through the session room
    socket.on('chat:message', (message: ChatMessage) => {
      if (message.sender !== 'admin') return;
      setActiveChatMessages((prev) => {
        if (activeChatIdRef.current === message.sessionId) {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
      chatSocketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user && !isEventPage) loadTabData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  useEffect(() => {
    loadEventTabData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventPageId, eventPageType, eventPageTab, user, currentEvent, eventCohortId]);

  // Load cohorts on every event page load so activeCohort resolves
  // for content tabs (fees, speakers, etc.) not just the cohorts tab.
  useEffect(() => {
    if (!isEventPage || !eventPage || !eventPageType) return;
    loadCohorts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventPage?._id, isEventPage]);

  // Load venues and mentors when on event page (for organizer contact & venue details tabs)
  useEffect(() => {
    if (!isEventPage || !user) return;
    ensureMentorsAndVenues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEventPage]);

  // Fetch the full single event by ID when navigating to the event page,
  // so the details/content tabs always have complete data.
  useEffect(() => {
    if (!isEventPage || !eventPageId || !eventPageType || !user) return;
    const endpoint = 'conferences';
    const cacheKey = `evt:${eventPageId}:detail`;
    const now = Date.now();
    if (lastFetched.current[cacheKey] && now - lastFetched.current[cacheKey] < CACHE_TTL) return;
    let active = true;
    setCurrentEventLoading(true);
    fetch(`${API_BASE}/${endpoint}/${eventPageId}`, {
      headers: { 'x-user-role': user.role, 'x-user-name': user.username },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Not found'))))
      .then((data) => { if (active) { setCurrentEvent(data); lastFetched.current[cacheKey] = Date.now(); } })
      .catch(() => { if (active) setCurrentEvent(null); })
      .finally(() => { if (active) setCurrentEventLoading(false); });
    return () => { active = false; };
  }, [isEventPage, eventPageId, eventPageType, user]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Login failed');
      }

      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.user));
        extendSession();
        setUser(data.user);
        setUsernameInput('');
        setPasswordInput('');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Connection to database server failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
  };

  // Sliding 4-hour admin session: any interaction extends the window, idle expiry logs out.
  useEffect(() => {
    if (!user) return;
    if (!isSessionActive()) {
      clearSession();
      setUser(null);
      return;
    }

    let lastTouch = Date.now();
    const touch = () => {
      const now = Date.now();
      if (now - lastTouch < SESSION_TOUCH_INTERVAL_MS) return;
      lastTouch = now;
      extendSession(now);
    };
    SESSION_ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, touch, { passive: true }));
    extendSession(lastTouch);

    const timer = window.setInterval(() => {
      if (isSessionActive()) return;
      clearSession();
      setUser(null);
    }, SESSION_CHECK_INTERVAL_MS);

    return () => {
      SESSION_ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, touch));
      window.clearInterval(timer);
    };
  }, [user]);

  const openAddForm = (type: EditableType) => {
    setEditingItemType(type);
    setEditingItemId(null);
    if (type === 'blog') {
      resetWizardFields();
      setShowForm(true);
      return;
    }
    resetWizardFields();
    setWizardType(type);
    setWizardStep(1);
    setWizardEditId(null);
    setWizardTargetCohortId(null);
    setWizardError('');
    setWizardOpen(true);
    // Lazy-load mentors and venues for the wizard dropdowns
    ensureMentorsAndVenues();
  };

  const ensureMentorsAndVenues = async (force = false) => {
    if (!user) return;
    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };
    const now = Date.now();
    try {
      const needs = [];
      const mKey = 'wizard:mentors';
      const vKey = 'wizard:venues';
      if (force || mentors.length === 0 || !(lastFetched.current[mKey] && now - lastFetched.current[mKey] < CACHE_TTL)) {
        needs.push(fetch(`${API_BASE}/mentors`, { headers }).then((r) => (r.ok ? r.json() : Promise.resolve(null))).then((d) => { if (d) { setMentors(d); lastFetched.current[mKey] = Date.now(); } }));
      }
      if (force || venues.length === 0 || !(lastFetched.current[vKey] && now - lastFetched.current[vKey] < CACHE_TTL)) {
        needs.push(fetch(`${API_BASE}/venues`, { headers }).then((r) => (r.ok ? r.json() : Promise.resolve(null))).then((d) => { if (d) { setVenues(d); lastFetched.current[vKey] = Date.now(); } }));
      }
      await Promise.all(needs);
    } catch (err) {
      console.error('Load mentors/venues error:', err);
    }
  };

  const openEditForm = (item: any, type: EditableType) => {
    setEditingItemType(type);
    setEditingItemId(item._id);
    if (type === 'blog') {
      setBlogTitle(item.title);
      setBlogLabel(item.label);
      setBlogCopy(item.copy);
      setBlogContent(item.content);
      setBlogBannerUrl(item.bannerUrl || '');
      setBlogBannerPreview('');
      setShowForm(true);
      return;
    }
    if (type === 'conference') {
      setWizardTargetCohortId(null);
      populateEditWizard(item, type as 'conference');
      if (item._id) {
        const endpoint = 'conferences';
        fetch(`${API_BASE}/${endpoint}/${item._id}`, {
          headers: { 'x-user-role': user?.role || '', 'x-user-name': user?.username || '' },
        })
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load event'))))
          .then((data) => populateEditWizard(data, type as 'conference'))
          .catch((err) => console.error('Fetch event for edit error:', err));
      }
      return;
    }
  };

  const populateEditWizard = (item: any, type: 'conference') => {
    resetWizardFields();
    setWizardType(type);
    setWizardEditId(item._id);
    setWizardError('');
    setWizardOpen(true);
    ensureMentorsAndVenues();

    // Pre-fill the assigned mentor (and its contact) when editing
    if (item.assignedMentor) {
      setWizardMentorUsername(item.assignedMentor);
      const mentor = mentors.find((m) => m.username === item.assignedMentor);
      if (mentor) {
        const org = { name: mentor.fullName || item.assignedMentor, email: mentor.email || '', phone: mentor.phone || '' };
        setConfOrg(org);
      }
    }

    const mapTracks = (tracks: any[]): Track[] =>
      Array.isArray(tracks)
        ? tracks.map((t: any) => ({
            title: t.title || '',
            description: t.description || '',
            image: t.image || '',
            imagePreview: mediaUrl(t.image || ''),
            referenceLinks: Array.isArray(t.referenceLinks)
              ? t.referenceLinks.map((l: any) => ({ label: l.label || '', url: l.url || '' }))
              : [],
          }))
        : [];

    const splitLocation = (loc: string) => {
      const isOnline = loc && /online/i.test(loc);
      if (isOnline) {
        const parts = loc.split(/[·•|:-]/);
        const link = parts.length > 1 ? parts.slice(1).join('·').trim() : '';
        return { isOnline: true, venue: '', onlineLink: link };
      }
      return { isOnline: false, venue: loc, onlineLink: '' };
    };

    if (type === 'conference') {
      setConfTitle(item.title);
      setConfDesc(item.description || '');
      setConfTheme(item.theme || '');
      setConfLocation(item.location);
      setConfStartTime(item.startTime || '');
      setConfEndTime(item.endTime || '');
      setConfFees(Array.isArray(item.fees) ? item.fees.map((f: any) => ({ label: f.label || '', amount: Number(f.amount) || 0 })) : []);
      setConfTracks(mapTracks(item.tracks));
      setConfOrg({ name: item.organizerContact?.name || '', email: item.organizerContact?.email || '', phone: item.organizerContact?.phone || '' });
      const confHeaderBanners = Array.isArray(item.headerBanners) ? item.headerBanners : [];
      setConfMedia({
        brochureUrl: item.brochureUrl || '', bannerUrl: item.bannerUrl || '', logoUrl: item.logoUrl || '',
        headerBanners: confHeaderBanners,
        brochurePreview: mediaUrl(item.brochureUrl || ''), bannerPreview: mediaUrl(item.bannerUrl || ''), logoPreview: mediaUrl(item.logoUrl || ''),
        headerBannersPreviews: confHeaderBanners.map((u: string) => mediaUrl(u)),
      });
      const parsedDates = parseStartAndEndDates(item.eventDate, item.day);
      setConfStartDate(parsedDates.start);
      setConfEndDate(parsedDates.end);
      const loc = splitLocation(item.location);
      setConfIsOnline(loc.isOnline);
      setConfOnlineLink(loc.onlineLink);
      setConfVenue(loc.venue);
      setConfSubdomain(item.subdomain || '');
      setConfFaqs(Array.isArray(item.faqs) ? item.faqs : []);
      const confPartnerList = (Array.isArray(item.partners) && item.partners.length > 0)
        ? item.partners
        : (Array.isArray(item.sponsors) && item.sponsors.length > 0)
          ? item.sponsors
          : (Array.isArray(item.exhibitors) && item.exhibitors.length > 0)
            ? item.exhibitors
            : [];
      setConfPartners(confPartnerList.map((p: any, idx: number) => ({
        title: p.title || p.name || '',
        order: typeof p.order === 'number' ? p.order : idx,
      })));
      setConfSponsors(
        Array.isArray(item.sponsors)
          ? item.sponsors.map((s: any) => ({ name: s.name || '', logo: s.logo || '' }))
          : []
      );
      setConfMediaPartners(
        Array.isArray(item.mediaPartners)
          ? item.mediaPartners.map((m: any) => ({ name: m.name || '', logo: m.logo || '' }))
          : []
      );
      setConfOrganizingCommittee(
        Array.isArray(item.organizingCommittee)
          ? item.organizingCommittee.map((m: any) => ({
              name: m.name || '',
              image: m.image || '',
              imagePreview: mediaUrl(m.image || ''),
              degree: m.degree || '',
              specialization: m.specialization || '',
              country: m.country || '',
              biography: m.biography || '',
              researchArea: m.researchArea || '',
            }))
          : []
      );
      setConfGuidelines(item.guidelines || '');
      setConfTerms(item.termsAndConditions || '');
    }
  };

  const openEditCohortContent = (cohort: CourseCohort) => {
    if (!eventPage || !eventPageType) return;
    const content = cohort.content || {};
    const item = {
      ...content,
      _id: cohort._id,
      title: eventPage.title || content.title || '',
      subdomain: eventPage.subdomain || content.subdomain || '',
      slug: eventPage.slug || content.slug || '',
      assignedMentor: eventPage.assignedMentor ?? content.assignedMentor ?? null,
      speaker: content.speaker || (eventPage as any).speaker || '',
    };
    setWizardTargetCohortId(cohort._id);
    populateEditWizard(item, eventPageType);
  };

  // Wizard getters/setters
  const wizardFees = () => confFees;
  const setWizardFees = (fees: FeeRow[]) => setConfFees(fees);
  const wizardOrg = () => confOrg;
  const setWizardOrg = (org: OrganizerContact) => setConfOrg(org);
  const wizardMentor = () => wizardMentorUsername;
  const setWizardMentor = (v: string) => setWizardMentorUsername(v);
  const selectMentor = (username: string) => {
    setWizardMentorUsername(username);
    const mentor = mentors.find((m) => m.username === username);
    if (mentor) {
      setWizardOrg({ name: mentor.fullName || username, email: mentor.email || '', phone: mentor.phone || '' });
    }
  };

  // Once mentors load, pre-fill the organizer contact from the assigned mentor
  useEffect(() => {
    if (!wizardMentorUsername) return;
    const mentor = mentors.find((m) => m.username === wizardMentorUsername);
    if (mentor) {
      setWizardOrg({ name: mentor.fullName || wizardMentorUsername, email: mentor.email || '', phone: mentor.phone || '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentors, wizardMentorUsername]);
  const wizardMedia = () => confMedia;
  const setWizardMedia = (m: SetStateAction<MediaAssetState>) => setConfMedia(m);
  const wizardTracks = () => confTracks;
  const setWizardTracks = (tracks: SetStateAction<Track[]>) => setConfTracks(tracks);
  const wizardFaqs = () => confFaqs;
  const setWizardFaqs = (v: SetStateAction<FAQ[]>) => setConfFaqs(v);
  const wizardPartners = () => confPartners;
  const setWizardPartners = (v: SetStateAction<EventPartner[]>) => setConfPartners(v);
  const wizardSponsors = () => confSponsors;
  const setWizardSponsors = (v: SetStateAction<EventSponsor[]>) => setConfSponsors(v);
  const wizardMediaPartners = () => confMediaPartners;
  const setWizardMediaPartners = (v: SetStateAction<EventMediaPartner[]>) => setConfMediaPartners(v);
  const wizardOrganizingCommittee = () => confOrganizingCommittee;
  const setWizardOrganizingCommittee = (v: SetStateAction<OrganizingCommitteeMember[]>) => setConfOrganizingCommittee(v);
  const wizardGuidelines = () => confGuidelines;
  const setWizardGuidelines = (v: string) => setConfGuidelines(v);
  const wizardTerms = () => confTerms;
  const setWizardTerms = (v: string) => setConfTerms(v);
  const wizardTitle = () => confTitle;
  const setWizardTitle = (v: string) => setConfTitle(v);
  const wizardDesc = () => confDesc;
  const setWizardDesc = (v: string) => setConfDesc(v);
  const wizardTheme = () => confTheme;
  const setWizardTheme = (v: string) => setConfTheme(v);
  const wizardStartDate = () => confStartDate;
  const setWizardStartDate = (v: string) => setConfStartDate(v);
  const wizardEndDate = () => confEndDate;
  const setWizardEndDate = (v: string) => setConfEndDate(v);
  const wizardIsOnline = () => confIsOnline;
  const setWizardIsOnline = (v: boolean) => setConfIsOnline(v);
  const wizardVenue = () => confVenue;
  const setWizardVenue = (v: string) => setConfVenue(v);
  const wizardSubdomain = () => confSubdomain;
  const setWizardSubdomain = (v: string) => setConfSubdomain(v);
  const wizardOnlineLink = () => confOnlineLink;
  const setWizardOnlineLink = (v: string) => setConfOnlineLink(v);
  const wizardStartTime = () => confStartTime;
  const setWizardStartTime = (v: string) => setConfStartTime(v);
  const wizardEndTime = () => confEndTime;
  const setWizardEndTime = (v: string) => setConfEndTime(v);

  const addFeeRow = () => setWizardFees([...wizardFees(), { label: '', amount: 0 }]);
  const updateFeeRow = (index: number, field: 'label' | 'amount', value: string) => {
    const next = [...wizardFees()];
    if (field === 'label') next[index].label = value;
    else next[index].amount = Number(value) || 0;
    setWizardFees(next);
  };
  const removeFeeRow = (index: number) => setWizardFees(wizardFees().filter((_, i) => i !== index));

  const addFaq = () => setWizardFaqs([...wizardFaqs(), { question: '', answer: '', category: '', order: 0 }]);
  const updateFaq = (index: number, field: keyof FAQ, value: string | number) => {
    const next = [...wizardFaqs()];
    next[index] = { ...next[index], [field]: value };
    setWizardFaqs(next);
  };
  const removeFaq = (index: number) => setWizardFaqs(wizardFaqs().filter((_, i) => i !== index));

  const addPartner = () => setWizardPartners([...wizardPartners(), { title: '', order: 0 }]);
  const updatePartner = (index: number, field: keyof EventPartner, value: string) => {
    const next = [...wizardPartners()];
    next[index] = { ...next[index], [field]: value };
    setWizardPartners(next);
  };
  const removePartner = (index: number) => setWizardPartners(wizardPartners().filter((_, i) => i !== index));

  const addSponsor = () => setWizardSponsors([...wizardSponsors(), { name: '', logo: '' }]);
  const updateSponsor = (index: number, field: keyof EventSponsor, value: string) => {
    const next = [...wizardSponsors()];
    if (!next[index]) next[index] = { name: '', logo: '' };
    next[index] = { ...next[index], [field]: value };
    setWizardSponsors(next);
  };
  const removeSponsor = (index: number) => setWizardSponsors(wizardSponsors().filter((_, i) => i !== index));
  const handleSponsorLogoUpload = async (index: number, file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = [...wizardSponsors()];
      if (!next[index]) next[index] = { name: '', logo: '' };
      setWizardSponsors(next);
    };
    reader.readAsDataURL(file);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('file', compressed);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const next = [...wizardSponsors()];
      if (!next[index]) next[index] = { name: '', logo: '' };
      next[index].logo = data.url;
      setWizardSponsors(next);
    } catch (err) {
      console.error('Sponsor logo upload error:', err);
      alert('Failed to upload sponsor logo');
    }
  };

  const addMediaPartner = () => setWizardMediaPartners([...wizardMediaPartners(), { name: '', logo: '' }]);
  const updateMediaPartner = (index: number, field: keyof EventMediaPartner, value: string) => {
    const next = [...wizardMediaPartners()];
    if (!next[index]) next[index] = { name: '', logo: '' };
    next[index] = { ...next[index], [field]: value };
    setWizardMediaPartners(next);
  };
  const removeMediaPartner = (index: number) => setWizardMediaPartners(wizardMediaPartners().filter((_, i) => i !== index));
  const handleMediaPartnerLogoUpload = async (index: number, file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = [...wizardMediaPartners()];
      if (!next[index]) next[index] = { name: '', logo: '' };
      setWizardMediaPartners(next);
    };
    reader.readAsDataURL(file);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('file', compressed);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const next = [...wizardMediaPartners()];
      if (!next[index]) next[index] = { name: '', logo: '' };
      next[index].logo = data.url;
      setWizardMediaPartners(next);
    } catch (err) {
      console.error('Media partner logo upload error:', err);
      alert('Failed to upload media partner logo');
    }
  };

  const addOrganizingCommitteeMember = () => setWizardOrganizingCommittee([...wizardOrganizingCommittee(), { name: '', image: '', imagePreview: '', degree: '', specialization: '', country: '', biography: '', researchArea: '' }]);
  const updateOrganizingCommitteeMember = (index: number, field: keyof OrganizingCommitteeMember, value: string) => {
    const next = [...wizardOrganizingCommittee()];
    next[index] = { ...next[index], [field]: value };
    setWizardOrganizingCommittee(next);
  };
  const removeOrganizingCommitteeMember = (index: number) => setWizardOrganizingCommittee(wizardOrganizingCommittee().filter((_, i) => i !== index));
  const handleCommitteeMemberImageUpload = async (index: number, file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = [...wizardOrganizingCommittee()];
      next[index].imagePreview = String(reader.result || '');
      setWizardOrganizingCommittee(next);
    };
    reader.readAsDataURL(file);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('file', compressed);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const next = [...wizardOrganizingCommittee()];
      next[index].image = data.url;
      setWizardOrganizingCommittee(next);
    } catch (err) {
      console.error('Committee member image upload error:', err);
      alert('Failed to upload image');
    }
  };

  const addTrack = () =>
    setWizardTracks([...wizardTracks(), { title: '', description: '', image: '', imagePreview: '', referenceLinks: [] }]);
  const updateTrack = (index: number, field: 'title' | 'description', value: string) => {
    const next = [...wizardTracks()];
    next[index][field] = value;
    setWizardTracks(next);
  };
  const removeTrack = (index: number) => setWizardTracks(wizardTracks().filter((_, i) => i !== index));

  const addReferenceLink = (trackIndex: number) => {
    const next = [...wizardTracks()];
    next[trackIndex].referenceLinks = [...next[trackIndex].referenceLinks, { label: '', url: '' }];
    setWizardTracks(next);
  };
  const updateReferenceLink = (trackIndex: number, linkIndex: number, field: 'label' | 'url', value: string) => {
    const next = [...wizardTracks()];
    next[trackIndex].referenceLinks[linkIndex][field] = value;
    setWizardTracks(next);
  };
  const removeReferenceLink = (trackIndex: number, linkIndex: number) => {
    const next = [...wizardTracks()];
    next[trackIndex].referenceLinks = next[trackIndex].referenceLinks.filter((_, i) => i !== linkIndex);
    setWizardTracks(next);
  };

  const handleTrackImageUpload = async (trackIndex: number, file: File | null) => {
    if (!file || !user) return;
    setTrackImageLoading((prev) => ({ ...prev, [trackIndex]: true }));
    const reader = new FileReader();
    reader.onload = () => {
      const preview = String(reader.result || '');
      setWizardTracks((cur) => {
        const next = [...cur];
        next[trackIndex] = { ...next[trackIndex], imagePreview: preview };
        return next;
      });
    };
    reader.readAsDataURL(file);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setWizardTracks((cur) => {
        const next = [...cur];
        next[trackIndex] = { ...next[trackIndex], image: data.url };
        return next;
      });
    } catch (err) {
      console.error('Track image upload error:', err);
      alert('Failed to upload track image');
    } finally {
      setTrackImageLoading((prev) => ({ ...prev, [trackIndex]: false }));
    }
  };

  const handleMediaUpload = async (kind: 'brochure' | 'banner' | 'logo', file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = String(reader.result || '');
      setWizardMedia((cur: MediaAssetState) => ({ ...cur, [`${kind}Preview`]: preview }));
    };
    reader.readAsDataURL(file);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('file', compressed);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setWizardMedia((cur: MediaAssetState) => ({ ...cur, [`${kind}Url`]: data.url }));
    } catch (err) {
      console.error('Media upload error:', err);
      alert('Failed to upload file');
    }
  };

  const clearMedia = (kind: 'brochure' | 'banner' | 'logo') => {
    setWizardMedia((cur: MediaAssetState) => ({ ...cur, [`${kind}Url`]: '', [`${kind}Preview`]: '' }));
  };

  const handleHeaderBannerUpload = async (file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = String(reader.result || '');
      setWizardMedia((cur: MediaAssetState) => ({
        ...cur,
        headerBannersPreviews: [...(cur.headerBannersPreviews || []), preview],
      }));
    };
    reader.readAsDataURL(file);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('file', compressed);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setWizardMedia((cur: MediaAssetState) => ({
        ...cur,
        headerBanners: [...(cur.headerBanners || []), data.url],
      }));
    } catch (err) {
      console.error('Header banner upload error:', err);
      alert('Failed to upload header banner');
    }
  };

  const removeHeaderBanner = (index: number) => {
    setWizardMedia((cur: MediaAssetState) => ({
      ...cur,
      headerBanners: (cur.headerBanners || []).filter((_, i) => i !== index),
      headerBannersPreviews: (cur.headerBannersPreviews || []).filter((_, i) => i !== index),
    }));
  };

  const uploadHeaderBannerForEvent = async (eventId: string, eventType: 'conference', file: File) => {
    if (!file || !user || !eventId) return;
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('file', compressed);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const currentBanners = (eventPage as any)?.headerBanners || [];
      const updatedBanners = [...currentBanners, data.url];
      const ep = 'conferences';
      const patchRes = await fetch(`${API_BASE}/${ep}/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
        body: JSON.stringify({ headerBanners: updatedBanners }),
      });
      if (!patchRes.ok) throw new Error('Failed to update event header banners');
      const updatedEvent = await patchRes.json();
      setCurrentEvent(updatedEvent);
      refreshData();
    } catch (err) {
      console.error('Upload event header banner error:', err);
      alert('Failed to upload header banner');
    }
  };

  const removeHeaderBannerForEvent = async (eventId: string, eventType: 'conference', index: number) => {
    if (!user || !eventId) return;
    try {
      const currentBanners = (eventPage as any)?.headerBanners || [];
      const updatedBanners = currentBanners.filter((_: any, i: number) => i !== index);
      const ep = 'conferences';
      const patchRes = await fetch(`${API_BASE}/${ep}/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
        body: JSON.stringify({ headerBanners: updatedBanners }),
      });
      if (!patchRes.ok) throw new Error('Failed to update event header banners');
      const updatedEvent = await patchRes.json();
      setCurrentEvent(updatedEvent);
      refreshData();
    } catch (err) {
      console.error('Remove event header banner error:', err);
      alert('Failed to remove header banner');
    }
  };

  const handleBlogBannerUpload = async (file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => setBlogBannerPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('file', compressed);
      const res = await fetch(`${API_BASE}/uploads/upload`, {
        method: 'POST',
        headers: { 'x-user-role': user.role, 'x-user-name': user.username },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setBlogBannerUrl(data.url);
    } catch (err) {
      console.error('Blog banner upload error:', err);
      alert('Failed to upload blog banner');
    }
  };

  const canGoNext = () => {
    if (wizardStep === 1) {
      if (!wizardTitle().trim()) return false;
      if (!wizardSubdomain().trim()) return false;
      return true;
    }
    return true;
  };

  const canGoToStep = (target: number) => {
    if (target === 1) return true;
    if (!wizardTitle().trim()) return false;
    if (!wizardSubdomain().trim()) return false;
    return true;
  };

  const submitWizard = async () => {
    if (!user || !wizardType) return;
    setWizardSaving(true);
    setWizardError('');
    try {
      let url = `${API_BASE}/conferences`;
      let method = 'POST';
      if (wizardEditId) {
        url += `/${wizardEditId}`;
        method = 'PUT';
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-role': user.role,
        'x-user-name': user.username,
      };

      const { day, month } = computeDayAndMonth(wizardStartDate(), wizardEndDate());
      const location = wizardIsOnline()
        ? (wizardOnlineLink() ? `Online · ${wizardOnlineLink()}` : 'Online')
        : (wizardVenue() || '');

      const bodyData: any = {
        title: wizardTitle(),
        description: wizardDesc(),
        theme: wizardTheme(),
        day,
        month,
        location,
        venue: wizardIsOnline() ? '' : (wizardVenue() || ''),
        eventDate: wizardStartDate(),
        startDate: wizardStartDate(),
        endDate: wizardEndDate() || wizardStartDate(),
        subdomain: wizardSubdomain() || undefined,
        startTime: wizardStartTime(),
        endTime: wizardEndTime(),
        brochureUrl: wizardMedia().brochureUrl,
        bannerUrl: wizardMedia().bannerUrl,
        logoUrl: wizardMedia().logoUrl,
        headerBanners: wizardMedia().headerBanners || [],
        fees: wizardFees().filter((f) => f.label.trim() && f.amount > 0),
        tracks: wizardTracks().filter((t) => t.title.trim()).map((t) => ({
          title: t.title,
          description: t.description,
          image: t.image,
          referenceLinks: t.referenceLinks.filter((l) => l.url.trim()),
        })),
        organizerContact: wizardOrg(),
        assignedMentor: wizardMentor() || null,
        faqs: wizardFaqs().filter((f) => f.question.trim()),
        partners: wizardPartners().filter((p) => p.title.trim()),
        sponsors: wizardSponsors().filter((s) => s.name.trim()),
        mediaPartners: wizardMediaPartners().filter((m) => m.name.trim()),
        organizingCommittee: wizardOrganizingCommittee().filter((m) => (m.name || m.degree || m.specialization || m.country || m.biography || m.researchArea || m.image)),
        guidelines: wizardGuidelines(),
        termsAndConditions: wizardTerms(),
      };

      if (wizardTargetCohortId) {
        const res = await fetch(`${API_BASE}/cohorts/${wizardTargetCohortId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ content: bodyData }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to save cohort content');
        }
        closeWizard();
        await loadCohorts();
        await refreshEventCohortState();
        return;
      }

      const res = await fetch(url, { method, headers, body: JSON.stringify(bodyData) });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save event');
      }
      closeWizard();
      refreshData();
      goToTab('conferences');
    } catch (err: any) {
      console.error('Save wizard error:', err);
      setWizardError(err.message || 'Failed to save event');
    } finally {
      setWizardSaving(false);
    }
  };

  const handleSaveItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let url = '';
    let method = 'POST';
    let bodyData: any = {};

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-role': user.role,
      'x-user-name': user.username,
    };

    if (editingItemType === 'blog') {
      url = `${API_BASE}/blogs`;
      if (editingItemId) {
        url += `/${editingItemId}`;
        method = 'PUT';
      }
      bodyData = {
        title: blogTitle,
        label: blogLabel,
        copy: blogCopy,
        content: blogContent,
        bannerUrl: blogBannerUrl,
      };
    }

    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(bodyData) });
      if (res.ok) {
        setShowForm(false);
        refreshData();
      } else {
        const err = await res.json();
        alertModal({ title: 'Error', message: err.error || 'Failed to save item', type: 'danger' });
      }
    } catch (err) {
      console.error(err);
      alertModal({ title: 'Error', message: 'Network error while saving item', type: 'danger' });
    }
  };

  const handleDeleteItem = async (id: string, type: DeleteType) => {
    if (!user) return;
    const ok = await confirmModal({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
    });
    if (!ok) return;

    const headers: Record<string, string> = {
      'x-user-role': user.role,
      'x-user-name': user.username,
    };

    try {
      const res = await fetch(`${API_BASE}/${type}/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        refreshData();
      } else {
        const err = await res.json();
        alertModal({ title: 'Error', message: err.error || 'Failed to delete item', type: 'danger' });
      }
    } catch (err) {
      console.error(err);
      alertModal({ title: 'Error', message: 'Network error while deleting item', type: 'danger' });
    }
  };

  const openPartnerForm = (item: MediaPartner | null) => {
    setPartnerForm(
      item
        ? { open: true, editingId: item._id, name: item.name, logo: item.logo || '', logoPreview: mediaUrl(item.logo || ''), description: item.description || '' }
        : { open: true, editingId: null, name: '', logo: '', logoPreview: '', description: '' },
    );
  };

  const savePartner = async () => {
    if (!user) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username };
    const url = partnerForm.editingId ? `${API_BASE}/media-partners/${partnerForm.editingId}` : `${API_BASE}/media-partners`;
    const method = partnerForm.editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify({ name: partnerForm.name, logo: partnerForm.logo, description: partnerForm.description }) });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save');
      setPartnerForm(EMPTY_PARTNER_FORM);
      refreshData();
    } catch (err: any) {
      alertModal({ title: 'Error', message: err.message || 'Failed to save media partner', type: 'danger' });
    }
  };

  const deletePartner = async (id: string) => {
    if (!user) return;
    const ok = await confirmModal({
      title: 'Delete Media Partner',
      message: 'Are you sure you want to delete this media partner?',
      type: 'danger',
      confirmText: 'Delete',
    });
    if (!ok) return;
    await fetch(`${API_BASE}/media-partners/${id}`, { method: 'DELETE', headers: { 'x-user-role': user.role, 'x-user-name': user.username } });
    refreshData();
  };

  const openCollaboratorForm = (item: Collaborator | null) => {
    setCollaboratorForm(
      item
        ? { open: true, editingId: item._id, name: item.name, logo: item.logo || '', logoPreview: mediaUrl(item.logo || ''), description: item.description || '' }
        : { open: true, editingId: null, name: '', logo: '', logoPreview: '', description: '' },
    );
  };

  const saveCollaborator = async () => {
    if (!user) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username };
    const url = collaboratorForm.editingId ? `${API_BASE}/collaborators/${collaboratorForm.editingId}` : `${API_BASE}/collaborators`;
    const method = collaboratorForm.editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify({ name: collaboratorForm.name, logo: collaboratorForm.logo, description: collaboratorForm.description }) });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save');
      setCollaboratorForm(EMPTY_PARTNER_FORM);
      refreshData();
    } catch (err: any) {
      alertModal({ title: 'Error', message: err.message || 'Failed to save collaborator', type: 'danger' });
    }
  };

  const deleteCollaborator = async (id: string) => {
    if (!user) return;
    const ok = await confirmModal({
      title: 'Delete Collaborator',
      message: 'Are you sure you want to delete this collaborator?',
      type: 'danger',
      confirmText: 'Delete',
    });
    if (!ok) return;
    await fetch(`${API_BASE}/collaborators/${id}`, { method: 'DELETE', headers: { 'x-user-role': user.role, 'x-user-name': user.username } });
    refreshData();
  };

  const openExhibitorForm = (item: Exhibitor | null) => {
    setExhibitorForm(
      item
        ? { open: true, editingId: item._id, name: item.name, logo: item.logo || '', logoPreview: mediaUrl(item.logo || ''), description: item.description || '' }
        : { open: true, editingId: null, name: '', logo: '', logoPreview: '', description: '' },
    );
  };

  const saveExhibitor = async () => {
    if (!user) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username };
    const url = exhibitorForm.editingId ? `${API_BASE}/exhibitors/${exhibitorForm.editingId}` : `${API_BASE}/exhibitors`;
    const method = exhibitorForm.editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify({ name: exhibitorForm.name, logo: exhibitorForm.logo, description: exhibitorForm.description }) });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save');
      setExhibitorForm(EMPTY_PARTNER_FORM);
      refreshData();
    } catch (err: any) {
      alertModal({ title: 'Error', message: err.message || 'Failed to save exhibitor', type: 'danger' });
    }
  };

  const deleteExhibitor = async (id: string) => {
    if (!user) return;
    const ok = await confirmModal({
      title: 'Delete Exhibitor',
      message: 'Are you sure you want to delete this exhibitor?',
      type: 'danger',
      confirmText: 'Delete',
    });
    if (!ok) return;
    await fetch(`${API_BASE}/exhibitors/${id}`, { method: 'DELETE', headers: { 'x-user-role': user.role, 'x-user-name': user.username } });
    refreshData();
  };

  const openVenueForm = (item: Venue | null) => {
    setVenueForm(
      item
        ? { open: true, editingId: item._id, name: item.name, address: item.address || '', locationUrl: item.locationUrl || '' }
        : { open: true, editingId: null, name: '', address: '', locationUrl: '' },
    );
  };

  const saveVenue = async () => {
    if (!user) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username };
    const url = venueForm.editingId ? `${API_BASE}/venues/${venueForm.editingId}` : `${API_BASE}/venues`;
    const method = venueForm.editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify({ name: venueForm.name, address: venueForm.address, locationUrl: venueForm.locationUrl }) });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to save venue (${res.status})`);
      }
      const saved = await res.json();
      setVenueForm(EMPTY_VENUE_FORM);
      delete lastFetched.current['tab:venues'];
      delete lastFetched.current['wizard:venues'];
      if (venueForm.editingId) {
        setVenues(prev => prev.map(v => v._id === saved._id ? saved : v));
      } else {
        setVenues(prev => [...prev, saved]);
      }
      await ensureMentorsAndVenues(true);
      refreshData();
    } catch (err: any) {
      console.error('Save venue error:', err);
      alertModal({ title: 'Error', message: err.message || 'Failed to save venue', type: 'danger' });
    }
  };

  const deleteVenue = async (id: string) => {
    if (!user) return;
    const ok = await confirmModal({
      title: 'Delete Venue',
      message: 'Are you sure you want to delete this venue?',
      type: 'danger',
      confirmText: 'Delete',
    });
    if (!ok) return;
    await fetch(`${API_BASE}/venues/${id}`, { method: 'DELETE', headers: { 'x-user-role': user.role, 'x-user-name': user.username } });
    delete lastFetched.current['tab:venues'];
    delete lastFetched.current['wizard:venues'];
    setVenues(prev => prev.filter(v => v._id !== id));
    await ensureMentorsAndVenues(true);
    refreshData();
  };

  const toggleVenueStatus = async (id: string, currentStatus?: boolean) => {
    if (!user) return;
    const nextStatus = currentStatus === false ? true : false;
    const ok = await confirmModal({
      title: nextStatus ? 'Enable Venue' : 'Disable Venue',
      message: nextStatus
        ? 'Are you sure you want to enable this venue? It will become selectable for new conferences.'
        : 'Are you sure you want to disable this venue? It will no longer be selectable for new conferences, but existing conferences using it will remain intact.',
      type: nextStatus ? 'info' : 'danger',
      confirmText: nextStatus ? 'Enable' : 'Disable',
    });
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE}/venues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update venue status');
      const updated = await res.json();
      delete lastFetched.current['tab:venues'];
      delete lastFetched.current['wizard:venues'];
      setVenues(prev => prev.map(v => v._id === updated._id ? updated : v));
      await ensureMentorsAndVenues(true);
      refreshData();
    } catch (err: any) {
      console.error('Toggle venue status error:', err);
      alertModal({ title: 'Error', message: err.message || 'Failed to update venue status', type: 'danger' });
    }
  };

  const loadGalleryItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/gallery`);
      if (res.ok) {
        setGalleryItems(await res.json());
      }
    } catch (e) {
      console.error('Failed to load gallery items:', e);
    }
  };

  const addGalleryItem = async (title: string, description: string, image: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
        body: JSON.stringify({ title, description, image }),
      });
      if (!res.ok) throw new Error('Failed to create gallery item');
      await loadGalleryItems();
      return true;
    } catch (err) {
      console.error('Add gallery item error:', err);
      return false;
    }
  };

  const deleteGalleryItem = async (id: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
      });
      if (!res.ok) throw new Error('Failed to delete gallery item');
      await loadGalleryItems();
      return true;
    } catch (err) {
      console.error('Delete gallery item error:', err);
      return false;
    }
  };

  const loadMainBrochure = async () => {
    try {
      const res = await fetch(`${API_BASE}/brochure/main`);
      if (res.ok) {
        const data = await res.json();
        setMainBrochure(data);
      } else {
        setMainBrochure(null);
      }
    } catch (e) {
      console.error('Failed to load main brochure:', e);
      setMainBrochure(null);
    }
  };

  const saveMainBrochure = async (
    fileUrlOrData: string | { title?: string; fileUrl: string; fileName?: string },
    fileName?: string,
    title?: string
  ): Promise<boolean> => {
    if (!user) return false;
    let payload: { title: string; fileUrl: string; fileName: string };
    if (typeof fileUrlOrData === 'string') {
      payload = {
        fileUrl: fileUrlOrData,
        fileName: fileName || 'brochure.pdf',
        title: title || 'Official Conference Brochure',
      };
    } else {
      payload = {
        fileUrl: fileUrlOrData.fileUrl,
        fileName: fileUrlOrData.fileName || fileName || 'brochure.pdf',
        title: fileUrlOrData.title || title || 'Official Conference Brochure',
      };
    }

    try {
      const res = await fetch(`${API_BASE}/brochure/main`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        setMainBrochure(saved);
        return true;
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.error('Save main brochure failed:', res.status, errJson);
      }
    } catch (e) {
      console.error('Failed to save main brochure:', e);
    }
    return false;
  };

  const deleteMainBrochure = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/brochure/main`, {
        method: 'DELETE',
        headers: {
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
      });
      if (res.ok) {
        setMainBrochure(null);
        return true;
      }
    } catch (e) {
      console.error('Failed to delete main brochure:', e);
    }
    return false;
  };

  const loadAbstractTemplate = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/abstract-template/main`, {
        headers: {
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAbstractTemplate(data || null);
      }
    } catch (e) {
      console.error('Failed to load abstract template:', e);
    }
  };

  const saveAbstractTemplate = async (
    fileUrlOrData: string | { title?: string; fileUrl: string; fileName?: string },
    fileName?: string,
    title?: string
  ): Promise<boolean> => {
    if (!user) return false;
    let payload: { title: string; fileUrl: string; fileName: string };
    if (typeof fileUrlOrData === 'string') {
      payload = {
        fileUrl: fileUrlOrData,
        fileName: fileName || 'abstract-template.docx',
        title: title || 'Official Abstract Submission Template',
      };
    } else {
      payload = {
        fileUrl: fileUrlOrData.fileUrl,
        fileName: fileUrlOrData.fileName || fileName || 'abstract-template.docx',
        title: fileUrlOrData.title || title || 'Official Abstract Submission Template',
      };
    }

    try {
      const res = await fetch(`${API_BASE}/abstract-template/main`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        setAbstractTemplate(saved);
        return true;
      }
    } catch (e) {
      console.error('Failed to save abstract template:', e);
    }
    return false;
  };

  const deleteAbstractTemplate = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE}/abstract-template/main`, {
        method: 'DELETE',
        headers: {
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
      });
      if (res.ok) {
        setAbstractTemplate(null);
        return true;
      }
    } catch (e) {
      console.error('Failed to delete abstract template:', e);
    }
    return false;
  };

  const handleLogoUpload = (kind: LogoKind, file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const preview = String(reader.result || '');
      if (kind === 'partner') setPartnerForm((cur) => ({ ...cur, logoPreview: preview }));
      else if (kind === 'collaborator') setCollaboratorForm((cur) => ({ ...cur, logoPreview: preview }));
      else setExhibitorForm((cur) => ({ ...cur, logoPreview: preview }));
    };
    reader.readAsDataURL(file);
    (async () => {
      try {
        const compressed = await compressImage(file);
        const fd = new FormData();
        fd.append('file', compressed);
        const res = await fetch(`${API_BASE}/uploads/upload`, { method: 'POST', headers: { 'x-user-role': user.role, 'x-user-name': user.username }, body: fd });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        if (kind === 'partner') setPartnerForm((cur) => ({ ...cur, logo: data.url }));
        else if (kind === 'collaborator') setCollaboratorForm((cur) => ({ ...cur, logo: data.url }));
        else setExhibitorForm((cur) => ({ ...cur, logo: data.url }));
      } catch (err) {
        console.error('Logo upload error:', err);
        alert('Failed to upload logo');
      }
    })();
  };

  const saveProfile = async () => {
    if (!user) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username };
    try {
      const res = await fetch(`${API_BASE}/mentors/me`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          fullName: profileForm.fullName,
          title: profileForm.title,
          bio: profileForm.bio,
          avatar: profileForm.avatar,
          email: profileForm.email,
          phone: profileForm.phone,
          location: profileForm.location,
          linkedin: profileForm.linkedin,
          website: profileForm.website,
          expertise: profileForm.expertise,
          education: profileForm.education,
          experiences: profileForm.experiences,
          certifications: profileForm.certifications,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save profile');
      alertModal({ title: 'Profile Updated', message: 'Your profile has been saved successfully.', type: 'success' });
      refreshData();
    } catch (err: any) {
      alertModal({ title: 'Error', message: err.message || 'Failed to save profile', type: 'danger' });
    }
  };

  const handleProfileAvatarUpload = async (file: File | null) => {
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => setProfileForm((cur) => ({ ...cur, avatarPreview: String(reader.result || '') }));
    reader.readAsDataURL(file);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('file', compressed);
      const res = await fetch(`${API_BASE}/uploads/upload`, { method: 'POST', headers: { 'x-user-role': user.role, 'x-user-name': user.username }, body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setProfileForm((cur) => ({ ...cur, avatar: data.url }));
    } catch (err) {
      alertModal({ title: 'Upload Failed', message: 'Failed to upload avatar image', type: 'danger' });
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!user) return;
    const headers: Record<string, string> = { 'Content-Type': 'application/json', 'x-user-role': user.role, 'x-user-name': user.username };
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to change password');
      alertModal({ title: 'Success', message: 'Password changed successfully', type: 'success' });
      
      const updated = { ...user, isTempPassword: false };
      setUser(updated);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(updated));
    } catch (err: any) {
      alertModal({ title: 'Error', message: err.message || 'Failed to change password', type: 'danger' });
      throw err;
    }
  };

  const closeForm = () => setShowForm(false);

  const openAssignMentor = (item: Conference) => {
    setAssignTarget(item);
    setAssignUsername(item.assignedMentor || '');
    setAssignOpen(true);
    ensureMentorsAndVenues();
  };

  const closeAssignMentor = () => {
    setAssignOpen(false);
    setAssignTarget(null);
    setAssignUsername('');
  };

  const submitAssignMentor = async () => {
    if (!user || !assignTarget) return;
    const endpoint = 'conferences';
    try {
      const res = await fetch(`${API_BASE}/${endpoint}/${assignTarget._id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': user.role,
          'x-user-name': user.username,
        },
        body: JSON.stringify({ assignedMentor: assignUsername || null }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to assign mentor');
      }
      closeAssignMentor();
      refreshData();
    } catch (err: any) {
      console.error('Assign mentor error:', err);
      alert(err.message || 'Failed to assign mentor');
    }
  };

  const value: AppStoreValue = {
    user,
    loginLoading,
    loginError,
    usernameInput,
    passwordInput,
    setUsernameInput,
    setPasswordInput,
    handleLogin,
    handleLogout,
    activeTab,
    goToTab,
    isEventPage,
    eventPageType,
    eventPageId,
    eventPageTab,
    eventPage,
    currentEventLoading,
    eventPageMode,
    isAddMode,
    setEventPageMode,
    openEventPage,
    createDraftEvent,
    navigateToAddEvent,
    closeEventPage,
    updateEventField,
    updateEventFields,
    eventCohortId,
    activeCohort,
    openCohortTab,
    openCohortTabEdit,
    openEventTab,
    loadingData,
    dashboardStats,
    conferences,
    blogs,
    registrations,
    abstracts,
    contacts,
    orders,
    mediaPartners,
    collaborators,
    exhibitors,
    venues,
    galleryItems,
    profile,
    mentors,
    ensureMentorsAndVenues,
    refreshData,
    loadTabData,
    loadGalleryItems,
    addGalleryItem,
    deleteGalleryItem,
    mainBrochure,
    loadMainBrochure,
    saveMainBrochure,
    deleteMainBrochure,
    abstractTemplate,
    loadAbstractTemplate,
    saveAbstractTemplate,
    deleteAbstractTemplate,
    showForm,
    editingItemType,
    editingItemId,
    openAddForm,
    openEditForm,
    closeForm,
    handleSaveItem,
    handleDeleteItem,
    activeDropdownId,
    setActiveDropdownId,
    wizardOpen,
    wizardType,
    wizardStep,
    wizardEditId,
    wizardSaving,
    wizardError,
    setWizardStep,
    closeWizard,
    canGoNext,
    canGoToStep,
    submitWizard,
    openEditCohortContent,
    confTitle,
    setConfTitle,
    confDesc,
    setConfDesc,
    confLocation,
    setConfLocation,
    confStartDate,
    setConfStartDate,
    confEndDate,
    setConfEndDate,
    confIsOnline,
    setConfIsOnline,
    confVenue,
    setConfVenue,
    confSubdomain,
    setConfSubdomain,
    confOnlineLink,
    setConfOnlineLink,
    confStartTime,
    setConfStartTime,
    confEndTime,
    setConfEndTime,
    confFees,
    setConfFees,
    confOrg,
    setConfOrg,
    confMedia,
    setConfMedia,
    confTracks,
    setConfTracks,
    wizardTitle,
    setWizardTitle,
    wizardDesc,
    setWizardDesc,
    wizardTheme,
    setWizardTheme,
    wizardStartDate,
    setWizardStartDate,
    wizardEndDate,
    setWizardEndDate,
    wizardIsOnline,
    setWizardIsOnline,
    wizardVenue,
    setWizardVenue,
    wizardSubdomain,
    setWizardSubdomain,
    wizardOnlineLink,
    setWizardOnlineLink,
    wizardStartTime,
    setWizardStartTime,
    wizardEndTime,
    setWizardEndTime,
    wizardFees,
    setWizardFees,
    wizardOrg,
    setWizardOrg,
    wizardMentor,
    setWizardMentor,
    selectMentor,
    wizardMedia,
    setWizardMedia,
    wizardTracks,
    setWizardTracks,
    wizardFaqs,
    setWizardFaqs,
    wizardPartners,
    setWizardPartners,
    wizardSponsors,
    setWizardSponsors,
    wizardMediaPartners,
    setWizardMediaPartners,
    wizardOrganizingCommittee,
    setWizardOrganizingCommittee,
    wizardGuidelines,
    setWizardGuidelines,
    wizardTerms,
    setWizardTerms,
    addFeeRow,
    updateFeeRow,
    removeFeeRow,
    addTrack,
    updateTrack,
    removeTrack,
    addReferenceLink,
    updateReferenceLink,
    removeReferenceLink,
    addFaq,
    updateFaq,
    removeFaq,
    addPartner,
    updatePartner,
    removePartner,
    addSponsor,
    updateSponsor,
    removeSponsor,
    handleSponsorLogoUpload,
    addMediaPartner,
    updateMediaPartner,
    removeMediaPartner,
    handleMediaPartnerLogoUpload,
    addOrganizingCommitteeMember,
    updateOrganizingCommitteeMember,
    removeOrganizingCommitteeMember,
    handleCommitteeMemberImageUpload,
    handleTrackImageUpload,
    trackImageLoading,
    handleMediaUpload,
    clearMedia,
    handleHeaderBannerUpload,
    removeHeaderBanner,
    uploadHeaderBannerForEvent,
    removeHeaderBannerForEvent,
    blogTitle,
    setBlogTitle,
    blogLabel,
    setBlogLabel,
    blogCopy,
    setBlogCopy,
    blogContent,
    setBlogContent,
    blogBannerUrl,
    setBlogBannerUrl,
    blogBannerPreview,
    setBlogBannerPreview,
    handleBlogBannerUpload,
    partnerForm,
    setPartnerForm,
    collaboratorForm,
    setCollaboratorForm,
    exhibitorForm,
    setExhibitorForm,
    venueForm,
    setVenueForm,
    openPartnerForm,
    savePartner,
    deletePartner,
    openCollaboratorForm,
    saveCollaborator,
    deleteCollaborator,
    openExhibitorForm,
    saveExhibitor,
    deleteExhibitor,
    openVenueForm,
    saveVenue,
    deleteVenue,
    toggleVenueStatus,
    handleLogoUpload,
    profileForm,
    setProfileForm,
    saveProfile,
    handleProfileAvatarUpload,
    changePassword,
    eventDashboard,
    eventParticipants,
    eventPayments,
    eventDetailLoading,
    eventDetailError,
    eventAbstracts,
    eventEnquiries,
    eventAbstractsLoading,
    eventEnquiriesLoading,
    eventBrochureLeads,
    eventBrochureLeadsLoading,
    abstractActionLoading,
    handleAbstractAction,
    viewingParticipant,
    setViewingParticipant,
    eventCohorts,
    eventCohortsLoading,
    loadCohorts,
    createCohort,
    updateCohort,
    setCurrentCohort,
    deleteCohort,
    assignCohortMentor,
    assignOpen,
    assignTarget,
    assignUsername,
    openAssignMentor,
    closeAssignMentor,
    setAssignUsername,
    submitAssignMentor,
    chatSessions,
    activeChatId,
    activeChatMessages,
    chatLoading,
    loadChatSessions,
    setActiveChatId: selectChat,
    sendChatReply,
    markChatRead,
    setChatStatus,
    modalState,
    confirmModal,
    alertModal,
    closeModal,
    imagePreviewState,
    openImagePreview,
    closeImagePreview,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}
